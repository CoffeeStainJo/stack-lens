import type { ParsedException, ParsedStackTrace, StackFrame } from './types';

const FRAMEWORK_PATH_PATTERNS = [
  /site-packages/i,
  /dist-packages/i,
  /^<frozen /,
  /[\\/]lib[\\/]python\d/i,
  /[\\/]Python\d+[\\/]Lib[\\/]/i,
  /[\\/]importlib[\\/]/,
  /[\\/]asyncio[\\/]/,
  /[\\/]runpy\.py$/,
  /[\\/]threading\.py$/,
  /[\\/]concurrent[\\/]futures/,
  /[\\/]unittest[\\/]/,
  /[\\/]_pytest[\\/]/,
  /[\\/]pluggy[\\/]/,
  /[\\/]uvicorn[\\/]/,
  /[\\/]starlette[\\/]/,
  /[\\/]fastapi[\\/]/,
  /[\\/]anyio[\\/]/,
  /[\\/]django[\\/]/,
  /[\\/]flask[\\/]/,
  /[\\/]werkzeug[\\/]/,
  /[\\/]sqlalchemy[\\/]/,
  /[\\/]celery[\\/]/,
  /[\\/]gunicorn[\\/]/,
];

export function isPythonFramework(file: string): boolean {
  return FRAMEWORK_PATH_PATTERNS.some((re) => re.test(file));
}

const TRACEBACK_RE = /^Traceback \(most recent call last\):$/;
const FRAME_RE = /^\s*File "(.+?)", line (\d+)(?:, in (.+))?\s*$/;
const CHAIN_RE =
  /^(?:During handling of the above exception, another exception occurred:|The above exception was the direct cause of the following exception:)$/;
const CARET_RE = /^\s*[~^]+\s*$/;
const EXC_RE = /^([A-Za-z_][\w.]*)(?::\s?(.*))?$/;

function derivePythonNames(file: string, func: string | undefined) {
  const base = file.split(/[\\/]/).pop() ?? file;
  const moduleName = base.replace(/\.pyw?$/, '');
  return { namespace: moduleName, method: func ?? '<module>' };
}

export function parsePython(raw: string): ParsedStackTrace {
  const lines = raw.replace(/\r\n?/g, '\n').split('\n');
  const blocks: ParsedException[] = [];
  let frames: StackFrame[] = [];
  let pending: StackFrame | null = null;
  let frameId = 0;
  let inTraceback = false;
  const st: { lastExc: ParsedException | null } = { lastExc: null };

  const finishBlock = (type: string, message: string) => {
    // Python prints outermost call first; we want the failing frame first.
    const exc: ParsedException = { type, message, frames: [...frames].reverse() };
    blocks.push(exc);
    st.lastExc = exc;
    frames = [];
    pending = null;
    inTraceback = false;
  };

  for (const line of lines) {
    const trimmed = line.trim();
    if (TRACEBACK_RE.test(trimmed)) {
      inTraceback = true;
      st.lastExc = null;
      continue;
    }
    if (CHAIN_RE.test(trimmed)) {
      st.lastExc = null;
      continue;
    }
    if (!trimmed) continue;

    const fm = FRAME_RE.exec(line);
    if (fm) {
      const [, file, lineNo, func] = fm;
      const names = derivePythonNames(file, func);
      pending = {
        id: `f${frameId++}`,
        raw: trimmed,
        namespace: names.namespace,
        method: names.method,
        file,
        line: Number(lineNo),
        isFramework: isPythonFramework(file),
        isAsync: false,
      };
      frames.push(pending);
      inTraceback = true;
      continue;
    }

    if (CARET_RE.test(line)) continue;

    if (pending && /^\s/.test(line)) {
      // Source snippet line belongs to the pending frame.
      if (!pending.sourceLine) {
        pending.sourceLine = trimmed;
        pending.raw += '\n' + trimmed;
      }
      continue;
    }

    if (inTraceback || frames.length) {
      const em = EXC_RE.exec(trimmed);
      if (em) {
        finishBlock(em[1], (em[2] ?? '').trim());
        continue;
      }
    }

    // Message continuation for the most recent exception.
    if (st.lastExc && !/^\s/.test(line)) {
      st.lastExc.message = (st.lastExc.message + '\n' + trimmed).trim();
    }
  }

  if (frames.length) finishBlock('Exception', '');

  // Python prints the cause first and the outermost exception last; normalise to outermost-first.
  return { language: 'python', exceptions: blocks.reverse(), raw };
}
