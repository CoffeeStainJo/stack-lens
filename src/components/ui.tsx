import type { LucideIcon } from 'lucide-react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

export function cx(...parts: (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join(' ');
}

interface ToggleProps {
  icon: LucideIcon;
  label: string;
  hint?: string;
  active: boolean;
  onChange: (v: boolean) => void;
}

export function Toggle({ icon: Icon, label, hint, active, onChange }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={active}
      title={hint}
      onClick={() => onChange(!active)}
      className={cx(
        'inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors select-none',
        active
          ? 'border-cyan-400/40 bg-cyan-400/10 text-cyan-200 glow-cyan'
          : 'border-slate-700 bg-slate-900 text-slate-400 hover:border-slate-500 hover:text-slate-200',
      )}
    >
      <Icon size={14} strokeWidth={2} />
      <span>{label}</span>
    </button>
  );
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: LucideIcon;
  variant?: 'default' | 'primary' | 'ghost';
  size?: 'sm' | 'xs';
  children?: ReactNode;
}

export function Button({ icon: Icon, variant = 'default', size = 'sm', className, children, ...rest }: ButtonProps) {
  return (
    <button
      type="button"
      className={cx(
        'inline-flex items-center gap-1.5 rounded-md border font-medium transition-colors select-none disabled:opacity-40 disabled:cursor-not-allowed',
        size === 'sm' ? 'px-2.5 py-1.5 text-xs' : 'px-2 py-1 text-[11px]',
        variant === 'primary' && 'border-indigo-400/40 bg-indigo-500/20 text-indigo-100 hover:bg-indigo-500/30',
        variant === 'default' && 'border-slate-700 bg-slate-900 text-slate-300 hover:border-slate-500 hover:text-slate-100',
        variant === 'ghost' && 'border-transparent bg-transparent text-slate-400 hover:bg-slate-800 hover:text-slate-100',
        className,
      )}
      {...rest}
    >
      {Icon && <Icon size={size === 'sm' ? 14 : 12} strokeWidth={2} />}
      {children}
    </button>
  );
}

export function Kbd({ children }: { children: ReactNode }) {
  return (
    <kbd className="rounded border border-slate-700 bg-slate-800 px-1 font-mono text-[10px] text-slate-400">{children}</kbd>
  );
}
