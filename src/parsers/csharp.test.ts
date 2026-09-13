import { describe, expect, it } from 'vitest';
import { parseCSharp, splitCSharpSignature } from './csharp';
import { CSHARP_SAMPLE } from '../samples';

describe('parseCSharp', () => {
  it('parses a simple exception with file and line', () => {
    const t = parseCSharp(`System.NullReferenceException: Object reference not set to an instance of an object.
   at Contoso.Billing.InvoiceService.Total(Invoice invoice) in C:\\src\\Billing\\InvoiceService.cs:line 42
   at Contoso.Billing.Program.Main(String[] args) in C:\\src\\Billing\\Program.cs:line 10`);
    expect(t.exceptions).toHaveLength(1);
    const [exc] = t.exceptions;
    expect(exc.type).toBe('System.NullReferenceException');
    expect(exc.message).toBe('Object reference not set to an instance of an object.');
    expect(exc.frames).toHaveLength(2);
    expect(exc.frames[0]).toMatchObject({
      namespace: 'Contoso.Billing',
      className: 'InvoiceService',
      method: 'Total',
      args: 'Invoice invoice',
      file: 'C:\\src\\Billing\\InvoiceService.cs',
      line: 42,
      isFramework: false,
      isAsync: false,
    });
  });

  it('parses chained inner exceptions written inline with --->', () => {
    const t = parseCSharp(CSHARP_SAMPLE);
    expect(t.exceptions.map((e) => e.type)).toEqual([
      'System.InvalidOperationException',
      'Microsoft.EntityFrameworkCore.DbUpdateException',
      'Npgsql.PostgresException',
    ]);
    expect(t.exceptions[2].message).toContain('duplicate key');
    // Innermost exception gets the frames printed first.
    expect(t.exceptions[2].frames[0].className).toBe('NpgsqlConnector');
    // Middle exception gets the frames between the two end markers.
    expect(t.exceptions[1].frames.every((f) => f.namespace?.startsWith('Microsoft.EntityFrameworkCore'))).toBe(true);
    // Outer exception carries the application frames.
    const outerApp = t.exceptions[0].frames.filter((f) => !f.isFramework);
    expect(outerApp.map((f) => f.method)).toEqual([
      'SaveChangesAsync',
      'Handle',
      'Handle',
      'Handle',
      'Register',
      'InvokeAsync',
    ]);
  });

  it('parses inner exceptions written on their own ---> line', () => {
    const t = parseCSharp(`System.AggregateException: One or more errors occurred.
 ---> System.TimeoutException: The operation timed out.
   at Acme.Net.Client.Send() in C:\\src\\Client.cs:line 5
   --- End of inner exception stack trace ---
   at Acme.App.Run() in C:\\src\\App.cs:line 9`);
    expect(t.exceptions.map((e) => e.type)).toEqual(['System.AggregateException', 'System.TimeoutException']);
    expect(t.exceptions[1].frames[0].method).toBe('Send');
    expect(t.exceptions[0].frames[0].method).toBe('Run');
  });

  it('demangles async state machine frames', () => {
    const sig = splitCSharpSignature('Contoso.Users.UserService.<GetUserDetailsAsync>d__14.MoveNext()');
    expect(sig).toMatchObject({
      namespace: 'Contoso.Users',
      className: 'UserService',
      method: 'GetUserDetailsAsync',
      rawMethod: '<GetUserDetailsAsync>d__14.MoveNext',
      isAsync: true,
    });
  });

  it('keeps generic arity and nested types intact when splitting', () => {
    const sig = splitCSharpSignature(
      'System.Runtime.CompilerServices.TaskAwaiter`1.GetResult()',
    );
    expect(sig.className).toBe('TaskAwaiter`1');
    expect(sig.method).toBe('GetResult');
    expect(sig.args).toBe('');
  });

  it('flags System, Microsoft and NUnit frames as framework', () => {
    const t = parseCSharp(`NUnit.Framework.AssertionException: Expected 1 but was 2
   at NUnit.Framework.Assert.That(Object actual, IResolveConstraint expression)
   at System.Linq.Enumerable.Select(IEnumerable source)
   at Microsoft.Extensions.Hosting.HostBuilder.Build()
   at Acme.Tests.CalcTests.Adds() in C:\\src\\CalcTests.cs:line 12`);
    expect(t.exceptions[0].frames.map((f) => f.isFramework)).toEqual([true, true, true, false]);
  });

  it('collects multi-line messages before the first frame', () => {
    const t = parseCSharp(`System.ArgumentException: Bad input
Parameter name: id
   at Acme.Api.Get(Int32 id)`);
    expect(t.exceptions[0].message).toBe('Bad input\nParameter name: id');
  });
});
