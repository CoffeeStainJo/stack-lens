import type { ParsedException, ParsedStackTrace, StackFrame } from './types';

const FRAMEWORK_CRATES = new Set([
  'std',
  'core',
  'alloc',
  'tokio',
  'futures',
  'futures_util',
  'futures_core',
  'hyper',
  'axum',
  'tower',
  'tower_http',
  'actix_web',
  'actix_rt',
  'rayon',
  'rayon_core',
  'serde',
  'serde_json',
  'test',
  'backtrace',
  'panic_unwind',
  'rustc_demangle',
  'mio',
]);

export function isRustFramework(symbol: string, file?: string): boolean {
  if (file && (/^\/rustc\//.test(file) || /[\\/]\.cargo[\\/]registry[\\/]/.test(file) || /[\\/]rustlib[\\/]/.test(file))) {
    return true;
  }
  if (/^(?:rust_begin_unwind|__rust_|_start$|main$|__libc_start|start_thread|clone$)/.test(symbol)) return true;
  if (/^<unknown>/.test(symbol)) return true;
  const crate = symbol.replace(/^<+/, '').split('::')[0];
  return FRAMEWORK_CRATES.has(crate);
}

const PANIC_OLD_RE = /^thread '([^']*)' panicked at '(.*)', (.+?):(\d+):(\d+)$/;
const PANIC_NEW_RE = /^thread '([^']*)' panicked at (.+?):(\d+):(\d+):?$/;
const FRAME_RE = /^\s*(\d+):\s+(?:0x[0-9a-f]+ - )?(.+?)\s*$/;
const AT_RE = /^\s+at\s+(.+?)(?::(\d+))?(?::(\d+))?\s*$/;
const NOTE_RE = /^note:/;
const BACKTRACE_RE = /^stack backtrace:$/;

function splitSymbol(symbol: string): { namespace?: string; className?: string; method: string } {
  let s = symbol.replace(/::h[0-9a-f]{16}$/, '');
  const asTrait = /^<(.+?) as (.+?)>::(.+)$/.exec(s);
  if (asTrait) {
    return { namespace: asTrait[2], className: asTrait[1], method: asTrait[3] };
  }
  s = s.replace(/^<(.+?)>::/, '$1::');
  const parts = s.split('::');
  const method = parts.pop() ?? s;
  const className = parts.pop();
  const namespace = parts.length ? parts.join('::') : undefined;
  return { namespace, className, method };
}

export function parseRust(raw: string): ParsedStackTrace {
  const lines = raw.replace(/\r\n?/g, '\n').split('\n');
  const exc: ParsedException = { type: 'panic', message: '', frames: [] };
  let frameId = 0;
  let pending: StackFrame | null = null;
  let messagePending = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    let m = PANIC_OLD_RE.exec(trimmed);
    if (m) {
      exc.type = `panic in '${m[1]}'`;
      exc.message = m[2];
      exc.location = `${m[3]}:${m[4]}:${m[5]}`;
      continue;
    }
    m = PANIC_NEW_RE.exec(trimmed);
    if (m) {
      exc.type = `panic in '${m[1]}'`;
      exc.location = `${m[2]}:${m[3]}:${m[4]}`;
      messagePending = true;
      continue;
    }
    if (NOTE_RE.test(trimmed) || BACKTRACE_RE.test(trimmed)) {
      messagePending = false;
      continue;
    }

    const fm = FRAME_RE.exec(line);
    if (fm) {
      const names = splitSymbol(fm[2]);
      pending = {
        id: `f${frameId++}`,
        raw: trimmed,
        ...names,
        isFramework: isRustFramework(fm[2]),
        isAsync: false,
      };
      exc.frames.push(pending);
      messagePending = false;
      continue;
    }

    const at = AT_RE.exec(line);
    if (at && pending) {
      pending.file = at[1];
      pending.line = at[2] ? Number(at[2]) : undefined;
      pending.column = at[3] ? Number(at[3]) : undefined;
      pending.raw += '\n' + trimmed;
      const symbol = pending.raw.split('\n')[0].replace(/^\d+:\s+/, '');
      pending.isFramework = isRustFramework(symbol, at[1]);
      continue;
    }

    if (messagePending) {
      exc.message = (exc.message + '\n' + trimmed).trim();
    }
  }

  return { language: 'rust', exceptions: [exc], raw };
}
