import { describe, expect, it } from 'vitest';
import { parsePython } from './python';
import { PYTHON_SAMPLE } from '../samples';

describe('parsePython', () => {
  it('parses a basic traceback with source snippets, failing frame first', () => {
    const t = parsePython(`Traceback (most recent call last):
  File "/app/main.py", line 10, in <module>
    main()
  File "/app/main.py", line 6, in main
    raise ValueError("bad value")
ValueError: bad value`);
    expect(t.exceptions).toHaveLength(1);
    const exc = t.exceptions[0];
    expect(exc.type).toBe('ValueError');
    expect(exc.message).toBe('bad value');
    expect(exc.frames).toHaveLength(2);
    expect(exc.frames[0]).toMatchObject({
      file: '/app/main.py',
      line: 6,
      method: 'main',
      namespace: 'main',
      sourceLine: 'raise ValueError("bad value")',
      isFramework: false,
    });
    expect(exc.frames[1].method).toBe('<module>');
  });

  it('ignores Python 3.11+ caret marker lines', () => {
    const t = parsePython(`Traceback (most recent call last):
  File "/app/calc.py", line 3, in divide
    return a / b
           ~~^~~
ZeroDivisionError: division by zero`);
    expect(t.exceptions[0].frames[0].sourceLine).toBe('return a / b');
    expect(t.exceptions[0].type).toBe('ZeroDivisionError');
  });

  it('parses chained exceptions with the outermost first', () => {
    const t = parsePython(PYTHON_SAMPLE);
    expect(t.exceptions.map((e) => e.type)).toEqual([
      'app.errors.StockRepositoryError',
      'asyncpg.exceptions.UndefinedTableError',
    ]);
    expect(t.exceptions[0].message).toBe('Could not load SKU WH-4471');
    expect(t.exceptions[0].frames[0]).toMatchObject({ method: 'fetch_sku', line: 47, isFramework: false });
  });

  it('flags site-packages, frozen and stdlib frames as framework', () => {
    const t = parsePython(`Traceback (most recent call last):
  File "<frozen runpy>", line 198, in _run_module_as_main
  File "/usr/lib/python3.12/asyncio/runners.py", line 194, in run
    return runner.run(main)
  File "/home/me/.venv/lib/python3.12/site-packages/httpx/_client.py", line 10, in get
    pass
  File "/home/me/proj/app.py", line 1, in go
    pass
RuntimeError: boom`);
    expect(t.exceptions[0].frames.map((f) => f.isFramework)).toEqual([false, true, true, true]);
  });

  it('handles "During handling" chains', () => {
    const t = parsePython(`Traceback (most recent call last):
  File "/app/a.py", line 1, in f
    x()
KeyError: 'k'

During handling of the above exception, another exception occurred:

Traceback (most recent call last):
  File "/app/a.py", line 5, in g
    f()
RuntimeError: wrapped`);
    expect(t.exceptions.map((e) => e.type)).toEqual(['RuntimeError', 'KeyError']);
    expect(t.exceptions[1].message).toBe("'k'");
  });
});
