import type { ParsedStackTrace, StackFrame } from '../parsers';
import { isAbsolutePath } from '../parsers';

export function displayMethod(frame: StackFrame, cleanAsync: boolean): string {
  return cleanAsync || !frame.rawMethod ? frame.method : frame.rawMethod;
}

export function qualifiedName(frame: StackFrame, cleanAsync: boolean): string {
  const sep = frame.namespace?.includes('::') ? '::' : '.';
  return [frame.namespace, frame.className, displayMethod(frame, cleanAsync)].filter(Boolean).join(sep);
}

export function fileLine(frame: StackFrame): string | undefined {
  if (!frame.file) return undefined;
  let s = frame.file;
  if (frame.line !== undefined) s += `:${frame.line}`;
  if (frame.column !== undefined) s += `:${frame.column}`;
  return s;
}

export function vscodeUrl(frame: StackFrame): string | undefined {
  if (!frame.file || !isAbsolutePath(frame.file)) return undefined;
  const path = frame.file.replace(/\\/g, '/');
  let url = `vscode://file/${path.startsWith('/') ? path.slice(1) : path}`;
  if (frame.line !== undefined) url += `:${frame.line}`;
  if (frame.column !== undefined) url += `:${frame.column}`;
  return url;
}

export function toMarkdown(trace: ParsedStackTrace, cleanAsync: boolean): string {
  const out: string[] = [];
  trace.exceptions.forEach((exc, i) => {
    const label = i === 0 ? '' : i === 1 ? 'Caused by: ' : `Caused by (${i}): `;
    out.push(`**${label}\`${exc.type}\`**${exc.message ? `: ${exc.message.split('\n')[0]}` : ''}`);
    if (exc.location) out.push(`at \`${exc.location}\``);
    const app = exc.frames.filter((f) => !f.isFramework);
    if (app.length === 0) {
      out.push('', '_No application frames_');
    } else {
      out.push('');
      for (const f of app) {
        const loc = fileLine(f);
        out.push(`- \`${qualifiedName(f, cleanAsync)}\`${loc ? ` — \`${loc}\`` : ''}`);
      }
    }
    const hidden = exc.frames.length - app.length;
    if (hidden > 0) out.push('', `_${hidden} framework frame${hidden === 1 ? '' : 's'} omitted_`);
    out.push('');
  });
  return out.join('\n').trim() + '\n';
}
