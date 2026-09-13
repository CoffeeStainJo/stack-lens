import type { ParsedException, ParsedStackTrace, StackFrame } from './types';

const FRAMEWORK_PREFIXES = [
  'java.',
  'javax.',
  'jakarta.',
  'jdk.',
  'sun.',
  'com.sun.',
  'kotlin.',
  'kotlinx.',
  'scala.',
  'org.springframework.',
  'org.apache.',
  'org.hibernate.',
  'org.eclipse.',
  'org.jboss.',
  'org.junit.',
  'org.mockito.',
  'org.testng.',
  'org.slf4j.',
  'org.aspectj.',
  'org.thymeleaf.',
  'org.postgresql.',
  'org.h2.',
  'io.netty.',
  'io.micrometer.',
  'io.undertow.',
  'io.grpc.',
  'io.vertx.',
  'io.reactivex.',
  'reactor.',
  'ch.qos.logback.',
  'com.fasterxml.',
  'com.google.',
  'com.zaxxer.',
  'com.mysql.',
  'com.microsoft.sqlserver.',
  'net.bytebuddy.',
  'feign.',
  'okhttp3.',
  'retrofit2.',
  'android.',
  'androidx.',
  'dalvik.',
];

export function isJavaFramework(fullName: string): boolean {
  return FRAMEWORK_PREFIXES.some((p) => fullName.startsWith(p));
}

const FRAME_RE = /^\s*at\s+(?:[\w.$]+\/)?([\w.$<>]+)\.([\w<>$]+)\(([^)]*)\)(?:\s*~?\[.*\])?\s*$/;
const MORE_RE = /^\s*\.\.\.\s*(\d+)\s+(?:more|common frames omitted)\s*$/;
const CAUSED_RE = /^\s*Caused by:\s*(.*)$/;
const SUPPRESSED_RE = /^\s*Suppressed:\s*(.*)$/;
const HEADER_RE = /^(?:Exception in thread\s+"[^"]*"\s+)?([A-Za-z_][\w.$]*)(?::\s?(.*))?$/;

function parseSource(src: string): { file?: string; line?: number } {
  if (!src || /Native Method|Unknown Source/.test(src)) return {};
  const m = /^(.+?)(?::(\d+))?$/.exec(src.trim());
  if (!m) return {};
  return { file: m[1], line: m[2] ? Number(m[2]) : undefined };
}

export function parseJava(raw: string): ParsedStackTrace {
  const lines = raw.replace(/\r\n?/g, '\n').split('\n');
  const exceptions: ParsedException[] = [];
  const st: { current: ParsedException | null } = { current: null };
  let frameId = 0;

  const push = (text: string) => {
    const m = HEADER_RE.exec(text.trim());
    st.current = m
      ? { type: m[1], message: (m[2] ?? '').trim(), frames: [] }
      : { type: 'Throwable', message: text.trim(), frames: [] };
    exceptions.push(st.current);
  };

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const caused = CAUSED_RE.exec(line);
    if (caused) {
      push(caused[1]);
      continue;
    }
    if (SUPPRESSED_RE.test(line)) {
      if (st.current) st.current.message += `\n${trimmed}`;
      continue;
    }

    const fm = FRAME_RE.exec(line);
    if (fm) {
      if (!st.current) push('Throwable');
      const [, classPath, method, src] = fm;
      const dot = classPath.lastIndexOf('.');
      const className = dot >= 0 ? classPath.slice(dot + 1) : classPath;
      const namespace = dot >= 0 ? classPath.slice(0, dot) : undefined;
      const { file, line: ln } = parseSource(src);
      const frame: StackFrame = {
        id: `f${frameId++}`,
        raw: trimmed,
        namespace,
        className,
        method,
        file,
        line: ln,
        isFramework: isJavaFramework(classPath + '.' + method),
        isAsync: false,
      };
      st.current!.frames.push(frame);
      continue;
    }

    const more = MORE_RE.exec(line);
    if (more && st.current) {
      st.current.elided = Number(more[1]);
      continue;
    }

    if (!st.current || st.current.frames.length > 0) {
      push(line);
    } else {
      st.current.message = (st.current.message + '\n' + trimmed).trim();
    }
  }

  return { language: 'java', exceptions, raw };
}
