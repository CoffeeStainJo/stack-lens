import { AlertOctagon, Check, Copy, CornerDownRight, MapPin } from 'lucide-react';
import type { ParsedException } from '../parsers';
import { signalRatio } from '../lib/fold';
import { Button, cx } from './ui';

interface Props {
  exceptions: ParsedException[];
  active: number;
  onActive: (i: number) => void;
  onCopyError: () => void;
  errorCopied: boolean;
}

export function ExceptionBanner({ exceptions, active, onActive, onCopyError, errorCopied }: Props) {
  const exc = exceptions[active];
  if (!exc) return null;
  const { app, framework, ratio } = signalRatio(exc.frames);
  const pct = Math.round(ratio * 100);

  return (
    <section className="fade-in rounded-xl border border-rose-500/30 bg-gradient-to-br from-rose-950/40 via-slate-900 to-slate-900 p-4 glow-rose">
      {exceptions.length > 1 && (
        <div className="mb-3 flex flex-wrap items-center gap-1 text-xs" role="tablist" aria-label="Exception chain">
          {exceptions.map((e, i) => (
            <button
              key={i}
              role="tab"
              type="button"
              aria-selected={i === active}
              onClick={() => onActive(i)}
              className={cx(
                'inline-flex max-w-[260px] items-center gap-1 rounded-md border px-2 py-1 font-mono text-[11px] transition-colors',
                i === active
                  ? 'border-rose-400/50 bg-rose-500/15 text-rose-100'
                  : 'border-slate-700 bg-slate-900/60 text-slate-400 hover:border-slate-500 hover:text-slate-200',
              )}
              title={e.type}
            >
              {i > 0 && <CornerDownRight size={11} className="shrink-0 opacity-60" />}
              <span className="truncate">{shortType(e.type)}</span>
            </button>
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-start gap-3">
        <div className="inline-flex items-center gap-2 rounded-md bg-rose-500/20 px-2.5 py-1.5 font-mono text-sm font-semibold text-rose-200 ring-1 ring-rose-400/40">
          <AlertOctagon size={16} className="shrink-0" />
          <span className="break-all">{exc.type}</span>
        </div>
        <div className="ml-auto">
          <Button icon={errorCopied ? Check : Copy} onClick={onCopyError}>
            {errorCopied ? 'Copied' : 'Copy Error'}
          </Button>
        </div>
      </div>

      {exc.message ? (
        <pre className="mt-3 whitespace-pre-wrap break-words font-mono text-[13px] leading-relaxed text-slate-100">{exc.message}</pre>
      ) : (
        <p className="mt-3 text-xs italic text-slate-500">No message</p>
      )}

      {exc.location && (
        <div className="mt-2 inline-flex items-center gap-1.5 rounded-md bg-amber-400/10 px-2 py-1 font-mono text-[11px] text-amber-200 ring-1 ring-amber-400/30">
          <MapPin size={12} />
          {exc.location}
        </div>
      )}

      <div className="mt-4">
        <div className="mb-1 flex items-center justify-between text-[11px]">
          <span className="uppercase tracking-wider text-slate-500">Signal-to-noise</span>
          <span className="font-mono text-slate-400">
            <span className="text-cyan-300">{app}</span> app · <span className="text-slate-500">{framework}</span> framework
            {exc.elided ? <span className="text-slate-600"> · {exc.elided} elided</span> : null}
            <span className="ml-2 text-slate-300">{pct}%</span>
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800" role="meter" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Application code percentage">
          <div
            className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-indigo-400 transition-[width] duration-300"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </section>
  );
}

function shortType(type: string): string {
  const parts = type.split(/\.|::/);
  return parts.length > 2 ? `…${parts.slice(-2).join('.')}` : type;
}
