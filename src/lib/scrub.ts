import type { ParsedStackTrace } from '../parsers';

const RULES: [RegExp, string][] = [
  [/([A-Za-z]:[\\/](?:Users|Documents and Settings)[\\/])[^\\/\s"']+/g, '$1<user>'],
  [/(\/home\/)[^/\s"']+/g, '$1<user>'],
  [/(\/Users\/)[^/\s"']+/g, '$1<user>'],
  [/(\/export\/home\/)[^/\s"']+/g, '$1<user>'],
];

export function scrubText(text: string): string {
  return RULES.reduce((acc, [re, rep]) => acc.replace(re, rep), text);
}

/** Return a copy of the trace with user home directories anonymised everywhere. */
export function scrubTrace(trace: ParsedStackTrace): ParsedStackTrace {
  return {
    ...trace,
    raw: scrubText(trace.raw),
    exceptions: trace.exceptions.map((exc) => ({
      ...exc,
      message: scrubText(exc.message),
      location: exc.location ? scrubText(exc.location) : undefined,
      frames: exc.frames.map((f) => ({
        ...f,
        raw: scrubText(f.raw),
        file: f.file ? scrubText(f.file) : undefined,
        sourceLine: f.sourceLine ? scrubText(f.sourceLine) : undefined,
      })),
    })),
  };
}
