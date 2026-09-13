import { parseCSharp } from './csharp';
import { parseJava } from './java';
import { parseJavaScript } from './javascript';
import { parsePython } from './python';
import { parseRust } from './rust';
import type { Language, ParsedStackTrace, Parser } from './types';

export * from './types';
export { detectLanguage } from './detect';

export const PARSERS: Record<Language, Parser> = {
  csharp: parseCSharp,
  python: parsePython,
  javascript: parseJavaScript,
  java: parseJava,
  rust: parseRust,
};

export function parseStackTrace(raw: string, language: Language): ParsedStackTrace {
  return PARSERS[language](raw);
}
