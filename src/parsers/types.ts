export type Language = 'csharp' | 'python' | 'javascript' | 'java' | 'rust';

export const LANGUAGES: { id: Language; label: string }[] = [
  { id: 'csharp', label: 'C# / .NET' },
  { id: 'python', label: 'Python' },
  { id: 'javascript', label: 'TypeScript / JavaScript' },
  { id: 'java', label: 'Java / JVM' },
  { id: 'rust', label: 'Rust' },
];

export interface StackFrame {
  /** Stable id within a parse. */
  id: string;
  /** Original text of the line(s) that produced this frame. */
  raw: string;
  /** Package / namespace / module path (muted in UI). */
  namespace?: string;
  /** Class or type name. */
  className?: string;
  /** Method / function name. Demangled for async state machines. */
  method: string;
  /** Method text as it appeared before demangling (only set when it differs). */
  rawMethod?: string;
  /** Argument list without surrounding parens. */
  args?: string;
  file?: string;
  line?: number;
  column?: number;
  /** True when the frame belongs to a runtime / framework / library. */
  isFramework: boolean;
  /** True when the frame was a compiler-generated async state machine. */
  isAsync: boolean;
  /** Source code line (Python). */
  sourceLine?: string;
}

export interface ParsedException {
  type: string;
  message: string;
  frames: StackFrame[];
  /** Count of frames elided by the runtime ("... 12 more"). */
  elided?: number;
  /** Where the failure originated, when the runtime prints it separately (Rust panics). */
  location?: string;
}

export interface ParsedStackTrace {
  language: Language;
  /** exceptions[0] is the outermost; later entries are inner exceptions / causes. */
  exceptions: ParsedException[];
  raw: string;
}

export type Parser = (raw: string) => ParsedStackTrace;

export function isAbsolutePath(path: string): boolean {
  return /^[A-Za-z]:[\\/]/.test(path) || path.startsWith('/');
}
