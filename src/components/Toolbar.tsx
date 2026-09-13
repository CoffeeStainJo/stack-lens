import { Check, ClipboardCopy, EyeOff, FoldVertical, Search, Sparkles, Trash2, X } from 'lucide-react';
import type { FrameFilter } from '../lib/fold';
import { SAMPLES } from '../samples';
import { Button, Toggle, cx } from './ui';

export interface Settings {
  scrub: boolean;
  cleanAsync: boolean;
  fold: boolean;
}

interface Props {
  settings: Settings;
  onSettings: (s: Settings) => void;
  search: string;
  onSearch: (s: string) => void;
  filter: FrameFilter;
  onFilter: (f: FrameFilter) => void;
  onSample: (id: string) => void;
  activeSample: string | null;
  onCopyMarkdown: () => void;
  markdownCopied: boolean;
  canCopy: boolean;
  onClear: () => void;
}

const FILTERS: { id: FrameFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'app', label: 'App code' },
  { id: 'framework', label: 'Framework' },
];

export function Toolbar(p: Props) {
  const set = (patch: Partial<Settings>) => p.onSettings({ ...p.settings, ...patch });
  return (
    <div className="flex flex-col gap-2 border-b border-slate-800 bg-slate-950 px-4 py-2">
      <div className="flex flex-wrap items-center gap-2">
        <Toggle icon={EyeOff} label="Scrub paths" hint="Anonymise user home directories for safe sharing" active={p.settings.scrub} onChange={(v) => set({ scrub: v })} />
        <Toggle icon={Sparkles} label="Clean async" hint="Demangle compiler-generated async state machine frames" active={p.settings.cleanAsync} onChange={(v) => set({ cleanAsync: v })} />
        <Toggle icon={FoldVertical} label="Fold noise" hint="Collapse consecutive framework frames" active={p.settings.fold} onChange={(v) => set({ fold: v })} />

        <div className="mx-1 hidden h-5 w-px bg-slate-800 sm:block" />

        <div className="relative min-w-[180px] flex-1 sm:max-w-xs">
          <Search size={14} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="search"
            value={p.search}
            onChange={(e) => p.onSearch(e.target.value)}
            placeholder="Filter by method, class or file…"
            className="w-full rounded-md border border-slate-700 bg-slate-900 py-1.5 pl-8 pr-7 text-xs text-slate-200 placeholder:text-slate-600 outline-none focus:border-cyan-400/60"
          />
          {p.search && (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => p.onSearch('')}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded p-0.5 text-slate-500 hover:text-slate-200"
            >
              <X size={12} />
            </button>
          )}
        </div>

        <div className="inline-flex overflow-hidden rounded-md border border-slate-700 bg-slate-900 text-xs">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              aria-pressed={p.filter === f.id}
              onClick={() => p.onFilter(f.id)}
              className={cx('px-2.5 py-1.5 transition-colors', p.filter === f.id ? 'bg-slate-800 text-cyan-200' : 'text-slate-400 hover:text-slate-100')}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-2">
          <Button icon={p.markdownCopied ? Check : ClipboardCopy} variant="primary" onClick={p.onCopyMarkdown} disabled={!p.canCopy}>
            {p.markdownCopied ? 'Copied' : 'Copy Markdown'}
          </Button>
          <Button icon={Trash2} variant="ghost" onClick={p.onClear} title="Clear input">
            <span className="hidden sm:inline">Clear</span>
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        <span className="mr-1 text-[11px] uppercase tracking-wider text-slate-600">Samples</span>
        {SAMPLES.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => p.onSample(s.id)}
            className={cx(
              'rounded-full border px-2.5 py-0.5 text-[11px] transition-colors',
              p.activeSample === s.id
                ? 'border-indigo-400/50 bg-indigo-500/15 text-indigo-200'
                : 'border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-600 hover:text-slate-200',
            )}
          >
            {s.label}
          </button>
        ))}
      </div>
    </div>
  );
}
