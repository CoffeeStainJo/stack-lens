import type { ParsedException, ParsedStackTrace, StackFrame } from './types';

const FRAMEWORK_PREFIXES = [
  'System.',
  'Microsoft.',
  'NUnit.',
  'Xunit.',
  'xunit.',
  'MSTest.',
  'Moq.',
  'Castle.',
  'Newtonsoft.',
  'Npgsql.',
  'MySql.',
  'Grpc.',
  'Serilog.',
  'Autofac.',
  'MediatR.',
  'Polly.',
  'Dapper.',
  'StackExchange.',
  'AutoMapper.',
  'FluentValidation.',
  'Swashbuckle.',
  'Hangfire.',
  'MassTransit.',
  'RabbitMQ.',
  'Azure.',
  'Amazon.',
  'AWSSDK.',
  'Google.',
  'lambda_method',
];

export function isCSharpFramework(fullName: string): boolean {
  return FRAMEWORK_PREFIXES.some((p) => fullName.startsWith(p));
}

const FRAME_RE = /^\s*at\s+(.+?)(?:\s+in\s+(.+?):line\s+(\d+))?\s*$/;
const END_INNER_RE = /^\s*---\s*End of inner exception stack trace\s*---\s*$/;
const END_PREV_RE = /^\s*---\s*End of stack trace from previous location.*---\s*$/;
const HEADER_RE = /^(?:Unhandled exception\.\s*)?([A-Za-z_][\w.`+]*(?:\[[^\]]*\])?)(?::\s?(.*))?$/;
const ASYNC_RE = /<([^>]+)>d__\d+\.MoveNext$/;

interface SplitSignature {
  namespace?: string;
  className?: string;
  method: string;
  rawMethod?: string;
  args?: string;
  isAsync: boolean;
}

/** Split "Ns.Sub.Class.Method(args)" into its parts, demangling async state machines. */
export function splitCSharpSignature(sig: string): SplitSignature {
  let args: string | undefined;
  let head = sig;
  const parenIdx = findTopLevelParen(sig);
  if (parenIdx >= 0) {
    head = sig.slice(0, parenIdx);
    const close = sig.lastIndexOf(')');
    args = sig.slice(parenIdx + 1, close > parenIdx ? close : undefined);
  }

  let isAsync = false;
  let rawMethod: string | undefined;
  const asyncMatch = ASYNC_RE.exec(head);
  if (asyncMatch) {
    isAsync = true;
    rawMethod = head.slice(asyncMatch.index);
    head = head.slice(0, asyncMatch.index).replace(/\.$/, '') + '.' + asyncMatch[1];
  }

  const segments = splitDots(head);
  const method = segments.pop() ?? head;
  const className = segments.pop();
  const namespace = segments.length ? segments.join('.') : undefined;
  return { namespace, className, method, rawMethod, args, isAsync };
}

function findTopLevelParen(s: string): number {
  let depth = 0;
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (c === '[' || c === '<') depth++;
    else if (c === ']' || c === '>') depth = Math.max(0, depth - 1);
    else if (c === '(' && depth === 0) return i;
  }
  return -1;
}

/** Split on dots that are not inside <> or []. */
function splitDots(s: string): string[] {
  const out: string[] = [];
  let depth = 0;
  let cur = '';
  for (const c of s) {
    if (c === '<' || c === '[') depth++;
    if (c === '>' || c === ']') depth = Math.max(0, depth - 1);
    if (c === '.' && depth === 0) {
      out.push(cur);
      cur = '';
    } else cur += c;
  }
  if (cur) out.push(cur);
  return out;
}

function newException(type: string, message: string): ParsedException {
  return { type: type.trim(), message: message.trim(), frames: [] };
}

export function parseCSharp(raw: string): ParsedStackTrace {
  const lines = raw.replace(/\r\n?/g, '\n').split('\n');
  // Chain in print order: [outer, inner, innermost]. Frames arrive innermost-first.
  const chain: ParsedException[] = [];
  let current = -1;
  let frameId = 0;

  const pushHeader = (text: string) => {
    // "Outer: msg ---> Inner: msg ---> Innermost: msg"
    const parts = text.split(/\s+--->\s+/);
    for (const part of parts) {
      const m = HEADER_RE.exec(part.trim());
      if (m) chain.push(newException(m[1], m[2] ?? ''));
      else chain.push(newException('Exception', part.trim()));
    }
    current = chain.length - 1;
  };

  for (const line of lines) {
    if (!line.trim()) continue;
    if (END_PREV_RE.test(line)) continue;

    if (END_INNER_RE.test(line)) {
      current = Math.max(0, current - 1);
      continue;
    }

    const frame = FRAME_RE.exec(line);
    if (frame) {
      if (chain.length === 0) pushHeader('Exception');
      const sig = splitCSharpSignature(frame[1]);
      const fullName = [sig.namespace, sig.className, sig.method].filter(Boolean).join('.');
      const f: StackFrame = {
        id: `f${frameId++}`,
        raw: line.trim(),
        namespace: sig.namespace,
        className: sig.className,
        method: sig.method,
        rawMethod: sig.rawMethod,
        args: sig.args,
        file: frame[2],
        line: frame[3] ? Number(frame[3]) : undefined,
        isFramework: isCSharpFramework(fullName),
        isAsync: sig.isAsync,
      };
      chain[current].frames.push(f);
      continue;
    }

    const trimmed = line.trim();
    if (trimmed.startsWith('--->')) {
      pushHeader(trimmed.replace(/^--->\s*/, ''));
      continue;
    }

    if (chain.length === 0) {
      pushHeader(trimmed);
      continue;
    }

    // Message continuation before any frames have been seen for this exception.
    if (chain[current].frames.length === 0) {
      chain[current].message = (chain[current].message + '\n' + trimmed).trim();
    }
  }

  return { language: 'csharp', exceptions: chain, raw };
}
