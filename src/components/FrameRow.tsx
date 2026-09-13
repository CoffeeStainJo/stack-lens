import { Check, Code2, Copy, Zap } from 'lucide-react';
import type { StackFrame } from '../parsers';
import { displayMethod, fileLine, vscodeUrl } from '../lib/format';
import { Button, cx } from './ui';

interface Props {
  frame: StackFrame;
  index: number;
  cleanAsync: boolean;
  onCopy: (key: string, text: string) => void;
  copiedKey: string | null;
  dim?: boolean;
  highlight?: string;
}

export function FrameRow({ frame, index, cleanAsync, onCopy, copiedKey, dim, highlight }: Props) {
  const loc = fileLine(frame);
  const link = vscodeUrl(frame);
  const method = displayMethod(frame, cleanAsync);
  const sep = frame.namespace?.includes('::') ? '::' : '.';
  const app = !frame.isFramework;
  const copyKey = `file-${frame.id}`;

  return (
    <div
      className={cx(
        'group fade-in rounded-lg border px-3 py-2 transition-colors',
        app
          ? 'border-l-[3px] border-slate-700 border-l-cyan-400 bg-slate-800/70 hover:bg-slate-800'
          : 'border-slate-800/80 border-l-[3px] border-l-slate-700 bg-slate-900/50 hover:bg-slate-900',
        dim && 'opacity-70 hover:opacity-100',
      )}
    >
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <span className="w-6 shrink-0 select-none font-mono text-[10px] text-slate-600">{index}</span>
        <code className="min-w-0 flex-1 break-all font-mono text-[12.5px] leading-relaxed">
          {frame.namespace && (
            <span className="text-slate-500">
              <Mark text={frame.namespace} q={highlight} />
              {sep}
            </span>
          )}
          {frame.className && (
            <span className={app ? 'text-slate-200' : 'text-slate-400'}>
              <Mark text={frame.className} q={highlight} />
              {sep}
            </span>
          )}
          <span className={cx(app ? 'font-semibold text-cyan-300' : 'text-indigo-300/80')}>
            <Mark text={method} q={highlight} />
          </span>
          {frame.args !== undefined && (
            <span className="text-slate-500">
              (<span className="text-slate-500/80">{frame.args}</span>)
            </span>
          )}
          {frame.isAsync && (
            <span className="ml-1.5 inline-flex items-center gap-0.5 rounded bg-violet-500/15 px-1 py-px align-middle text-[10px] font-medium text-violet-300 ring-1 ring-violet-400/30">
              <Zap size={9} />
              async
            </span>
          )}
        </code>

        {loc && (
          <span
            className={cx(
              'ml-auto inline-flex max-w-full items-center rounded px-1.5 py-0.5 font-mono text-[11px] ring-1',
              app ? 'bg-amber-400/10 text-amber-200 ring-amber-400/30' : 'bg-slate-800 text-slate-400 ring-slate-700',
            )}
            title={loc}
          >
            <span className="truncate">
              <Mark text={shortenPath(loc)} q={highlight} />
            </span>
          </span>
        )}
      </div>

      {frame.sourceLine && (
        <pre className="mt-1.5 ml-8 overflow-x-auto rounded-md border border-slate-700/60 bg-slate-950/80 px-2.5 py-1.5 font-mono text-[11.5px] text-emerald-200/90">
          {frame.sourceLine}
        </pre>
      )}

      {loc && (
        <div className="mt-1.5 ml-8 flex flex-wrap items-center gap-1.5 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100">
          {link && (
            <a
              href={link}
              className="inline-flex items-center gap-1 rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-[11px] font-medium text-slate-300 transition-colors hover:border-cyan-400/50 hover:text-cyan-200"
            >
              <Code2 size={12} />
              Open in VS Code
            </a>
          )}
          <Button size="xs" icon={copiedKey === copyKey ? Check : Copy} onClick={() => onCopy(copyKey, loc)}>
            {copiedKey === copyKey ? 'Copied' : 'Copy File:Line'}
          </Button>
        </div>
      )}
    </div>
  );
}

function shortenPath(loc: string): string {
  const parts = loc.split(/[\\/]/);
  if (parts.length <= 3) return loc;
  return `…/${parts.slice(-3).join('/')}`;
}

function Mark({ text, q }: { text: string; q?: string }) {
  if (!q) return <>{text}</>;
  const idx = text.toLowerCase().indexOf(q.toLowerCase());
  if (idx < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="rounded bg-yellow-400/30 px-px text-inherit">{text.slice(idx, idx + q.length)}</mark>
      {text.slice(idx + q.length)}
    </>
  );
}
