import { AlertTriangle, ChevronDown, ChevronUp, Inbox } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Editor } from './components/Editor';
import { ExceptionBanner } from './components/ExceptionBanner';
import { FrameList } from './components/FrameList';
import { Header, type LanguageChoice, type ViewMode } from './components/Header';
import { Toolbar, type Settings } from './components/Toolbar';
import { cx } from './components/ui';
import type { FrameFilter } from './lib/fold';
import { toMarkdown } from './lib/format';
import { scrubTrace } from './lib/scrub';
import { useCopy } from './lib/useCopy';
import { usePersistedState } from './lib/usePersistedState';
import { detectLanguage, parseStackTrace, type ParsedStackTrace } from './parsers';
import { CSHARP_SAMPLE, SAMPLES } from './samples';

const DEFAULT_SETTINGS: Settings = { scrub: false, cleanAsync: true, fold: true };

export default function App() {
  const [text, setText] = usePersistedState<string>('stacklens:text', CSHARP_SAMPLE);
  const [languageChoice, setLanguageChoice] = usePersistedState<LanguageChoice>('stacklens:language', 'auto');
  const [settings, setSettings] = usePersistedState<Settings>('stacklens:settings', DEFAULT_SETTINGS);
  const [view, setView] = usePersistedState<ViewMode>('stacklens:view', 'split');
  const [drawerOpen, setDrawerOpen] = usePersistedState<boolean>('stacklens:drawer', false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FrameFilter>('all');
  const [active, setActive] = useState(0);
  const [copy, copiedKey] = useCopy();

  const detected = useMemo(() => (text.trim() ? detectLanguage(text) : null), [text]);
  const language = languageChoice === 'auto' ? detected : languageChoice;

  const parsed = useMemo<ParsedStackTrace | null>(() => {
    if (!text.trim() || !language) return null;
    try {
      return parseStackTrace(text, language);
    } catch {
      return null;
    }
  }, [text, language]);

  const trace = useMemo(() => (parsed && settings.scrub ? scrubTrace(parsed) : parsed), [parsed, settings.scrub]);

  useEffect(() => setActive(0), [parsed]);

  const activeSample = useMemo(() => SAMPLES.find((s) => s.text === text)?.id ?? null, [text]);
  const exception = trace?.exceptions[Math.min(active, (trace?.exceptions.length ?? 1) - 1)];

  const loadSample = (id: string) => {
    const s = SAMPLES.find((x) => x.id === id);
    if (!s) return;
    setText(s.text);
    setLanguageChoice('auto');
    setSearch('');
    setFilter('all');
  };

  const copyMarkdown = () => trace && copy('markdown', toMarkdown(trace, settings.cleanAsync));
  const copyError = () => exception && copy('error', `${exception.type}${exception.message ? `: ${exception.message}` : ''}`);

  const visualizer = (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 py-4">
      {!text.trim() ? (
        <EmptyState />
      ) : !language ? (
        <UnknownLanguage text={text} onPick={setLanguageChoice} />
      ) : trace && exception ? (
        <div className="mx-auto w-full max-w-5xl space-y-4">
          <ExceptionBanner
            exceptions={trace.exceptions}
            active={Math.min(active, trace.exceptions.length - 1)}
            onActive={setActive}
            onCopyError={copyError}
            errorCopied={copiedKey === 'error'}
          />
          <FrameList
            key={`${language}-${active}-${settings.scrub}`}
            exception={exception}
            cleanAsync={settings.cleanAsync}
            fold={settings.fold}
            filter={filter}
            search={search}
            onCopy={copy}
            copiedKey={copiedKey}
          />
        </div>
      ) : (
        <UnknownLanguage text={text} onPick={setLanguageChoice} />
      )}
    </div>
  );

  return (
    <div className="flex h-full flex-col">
      <Header language={languageChoice} detected={detected} onLanguage={setLanguageChoice} view={view} onView={setView} />
      <Toolbar
        settings={settings}
        onSettings={setSettings}
        search={search}
        onSearch={setSearch}
        filter={filter}
        onFilter={setFilter}
        onSample={loadSample}
        activeSample={activeSample}
        onCopyMarkdown={copyMarkdown}
        markdownCopied={copiedKey === 'markdown'}
        canCopy={Boolean(trace)}
        onClear={() => setText('')}
      />

      {view === 'split' ? (
        <main className="flex min-h-0 flex-1 flex-col md:flex-row">
          <Editor value={text} onChange={setText} className="h-56 shrink-0 border-b border-slate-800 md:h-auto md:w-[42%] md:shrink md:border-b-0 md:border-r" />
          {visualizer}
        </main>
      ) : (
        <main className="flex min-h-0 flex-1 flex-col">
          <div className={cx('flex shrink-0 flex-col border-b border-slate-800', drawerOpen && 'h-64')}>
            <button
              type="button"
              onClick={() => setDrawerOpen(!drawerOpen)}
              aria-expanded={drawerOpen}
              className="flex items-center justify-center gap-1.5 bg-slate-950 py-1 text-[11px] text-slate-500 transition-colors hover:bg-slate-900 hover:text-slate-200"
            >
              {drawerOpen ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
              {drawerOpen ? 'Hide raw input' : 'Show raw input'}
            </button>
            {drawerOpen && <Editor value={text} onChange={setText} className="min-h-0 flex-1" />}
          </div>
          {visualizer}
        </main>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="m-auto max-w-sm text-center">
      <Inbox size={36} className="mx-auto text-slate-700" />
      <h2 className="mt-3 text-sm font-medium text-slate-300">Paste a stack trace to begin</h2>
      <p className="mt-1 text-xs leading-relaxed text-slate-500">
        StackLens parses it locally, folds the framework noise, and gives you one-click links into your editor. Or try one of the samples above.
      </p>
    </div>
  );
}

function UnknownLanguage({ text, onPick }: { text: string; onPick: (l: LanguageChoice) => void }) {
  return (
    <div className="mx-auto w-full max-w-5xl space-y-3">
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-amber-400/30 bg-amber-400/5 p-4 text-sm text-amber-100">
        <AlertTriangle size={18} className="shrink-0 text-amber-300" />
        <div className="min-w-0 flex-1">
          <div className="font-medium">Could not detect the language of this trace.</div>
          <div className="text-xs text-amber-200/70">Pick one from the dropdown above, or use the buttons here.</div>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {(['csharp', 'python', 'javascript', 'java', 'rust'] as const).map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => onPick(l)}
              className="rounded-md border border-amber-400/30 bg-slate-900 px-2 py-1 text-xs text-amber-100 hover:bg-slate-800"
            >
              {l === 'csharp' ? 'C#' : l === 'javascript' ? 'JS/TS' : l[0].toUpperCase() + l.slice(1)}
            </button>
          ))}
        </div>
      </div>
      <pre className="overflow-x-auto rounded-lg border border-slate-800 bg-slate-900/60 p-3 font-mono text-[12px] leading-relaxed text-slate-400">{text}</pre>
    </div>
  );
}
