import { ChevronDown, ChevronRight, Layers } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { ParsedException } from '../parsers';
import { filterFrames, groupFrames, type FrameFilter } from '../lib/fold';
import { FrameRow } from './FrameRow';

interface Props {
  exception: ParsedException;
  cleanAsync: boolean;
  fold: boolean;
  filter: FrameFilter;
  search: string;
  onCopy: (key: string, text: string) => void;
  copiedKey: string | null;
}

export function FrameList({ exception, cleanAsync, fold, filter, search, onCopy, copiedKey }: Props) {
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set());
  const frames = useMemo(() => filterFrames(exception.frames, filter, search), [exception, filter, search]);
  // Folding while searching hides matches, so only fold when no search is active.
  const groups = useMemo(() => groupFrames(frames, fold && !search && filter !== 'framework'), [frames, fold, search, filter]);

  const toggle = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  if (frames.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-slate-800 p-6 text-center text-xs text-slate-500">
        {exception.frames.length === 0 ? 'No stack frames were found for this exception.' : 'No frames match the current filter.'}
      </div>
    );
  }

  let index = 0;
  return (
    <div className="space-y-1.5">
      {groups.map((g) => {
        if (g.kind === 'frame') {
          index++;
          return (
            <FrameRow
              key={g.frame.id}
              frame={g.frame}
              index={index}
              cleanAsync={cleanAsync}
              onCopy={onCopy}
              copiedKey={copiedKey}
              dim={g.frame.isFramework}
              highlight={search}
            />
          );
        }
        const open = expanded.has(g.id);
        const start = index + 1;
        index += g.frames.length;
        return (
          <div key={g.id} className="fade-in">
            <button
              type="button"
              onClick={() => toggle(g.id)}
              aria-expanded={open}
              className="flex w-full items-center gap-2 rounded-lg border border-dashed border-slate-700/80 bg-slate-900/40 px-3 py-1.5 text-left text-[11.5px] text-slate-400 transition-colors hover:border-slate-500 hover:bg-slate-900 hover:text-slate-200"
            >
              {open ? <ChevronDown size={14} className="shrink-0" /> : <ChevronRight size={14} className="shrink-0" />}
              <Layers size={12} className="shrink-0 text-slate-500" />
              <span>
                <span className="font-medium text-slate-300">{g.frames.length}</span> framework frame{g.frames.length === 1 ? '' : 's'}{' '}
                {open ? 'shown' : 'hidden'}
              </span>
              {g.summary && <span className="truncate font-mono text-slate-500">({g.summary})</span>}
            </button>
            {open && (
              <div className="mt-1.5 space-y-1.5 border-l border-slate-800 pl-2">
                {g.frames.map((f, i) => (
                  <FrameRow
                    key={f.id}
                    frame={f}
                    index={start + i}
                    cleanAsync={cleanAsync}
                    onCopy={onCopy}
                    copiedKey={copiedKey}
                    dim
                    highlight={search}
                  />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
