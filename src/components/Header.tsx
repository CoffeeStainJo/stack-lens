import { Columns2, Maximize2, ShieldCheck } from 'lucide-react';
import { LANGUAGES, type Language } from '../parsers';
import { cx } from './ui';

export type LanguageChoice = Language | 'auto';
export type ViewMode = 'split' | 'focus';

interface Props {
  language: LanguageChoice;
  detected: Language | null;
  onLanguage: (l: LanguageChoice) => void;
  view: ViewMode;
  onView: (v: ViewMode) => void;
}

export function Header({ language, detected, onLanguage, view, onView }: Props) {
  const detectedLabel = detected ? LANGUAGES.find((l) => l.id === detected)?.label : 'unknown';
  return (
    <header className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-slate-800 bg-slate-950/80 px-4 py-2.5 backdrop-blur">
      <div className="flex items-center gap-2.5">
        <Logo />
        <div className="leading-tight">
          <div className="text-sm font-semibold tracking-tight text-slate-100">
            Stack<span className="text-cyan-300">Lens</span>
          </div>
          <div className="text-[11px] text-slate-500">Stack traces, in focus.</div>
        </div>
      </div>

      <div className="ml-auto flex flex-wrap items-center gap-2">
        <span className="hidden items-center gap-1 text-[11px] text-slate-500 sm:inline-flex" title="Nothing leaves your browser.">
          <ShieldCheck size={13} className="text-emerald-400" />
          100% client-side
        </span>

        <label className="flex items-center gap-1.5 text-xs text-slate-400">
          <span className="hidden sm:inline">Language</span>
          <select
            value={language}
            onChange={(e) => onLanguage(e.target.value as LanguageChoice)}
            className="rounded-md border border-slate-700 bg-slate-900 px-2 py-1.5 text-xs text-slate-200 outline-none focus:border-cyan-400/60"
          >
            <option value="auto">Auto · {detectedLabel}</option>
            {LANGUAGES.map((l) => (
              <option key={l.id} value={l.id}>
                {l.label}
              </option>
            ))}
          </select>
        </label>

        <div className="inline-flex overflow-hidden rounded-md border border-slate-700 bg-slate-900 text-xs">
          <ViewButton active={view === 'split'} onClick={() => onView('split')} icon={<Columns2 size={14} />} label="Split" />
          <ViewButton active={view === 'focus'} onClick={() => onView('focus')} icon={<Maximize2 size={14} />} label="Focus" />
        </div>
      </div>
    </header>
  );
}

function ViewButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cx(
        'inline-flex items-center gap-1.5 px-2.5 py-1.5 transition-colors',
        active ? 'bg-slate-800 text-cyan-200' : 'text-slate-400 hover:text-slate-100',
      )}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

function Logo() {
  return (
    <svg width="30" height="30" viewBox="0 0 64 64" aria-hidden className="drop-shadow-[0_0_10px_rgba(34,211,238,0.45)]">
      <rect x="4" y="4" width="56" height="56" rx="14" fill="#0f172a" stroke="#1e293b" strokeWidth="2" />
      <rect x="14" y="18" width="20" height="4" rx="2" fill="#475569" />
      <rect x="14" y="27" width="28" height="4" rx="2" fill="#475569" />
      <rect x="14" y="36" width="16" height="4" rx="2" fill="#475569" />
      <rect x="14" y="45" width="24" height="4" rx="2" fill="#475569" />
      <circle cx="40" cy="38" r="11" fill="rgba(34,211,238,0.15)" stroke="#22d3ee" strokeWidth="3" />
      <rect x="30" y="36" width="14" height="4" rx="2" fill="#22d3ee" />
      <line x1="48" y1="46" x2="55" y2="53" stroke="#22d3ee" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}
