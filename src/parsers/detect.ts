import type { Language } from './types';

interface Signal {
  language: Language;
  re: RegExp;
  weight: number;
}

const SIGNALS: Signal[] = [
  { language: 'python', re: /^Traceback \(most recent call last\):/m, weight: 10 },
  { language: 'python', re: /^\s*File ".+", line \d+/m, weight: 6 },
  { language: 'python', re: /^(?:During handling of the above exception|The above exception was the direct cause)/m, weight: 5 },

  { language: 'csharp', re: /^\s*at .+ in .+:line \d+/m, weight: 10 },
  { language: 'csharp', re: /--- End of inner exception stack trace ---/, weight: 8 },
  { language: 'csharp', re: /^\s*at [\w.`<>\[\],+|]+\((?:[^)]*\s[^)]*)?\)\s*$/m, weight: 6 },
  { language: 'csharp', re: /^(?:Unhandled exception\. )?System\.\w+(?:\.\w+)*Exception/m, weight: 6 },
  { language: 'csharp', re: /<\w+>d__\d+\.MoveNext/, weight: 6 },

  { language: 'java', re: /^\s*at [\w.$/]+\([\w$]+\.(?:java|kt|scala):\d+\)/m, weight: 10 },
  { language: 'java', re: /^\s*at [\w.$/]+\((?:Native Method|Unknown Source)\)/m, weight: 8 },
  { language: 'java', re: /^\s*Caused by: /m, weight: 6 },
  { language: 'java', re: /^Exception in thread "/m, weight: 8 },
  { language: 'java', re: /^\s*\.\.\. \d+ more$/m, weight: 4 },

  { language: 'javascript', re: /^\s*at (?:async )?.+ \(.+:\d+:\d+\)$/m, weight: 10 },
  { language: 'javascript', re: /^\s*at .+:\d+:\d+$/m, weight: 6 },
  { language: 'javascript', re: /^[\w$.<>]*@.+:\d+:\d+$/m, weight: 8 },
  { language: 'javascript', re: /node:internal|node_modules/, weight: 5 },
  { language: 'javascript', re: /^(?:Uncaught )?(?:Type|Reference|Range|Syntax)Error:/m, weight: 4 },

  { language: 'rust', re: /^thread '[^']*' panicked at/m, weight: 10 },
  { language: 'rust', re: /^\s*\d+:\s+\S+::\S+/m, weight: 6 },
  { language: 'rust', re: /^stack backtrace:/m, weight: 6 },
  { language: 'rust', re: /RUST_BACKTRACE/, weight: 4 },
];

export function detectLanguage(raw: string): Language | null {
  const scores = new Map<Language, number>();
  for (const s of SIGNALS) {
    if (s.re.test(raw)) scores.set(s.language, (scores.get(s.language) ?? 0) + s.weight);
  }
  let best: Language | null = null;
  let bestScore = 0;
  for (const [lang, score] of scores) {
    if (score > bestScore) {
      best = lang;
      bestScore = score;
    }
  }
  return bestScore >= 6 ? best : null;
}
