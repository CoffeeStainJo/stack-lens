import type { ParsedException, ParsedStackTrace, StackFrame } from './types';

const FRAMEWORK_PATH_PATTERNS = [
  /node_modules/,
  /^node:/,
  /^internal[\\/]/,
  /^native$/,
  /^<anonymous>$/,
  /webpack[\\/]/,
  /[\\/]_next[\\/]/,
  /[\\/]\.next[\\/]/,
  /[\\/]\.vite[\\/]/,
  /react-dom/,
  /^chrome-extension:/,
];

const FRAMEWORK_METHODS = [
  /^process\.processTicksAndRejections$/,
  /^process\.processImmediate$/,
  /^(?:new )?Promise(?:\.|$)/,
  /^Array\./,
  /^Function\./,
  /^Generator\./,
  /^listOnTimeout$/,
  /^runNextTicks$/,
  /^runMicrotasks$/,
  /^Module\._/,
  /^Timeout\._onTimeout$/,
];

export function isJsFramework(file: string | undefined, fullName: string): boolean {
  if (file && FRAMEWORK_PATH_PATTERNS.some((re) => re.test(file))) return true;
  if (!file || /^index \d+$/.test(file)) {
    return FRAMEWORK_METHODS.some((re) => re.test(fullName)) || !file;
  }
  return false;
}

const V8_FRAME_RE = /^\s*at\s+(?:async\s+)?(.+?)\s+\((.+)\)\s*$/;
const V8_LOCATION_ONLY_RE = /^\s*at\s+(?:async\s+)?(.+?)\s*$/;
const FF_FRAME_RE = /^([^@\s]*)@(.+)$/;
const LOCATION_RE = /^(.*?)(?::(\d+))?(?::(\d+))?$/;
const HEADER_RE = /^(?:Uncaught\s+(?:\(in promise\)\s+)?)?([A-Z][\w$.]*)(?::\s?(.*))?$/;
const CAUSE_RE = /^\s*\[cause\]:\s*(.*)$/;

function parseLocation(loc: string): { file?: string; line?: number; column?: number } {
  const clean = loc.replace(/^eval at .*?, /, '').trim();
  if (/^(?:native|<anonymous>|index \d+)$/.test(clean)) return { file: clean };
  const m = LOCATION_RE.exec(clean);
  if (!m) return { file: clean };
  return {
    file: m[1] || undefined,
    line: m[2] ? Number(m[2]) : undefined,
    column: m[3] ? Number(m[3]) : undefined,
  };
}

function splitJsName(name: string): { namespace?: string; className?: string; method: string } {
  let n = name.trim();
  let prefix = '';
  if (n.startsWith('new ')) {
    prefix = 'new ';
    n = n.slice(4);
  }
  n = n.replace(/\s+\[as \w+\]$/, '');
  const idx = n.lastIndexOf('.');
  if (idx < 0) return { method: prefix + n };
  const method = prefix + n.slice(idx + 1);
  const cls = n.slice(0, idx);
  const clsIdx = cls.lastIndexOf('.');
  if (clsIdx < 0) return { className: cls, method };
  return { namespace: cls.slice(0, clsIdx), className: cls.slice(clsIdx + 1), method };
}

export function parseJavaScript(raw: string): ParsedStackTrace {
  const lines = raw.replace(/\r\n?/g, '\n').split('\n');
  const exceptions: ParsedException[] = [];
  const st: { current: ParsedException | null } = { current: null };
  let frameId = 0;

  const push = (type: string, message: string) => {
    st.current = { type, message, frames: [] };
    exceptions.push(st.current);
  };

  const addFrame = (
    rawLine: string,
    fnName: string | undefined,
    loc: { file?: string; line?: number; column?: number },
    isAsync: boolean,
  ) => {
    if (!st.current) push('Error', '');
    const names = fnName ? splitJsName(fnName) : { method: '<anonymous>' };
    const fullName = [names.namespace, names.className, names.method].filter(Boolean).join('.');
    const frame: StackFrame = {
      id: `f${frameId++}`,
      raw: rawLine,
      ...names,
      file: loc.file,
      line: loc.line,
      column: loc.column,
      isFramework: isJsFramework(loc.file, fullName),
      isAsync,
    };
    st.current!.frames.push(frame);
  };

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const cause = CAUSE_RE.exec(line);
    if (cause) {
      const hm = HEADER_RE.exec(cause[1].trim());
      if (hm) push(hm[1], hm[2] ?? '');
      else push('Error', cause[1]);
      continue;
    }

    const isAsync = /^\s*at\s+async\s/.test(line);
    const v8 = V8_FRAME_RE.exec(line);
    if (v8) {
      addFrame(trimmed, v8[1], parseLocation(v8[2]), isAsync);
      continue;
    }
    if (/^\s*at\s/.test(line)) {
      const m = V8_LOCATION_ONLY_RE.exec(line)!;
      addFrame(trimmed, undefined, parseLocation(m[1]), isAsync);
      continue;
    }
    const ff = FF_FRAME_RE.exec(trimmed);
    if (ff && /:\d+/.test(ff[2])) {
      addFrame(trimmed, ff[1] || undefined, parseLocation(ff[2]), false);
      continue;
    }

    const hm = HEADER_RE.exec(trimmed);
    if (hm && (!st.current || st.current.frames.length > 0)) {
      push(hm[1], hm[2] ?? '');
      continue;
    }
    if (st.current) st.current.message = (st.current.message + '\n' + trimmed).trim();
    else push('Error', trimmed);
  }

  return { language: 'javascript', exceptions, raw };
}
