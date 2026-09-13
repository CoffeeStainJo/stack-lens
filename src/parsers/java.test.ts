import { describe, expect, it } from 'vitest';
import { parseJava } from './java';
import { JAVA_SAMPLE } from '../samples';

describe('parseJava', () => {
  it('parses Caused by chains outermost-first with elided counts', () => {
    const t = parseJava(JAVA_SAMPLE);
    expect(t.exceptions.map((e) => e.type)).toEqual([
      'org.springframework.dao.DataIntegrityViolationException',
      'org.hibernate.exception.ConstraintViolationException',
      'org.postgresql.util.PSQLException',
    ]);
    expect(t.exceptions[1].elided).toBe(34);
    expect(t.exceptions[2].elided).toBe(45);
  });

  it('parses frames with Spring Boot jar suffixes and JDK module prefixes', () => {
    const t = parseJava(JAVA_SAMPLE);
    const frames = t.exceptions[0].frames;
    expect(frames[0]).toMatchObject({
      namespace: 'org.springframework.orm.jpa.vendor',
      className: 'HibernateJpaDialect',
      method: 'convertHibernateAccessException',
      file: 'HibernateJpaDialect.java',
      line: 294,
      isFramework: true,
    });
    const reflect = frames.find((f) => f.className === 'Method');
    expect(reflect).toMatchObject({ namespace: 'java.lang.reflect', method: 'invoke', line: 580, isFramework: true });
    const app = frames.filter((f) => !f.isFramework).map((f) => `${f.className}.${f.method}`);
    expect(app).toEqual(['CustomerService$$SpringCGLIB$$0.register', 'CustomerController.register', 'RequestIdFilter.doFilterInternal']);
  });

  it('handles "Exception in thread" headers, Native Method and Unknown Source', () => {
    const t = parseJava(`Exception in thread "main" java.lang.IllegalStateException: nope
	at java.base/java.lang.Thread.run(Native Method)
	at com.acme.Foo.bar(Unknown Source)
	at com.acme.Foo.main(Foo.java:12)`);
    expect(t.exceptions[0].type).toBe('java.lang.IllegalStateException');
    expect(t.exceptions[0].message).toBe('nope');
    expect(t.exceptions[0].frames[0].file).toBeUndefined();
    expect(t.exceptions[0].frames[1].file).toBeUndefined();
    expect(t.exceptions[0].frames[2]).toMatchObject({ file: 'Foo.java', line: 12, isFramework: false });
  });

  it('parses a Kotlin frame', () => {
    const t = parseJava(`java.lang.RuntimeException: boom
	at com.acme.MainKt.main(Main.kt:7)`);
    expect(t.exceptions[0].frames[0]).toMatchObject({ className: 'MainKt', file: 'Main.kt', line: 7 });
  });
});
