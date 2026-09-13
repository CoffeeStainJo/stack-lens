import type { StackFrame } from '../parsers';

export type FrameGroup =
  | { kind: 'frame'; frame: StackFrame }
  | { kind: 'folded'; id: string; frames: StackFrame[]; summary: string };

export type FrameFilter = 'all' | 'app' | 'framework';

export function frameMatches(frame: StackFrame, query: string): boolean {
  if (!query) return true;
  const q = query.toLowerCase();
  return [frame.method, frame.rawMethod, frame.className, frame.namespace, frame.file, frame.sourceLine]
    .filter((s): s is string => Boolean(s))
    .some((s) => s.toLowerCase().includes(q));
}

export function filterFrames(frames: StackFrame[], filter: FrameFilter, query: string): StackFrame[] {
  return frames.filter((f) => {
    if (filter === 'app' && f.isFramework) return false;
    if (filter === 'framework' && !f.isFramework) return false;
    return frameMatches(f, query);
  });
}

/** Human summary of the namespaces in a folded run, e.g. "System.Linq, System.Threading". */
export function summarizeNamespaces(frames: StackFrame[], max = 3): string {
  const seen: string[] = [];
  for (const f of frames) {
    const ns = topNamespace(f);
    if (ns && !seen.includes(ns)) seen.push(ns);
  }
  const shown = seen.slice(0, max).join(', ');
  return seen.length > max ? `${shown}…` : shown;
}

function topNamespace(f: StackFrame): string | undefined {
  if (f.namespace) {
    const parts = f.namespace.split(/\.|::/);
    return parts.slice(0, 2).join(f.namespace.includes('::') ? '::' : '.');
  }
  if (f.file) {
    const nm = /node_modules[\\/](@[^\\/]+[\\/][^\\/]+|[^\\/]+)/.exec(f.file);
    if (nm) return nm[1];
    if (f.file.startsWith('node:')) return f.file.split('/')[0];
    return f.file.split(/[\\/]/).pop();
  }
  return f.className ?? f.method;
}

/** Collapse runs of >= minRun consecutive framework frames into folded groups. */
export function groupFrames(frames: StackFrame[], fold: boolean, minRun = 2): FrameGroup[] {
  if (!fold) return frames.map((frame) => ({ kind: 'frame', frame }));
  const out: FrameGroup[] = [];
  let run: StackFrame[] = [];
  const flush = () => {
    if (run.length >= minRun) {
      out.push({ kind: 'folded', id: `fold-${run[0].id}`, frames: run, summary: summarizeNamespaces(run) });
    } else {
      for (const frame of run) out.push({ kind: 'frame', frame });
    }
    run = [];
  };
  for (const frame of frames) {
    if (frame.isFramework) run.push(frame);
    else {
      flush();
      out.push({ kind: 'frame', frame });
    }
  }
  flush();
  return out;
}

export function signalRatio(frames: StackFrame[]): { app: number; framework: number; ratio: number } {
  const app = frames.filter((f) => !f.isFramework).length;
  const framework = frames.length - app;
  return { app, framework, ratio: frames.length ? app / frames.length : 0 };
}
