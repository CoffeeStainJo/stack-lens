import { describe, expect, it } from 'vitest';
import { scrubText, scrubTrace } from './scrub';
import { filterFrames, groupFrames, signalRatio, summarizeNamespaces } from './fold';
import { toMarkdown, vscodeUrl } from './format';
import { parseCSharp } from '../parsers/csharp';
import { parseJavaScript } from '../parsers/javascript';
import { CSHARP_SAMPLE, TYPESCRIPT_SAMPLE } from '../samples';
import type { StackFrame } from '../parsers';

const frame = (over: Partial<StackFrame>): StackFrame => ({
  id: over.id ?? Math.random().toString(36).slice(2),
  raw: '',
  method: 'm',
  isFramework: false,
  isAsync: false,
  ...over,
});

describe('scrub', () => {
  it('anonymises Windows, Linux and macOS home directories', () => {
    expect(scrubText('C:\\Users\\joachim\\src\\a.cs')).toBe('C:\\Users\\<user>\\src\\a.cs');
    expect(scrubText('c:/Users/joachim/src/a.cs')).toBe('c:/Users/<user>/src/a.cs');
    expect(scrubText('/home/joachim/dev/x.ts')).toBe('/home/<user>/dev/x.ts');
    expect(scrubText('/Users/joachim/dev/x.ts')).toBe('/Users/<user>/dev/x.ts');
  });

  it('scrubs frames, messages and raw text of a parsed trace', () => {
    const t = scrubTrace(parseCSharp(CSHARP_SAMPLE));
    expect(t.raw).not.toContain('joachim');
    expect(t.exceptions.flatMap((e) => e.frames).some((f) => f.file?.includes('joachim'))).toBe(false);
  });
});

describe('fold', () => {
  it('groups runs of two or more framework frames', () => {
    const frames = [
      frame({ id: 'a', isFramework: false }),
      frame({ id: 'b', isFramework: true, namespace: 'System.Linq' }),
      frame({ id: 'c', isFramework: true, namespace: 'System.Threading.Tasks' }),
      frame({ id: 'd', isFramework: false }),
      frame({ id: 'e', isFramework: true, namespace: 'System.IO' }),
    ];
    const groups = groupFrames(frames, true);
    expect(groups.map((g) => g.kind)).toEqual(['frame', 'folded', 'frame', 'frame']);
    const folded = groups[1];
    if (folded.kind !== 'folded') throw new Error('expected folded');
    expect(folded.frames).toHaveLength(2);
    expect(folded.summary).toBe('System.Linq, System.Threading');
  });

  it('does not fold when folding is off', () => {
    const t = parseCSharp(CSHARP_SAMPLE);
    expect(groupFrames(t.exceptions[0].frames, false).every((g) => g.kind === 'frame')).toBe(true);
  });

  it('summarises node_modules packages by package name', () => {
    const t = parseJavaScript(TYPESCRIPT_SAMPLE);
    const fw = t.exceptions[0].frames.filter((f) => f.isFramework);
    expect(summarizeNamespaces(fw)).toBe('@nestjs/core, express, node:internal');
  });

  it('filters by app / framework and search text', () => {
    const t = parseCSharp(CSHARP_SAMPLE);
    const all = t.exceptions[0].frames;
    expect(filterFrames(all, 'app', '').every((f) => !f.isFramework)).toBe(true);
    expect(filterFrames(all, 'framework', '').every((f) => f.isFramework)).toBe(true);
    expect(filterFrames(all, 'all', 'userscontroller').map((f) => f.className)).toEqual(['UsersController']);
  });

  it('computes signal ratio', () => {
    const r = signalRatio([frame({ isFramework: false }), frame({ isFramework: true }), frame({ isFramework: true })]);
    expect(r).toEqual({ app: 1, framework: 2, ratio: 1 / 3 });
  });
});

describe('format', () => {
  it('builds vscode urls only for absolute paths', () => {
    expect(vscodeUrl(frame({ file: 'C:\\src\\a.cs', line: 4 }))).toBe('vscode://file/C:/src/a.cs:4');
    expect(vscodeUrl(frame({ file: '/home/me/a.ts', line: 4, column: 2 }))).toBe('vscode://file/home/me/a.ts:4:2');
    expect(vscodeUrl(frame({ file: './src/a.rs', line: 1 }))).toBeUndefined();
    expect(vscodeUrl(frame({ file: 'Foo.java', line: 1 }))).toBeUndefined();
  });

  it('renders a markdown summary with app frames only', () => {
    const md = toMarkdown(parseCSharp(CSHARP_SAMPLE), true);
    expect(md).toContain('**`System.InvalidOperationException`**');
    expect(md).toContain('Caused by: `Microsoft.EntityFrameworkCore.DbUpdateException`');
    expect(md).toContain('`Contoso.Orders.Api.Controllers.UsersController.Register`');
    expect(md).not.toContain('Microsoft.AspNetCore.Mvc');
    expect(md).toContain('framework frames omitted');
  });
});
