import { describe, expect, it } from 'vitest';
import { detectLanguage } from './detect';
import { SAMPLES } from '../samples';

describe('detectLanguage', () => {
  for (const s of SAMPLES) {
    it(`detects the ${s.label} sample as ${s.language}`, () => {
      expect(detectLanguage(s.text)).toBe(s.language);
    });
  }

  it('returns null for unrecognised input', () => {
    expect(detectLanguage('hello world')).toBeNull();
    expect(detectLanguage('panic: runtime error: index out of range [3] with length 3\n\ngoroutine 1 [running]:\nmain.main()\n\t/tmp/x.go:8 +0x1d')).toBeNull();
  });

  it('distinguishes a bare C# frame list from Java', () => {
    expect(detectLanguage('   at Acme.Foo.Bar(Int32 x)\n   at Acme.Program.Main()')).toBe('csharp');
    expect(detectLanguage('\tat com.acme.Foo.bar(Foo.java:1)\n\tat com.acme.Main.main(Main.java:2)')).toBe('java');
  });
});
