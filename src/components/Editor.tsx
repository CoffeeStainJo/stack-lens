import { FileText } from 'lucide-react';

interface Props {
  value: string;
  onChange: (v: string) => void;
  className?: string;
}

export function Editor({ value, onChange, className }: Props) {
  const lines = value ? value.split('\n').length : 0;
  return (
    <div className={`flex min-h-0 flex-col bg-slate-950 ${className ?? ''}`}>
      <div className="flex items-center justify-between border-b border-slate-800 px-3 py-1.5 text-[11px] text-slate-500">
        <span className="inline-flex items-center gap-1.5">
          <FileText size={12} />
          Raw stack trace
        </span>
        <span className="font-mono">
          {lines} line{lines === 1 ? '' : 's'}
        </span>
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        spellCheck={false}
        placeholder={'Paste a stack trace here…\n\nC#, Python, TypeScript/JavaScript, Java and Rust are detected automatically.'}
        className="min-h-0 flex-1 resize-none bg-transparent p-3 font-mono text-[12px] leading-relaxed text-slate-300 placeholder:text-slate-600 outline-none"
      />
    </div>
  );
}
