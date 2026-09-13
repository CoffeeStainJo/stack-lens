import { describe, expect, it } from 'vitest';
import { parseRust } from './rust';
import { RUST_SAMPLE } from '../samples';

describe('parseRust', () => {
  it('parses the new panic header format with message on the following line', () => {
    const t = parseRust(RUST_SAMPLE);
    const exc = t.exceptions[0];
    expect(exc.type).toBe("panic in 'main'");
    expect(exc.location).toBe('src/config/loader.rs:88:42');
    expect(exc.message).toContain('called `Result::unwrap()` on an `Err` value');
    expect(exc.frames).toHaveLength(14);
  });

  it('splits symbols into crate path, type and method and attaches the at: location', () => {
    const t = parseRust(RUST_SAMPLE);
    const f = t.exceptions[0].frames[4];
    expect(f).toMatchObject({
      namespace: 'telemetry_agent::config',
      className: 'loader',
      method: 'load_config',
      file: './src/config/loader.rs',
      line: 88,
      column: 18,
      isFramework: false,
    });
  });

  it('flags std, core, tokio and cargo registry frames as framework', () => {
    const t = parseRust(RUST_SAMPLE);
    const flags = t.exceptions[0].frames.map((f) => f.isFramework);
    expect(flags).toEqual([true, true, true, true, false, false, false, true, true, true, true, true, false, true]);
  });

  it('parses the old panic header format', () => {
    const t = parseRust(`thread 'worker-3' panicked at 'index out of bounds: the len is 3 but the index is 7', src/grid.rs:41:9
stack backtrace:
   0: std::panicking::begin_panic
   1: mygame::grid::Grid::cell
             at ./src/grid.rs:41:9`);
    const exc = t.exceptions[0];
    expect(exc.type).toBe("panic in 'worker-3'");
    expect(exc.message).toBe('index out of bounds: the len is 3 but the index is 7');
    expect(exc.location).toBe('src/grid.rs:41:9');
    expect(exc.frames[1]).toMatchObject({ namespace: 'mygame::grid', className: 'Grid', method: 'cell', line: 41 });
  });

  it('strips hash suffixes and handles trait impl symbols', () => {
    const t = parseRust(`stack backtrace:
   0: <alloc::vec::Vec<T> as core::ops::index::Index<I>>::index::h1234567890abcdef
   1: app::run::h0123456789abcdef`);
    expect(t.exceptions[0].frames[0]).toMatchObject({ className: 'alloc::vec::Vec<T>', method: 'index' });
    expect(t.exceptions[0].frames[1]).toMatchObject({ className: 'app', method: 'run' });
  });
});
