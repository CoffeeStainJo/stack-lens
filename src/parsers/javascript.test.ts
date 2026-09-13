import { describe, expect, it } from 'vitest';
import { parseJavaScript } from './javascript';
import { TYPESCRIPT_SAMPLE } from '../samples';

describe('parseJavaScript', () => {
  it('parses V8 frames with class, method, file, line and column', () => {
    const t = parseJavaScript(TYPESCRIPT_SAMPLE);
    const exc = t.exceptions[0];
    expect(exc.type).toBe('TypeError');
    expect(exc.message).toBe("Cannot read properties of undefined (reading 'items')");
    expect(exc.frames[0]).toMatchObject({
      method: 'buildInvoiceLines',
      file: '/home/joachim/dev/billing-service/src/invoices/build-lines.ts',
      line: 27,
      column: 31,
      isFramework: false,
    });
    expect(exc.frames[1]).toMatchObject({ className: 'InvoiceService', method: 'createInvoice' });
    expect(exc.frames[2]).toMatchObject({ className: 'InvoiceController', method: 'create', isAsync: true });
  });

  it('flags node_modules, node:internal and runtime queue frames as framework', () => {
    const t = parseJavaScript(TYPESCRIPT_SAMPLE);
    const flags = t.exceptions[0].frames.map((f) => f.isFramework);
    expect(flags).toEqual([false, false, false, true, true, true, true, true, true, true, false, true]);
  });

  it('handles location-only frames and [as alias] names', () => {
    const t = parseJavaScript(`Error: x
    at /app/src/index.js:5:3
    at Layer.handle [as handle_request] (/app/src/router.js:9:1)
    at new Server (/app/src/server.js:1:1)
    at async Promise.all (index 0)`);
    const f = t.exceptions[0].frames;
    expect(f[0]).toMatchObject({ method: '<anonymous>', file: '/app/src/index.js', line: 5, column: 3 });
    expect(f[1]).toMatchObject({ className: 'Layer', method: 'handle' });
    expect(f[2]).toMatchObject({ method: 'new Server' });
    expect(f[2].className).toBeUndefined();
    expect(f[3]).toMatchObject({ className: 'Promise', method: 'all', file: 'index 0', isFramework: true, isAsync: true });
  });

  it('parses Firefox-style frames', () => {
    const t = parseJavaScript(`TypeError: foo is undefined
render@http://localhost:5173/src/App.tsx:22:7
@http://localhost:5173/src/main.tsx:4:1
callCallback@http://localhost:5173/node_modules/react-dom/cjs/react-dom.development.js:4164:14`);
    const f = t.exceptions[0].frames;
    expect(f[0]).toMatchObject({ method: 'render', file: 'http://localhost:5173/src/App.tsx', line: 22, column: 7 });
    expect(f[1].method).toBe('<anonymous>');
    expect(f[2].isFramework).toBe(true);
  });

  it('parses Uncaught prefix and [cause] chains', () => {
    const t = parseJavaScript(`Uncaught (in promise) Error: outer
    at run (/app/a.js:1:1)
  [cause]: RangeError: inner
      at deep (/app/b.js:2:2)`);
    expect(t.exceptions.map((e) => e.type)).toEqual(['Error', 'RangeError']);
    expect(t.exceptions[1].frames[0].method).toBe('deep');
  });
});
