import type { Language } from '../parsers';

export interface Sample {
  id: string;
  label: string;
  language: Language;
  text: string;
}

export const CSHARP_SAMPLE = `Unhandled exception. System.InvalidOperationException: An error occurred while saving the entity changes. See the inner exception for details. ---> Microsoft.EntityFrameworkCore.DbUpdateException: An error occurred while saving the entity changes. ---> Npgsql.PostgresException: 23505: duplicate key value violates unique constraint "IX_Users_Email"
   at Npgsql.Internal.NpgsqlConnector.ReadMessageLong(Boolean async, DataRowLoadingMode dataRowLoadingMode, Boolean readingNotifications, Boolean isReadingPrependedMessage)
   at System.Runtime.CompilerServices.PoolingAsyncValueTaskMethodBuilder\`1.StateMachineBox\`1.System.Threading.Tasks.Sources.IValueTaskSource<TResult>.GetResult(Int16 token)
   at Npgsql.NpgsqlDataReader.NextResult(Boolean async, Boolean isConsuming, CancellationToken cancellationToken)
   at Npgsql.NpgsqlCommand.ExecuteReader(Boolean async, CommandBehavior behavior, CancellationToken cancellationToken)
   at Microsoft.EntityFrameworkCore.Update.ReaderModificationCommandBatch.ExecuteAsync(IRelationalConnection connection, CancellationToken cancellationToken)
   --- End of inner exception stack trace ---
   at Microsoft.EntityFrameworkCore.Update.ReaderModificationCommandBatch.ExecuteAsync(IRelationalConnection connection, CancellationToken cancellationToken)
   at Microsoft.EntityFrameworkCore.Update.Internal.BatchExecutor.ExecuteAsync(IEnumerable\`1 commandBatches, IRelationalConnection connection, CancellationToken cancellationToken)
   at Microsoft.EntityFrameworkCore.ChangeTracking.Internal.StateManager.SaveChangesAsync(IList\`1 entriesToSave, CancellationToken cancellationToken)
   at Microsoft.EntityFrameworkCore.DbContext.SaveChangesAsync(Boolean acceptAllChangesOnSuccess, CancellationToken cancellationToken)
   --- End of inner exception stack trace ---
   at Contoso.Orders.Infrastructure.Persistence.OrdersDbContext.<SaveChangesAsync>d__12.MoveNext() in C:\\Users\\joachim\\src\\contoso-orders\\src\\Contoso.Orders.Infrastructure\\Persistence\\OrdersDbContext.cs:line 58
   --- End of stack trace from previous location ---
   at Contoso.Orders.Application.Users.RegisterUserHandler.<Handle>d__3.MoveNext() in C:\\Users\\joachim\\src\\contoso-orders\\src\\Contoso.Orders.Application\\Users\\RegisterUserHandler.cs:line 41
   --- End of stack trace from previous location ---
   at MediatR.Wrappers.RequestHandlerWrapperImpl\`2.<>c__DisplayClass1_0.<<Handle>b__0>d.MoveNext()
   at Contoso.Orders.Application.Behaviors.LoggingBehavior\`2.<Handle>d__4.MoveNext() in C:\\Users\\joachim\\src\\contoso-orders\\src\\Contoso.Orders.Application\\Behaviors\\LoggingBehavior.cs:line 27
   at Contoso.Orders.Application.Behaviors.ValidationBehavior\`2.<Handle>d__2.MoveNext() in C:\\Users\\joachim\\src\\contoso-orders\\src\\Contoso.Orders.Application\\Behaviors\\ValidationBehavior.cs:line 33
   at Contoso.Orders.Api.Controllers.UsersController.<Register>d__5.MoveNext() in C:\\Users\\joachim\\src\\contoso-orders\\src\\Contoso.Orders.Api\\Controllers\\UsersController.cs:line 52
   at Microsoft.AspNetCore.Mvc.Infrastructure.ActionMethodExecutor.TaskOfIActionResultExecutor.Execute(ActionContext actionContext, IActionResultTypeMapper mapper, ObjectMethodExecutor executor, Object controller, Object[] arguments)
   at Microsoft.AspNetCore.Mvc.Infrastructure.ControllerActionInvoker.<InvokeActionMethodAsync>g__Awaited|12_0(ControllerActionInvoker invoker, ValueTask\`1 actionResultValueTask)
   at Microsoft.AspNetCore.Mvc.Infrastructure.ControllerActionInvoker.<InvokeNextActionFilterAsync>g__Awaited|10_0(ControllerActionInvoker invoker, Task lastTask, State next, Scope scope, Object state, Boolean isCompleted)
   at Microsoft.AspNetCore.Mvc.Infrastructure.ControllerActionInvoker.Rethrow(ActionExecutedContextSealed context)
   at Microsoft.AspNetCore.Mvc.Infrastructure.ControllerActionInvoker.Next(State& next, Scope& scope, Object& state, Boolean& isCompleted)
   at Microsoft.AspNetCore.Mvc.Infrastructure.ControllerActionInvoker.<InvokeInnerFilterAsync>g__Awaited|13_0(ControllerActionInvoker invoker, Task lastTask, State next, Scope scope, Object state, Boolean isCompleted)
   at Microsoft.AspNetCore.Mvc.Infrastructure.ResourceInvoker.<InvokeFilterPipelineAsync>g__Awaited|20_0(ResourceInvoker invoker, Task lastTask, State next, Scope scope, Object state, Boolean isCompleted)
   at Microsoft.AspNetCore.Mvc.Infrastructure.ResourceInvoker.<InvokeAsync>g__Awaited|17_0(ResourceInvoker invoker, Task task, IDisposable scope)
   at Microsoft.AspNetCore.Routing.EndpointMiddleware.<Invoke>g__AwaitRequestTask|7_0(Endpoint endpoint, Task requestTask, ILogger logger)
   at Microsoft.AspNetCore.Authorization.AuthorizationMiddleware.Invoke(HttpContext context)
   at Microsoft.AspNetCore.Authentication.AuthenticationMiddleware.Invoke(HttpContext context)
   at Contoso.Orders.Api.Middleware.CorrelationIdMiddleware.<InvokeAsync>d__3.MoveNext() in C:\\Users\\joachim\\src\\contoso-orders\\src\\Contoso.Orders.Api\\Middleware\\CorrelationIdMiddleware.cs:line 24
   at Microsoft.AspNetCore.Diagnostics.DeveloperExceptionPageMiddlewareImpl.Invoke(HttpContext context)`;

export const PYTHON_SAMPLE = `Traceback (most recent call last):
  File "/home/joachim/projects/inventory-api/app/repositories/stock.py", line 44, in fetch_sku
    row = await conn.fetchrow(query, sku)
  File "/home/joachim/.venv/lib/python3.12/site-packages/asyncpg/connection.py", line 703, in fetchrow
    data = await self._execute(
  File "/home/joachim/.venv/lib/python3.12/site-packages/asyncpg/connection.py", line 1864, in _execute
    result, _ = await self.__execute(
  File "/home/joachim/.venv/lib/python3.12/site-packages/asyncpg/connection.py", line 1961, in __execute
    return await self._do_execute(
asyncpg.exceptions.UndefinedTableError: relation "stock_levels" does not exist

The above exception was the direct cause of the following exception:

Traceback (most recent call last):
  File "/home/joachim/.venv/lib/python3.12/site-packages/uvicorn/protocols/http/h11_impl.py", line 408, in run_asgi
    result = await app(
  File "/home/joachim/.venv/lib/python3.12/site-packages/uvicorn/middleware/proxy_headers.py", line 84, in __call__
    return await self.app(scope, receive, send)
  File "/home/joachim/.venv/lib/python3.12/site-packages/fastapi/applications.py", line 1054, in __call__
    await super().__call__(scope, receive, send)
  File "/home/joachim/.venv/lib/python3.12/site-packages/starlette/applications.py", line 123, in __call__
    await self.middleware_stack(scope, receive, send)
  File "/home/joachim/.venv/lib/python3.12/site-packages/starlette/middleware/errors.py", line 186, in __call__
    raise exc
  File "/home/joachim/.venv/lib/python3.12/site-packages/starlette/middleware/errors.py", line 164, in __call__
    await self.app(scope, receive, _send)
  File "/home/joachim/.venv/lib/python3.12/site-packages/starlette/routing.py", line 756, in __call__
    await self.middleware_stack(scope, receive, send)
  File "/home/joachim/.venv/lib/python3.12/site-packages/starlette/routing.py", line 776, in app
    await route.handle(scope, receive, send)
  File "/home/joachim/.venv/lib/python3.12/site-packages/starlette/routing.py", line 297, in handle
    await self.app(scope, receive, send)
  File "/home/joachim/.venv/lib/python3.12/site-packages/fastapi/routing.py", line 278, in app
    raw_response = await run_endpoint_function(
  File "/home/joachim/.venv/lib/python3.12/site-packages/fastapi/routing.py", line 191, in run_endpoint_function
    return await dependant.call(**values)
  File "/home/joachim/projects/inventory-api/app/routers/stock.py", line 31, in get_stock_level
    level = await stock_service.get_level(sku)
  File "/home/joachim/projects/inventory-api/app/services/stock_service.py", line 58, in get_level
    record = await self.repo.fetch_sku(sku)
  File "/home/joachim/projects/inventory-api/app/repositories/stock.py", line 47, in fetch_sku
    raise StockRepositoryError(f"Could not load SKU {sku}") from exc
app.errors.StockRepositoryError: Could not load SKU WH-4471`;

export const TYPESCRIPT_SAMPLE = `TypeError: Cannot read properties of undefined (reading 'items')
    at buildInvoiceLines (/home/joachim/dev/billing-service/src/invoices/build-lines.ts:27:31)
    at InvoiceService.createInvoice (/home/joachim/dev/billing-service/src/invoices/invoice.service.ts:64:22)
    at async InvoiceController.create (/home/joachim/dev/billing-service/src/invoices/invoice.controller.ts:41:20)
    at async /home/joachim/dev/billing-service/node_modules/@nestjs/core/router/router-execution-context.js:46:28
    at async /home/joachim/dev/billing-service/node_modules/@nestjs/core/router/router-proxy.js:9:17
    at async Layer.handle [as handle_request] (/home/joachim/dev/billing-service/node_modules/express/lib/router/layer.js:95:5)
    at async next (/home/joachim/dev/billing-service/node_modules/express/lib/router/route.js:149:13)
    at async Route.dispatch (/home/joachim/dev/billing-service/node_modules/express/lib/router/route.js:119:3)
    at async Function.process_params (/home/joachim/dev/billing-service/node_modules/express/lib/router/index.js:346:12)
    at async next (/home/joachim/dev/billing-service/node_modules/express/lib/router/index.js:280:10)
    at async RequestLoggerMiddleware.use (/home/joachim/dev/billing-service/src/common/request-logger.middleware.ts:18:5)
    at process.processTicksAndRejections (node:internal/process/task_queues:95:5)`;

export const JAVA_SAMPLE = `org.springframework.dao.DataIntegrityViolationException: could not execute statement; SQL [n/a]; constraint [uk_customer_email]
	at org.springframework.orm.jpa.vendor.HibernateJpaDialect.convertHibernateAccessException(HibernateJpaDialect.java:294) ~[spring-orm-6.1.4.jar:6.1.4]
	at org.springframework.orm.jpa.vendor.HibernateJpaDialect.translateExceptionIfPossible(HibernateJpaDialect.java:244) ~[spring-orm-6.1.4.jar:6.1.4]
	at org.springframework.orm.jpa.JpaTransactionManager.doCommit(JpaTransactionManager.java:566) ~[spring-orm-6.1.4.jar:6.1.4]
	at org.springframework.transaction.support.AbstractPlatformTransactionManager.processCommit(AbstractPlatformTransactionManager.java:795) ~[spring-tx-6.1.4.jar:6.1.4]
	at org.springframework.transaction.support.AbstractPlatformTransactionManager.commit(AbstractPlatformTransactionManager.java:758) ~[spring-tx-6.1.4.jar:6.1.4]
	at org.springframework.transaction.interceptor.TransactionAspectSupport.commitTransactionAfterReturning(TransactionAspectSupport.java:698) ~[spring-tx-6.1.4.jar:6.1.4]
	at org.springframework.transaction.interceptor.TransactionAspectSupport.invokeWithinTransaction(TransactionAspectSupport.java:426) ~[spring-tx-6.1.4.jar:6.1.4]
	at org.springframework.transaction.interceptor.TransactionInterceptor.invoke(TransactionInterceptor.java:119) ~[spring-tx-6.1.4.jar:6.1.4]
	at org.springframework.aop.framework.ReflectiveMethodInvocation.proceed(ReflectiveMethodInvocation.java:184) ~[spring-aop-6.1.4.jar:6.1.4]
	at org.springframework.aop.framework.CglibAopProxy$CglibMethodInvocation.proceed(CglibAopProxy.java:765) ~[spring-aop-6.1.4.jar:6.1.4]
	at org.springframework.aop.framework.CglibAopProxy$DynamicAdvisedInterceptor.intercept(CglibAopProxy.java:717) ~[spring-aop-6.1.4.jar:6.1.4]
	at com.acme.crm.customers.CustomerService$$SpringCGLIB$$0.register(<generated>) ~[classes/:na]
	at com.acme.crm.customers.CustomerController.register(CustomerController.java:48) ~[classes/:na]
	at java.base/jdk.internal.reflect.DirectMethodHandleAccessor.invoke(DirectMethodHandleAccessor.java:103) ~[na:na]
	at java.base/java.lang.reflect.Method.invoke(Method.java:580) ~[na:na]
	at org.springframework.web.method.support.InvocableHandlerMethod.doInvoke(InvocableHandlerMethod.java:255) ~[spring-web-6.1.4.jar:6.1.4]
	at org.springframework.web.servlet.mvc.method.annotation.ServletInvocableHandlerMethod.invokeAndHandle(ServletInvocableHandlerMethod.java:118) ~[spring-webmvc-6.1.4.jar:6.1.4]
	at org.springframework.web.servlet.DispatcherServlet.doDispatch(DispatcherServlet.java:1089) ~[spring-webmvc-6.1.4.jar:6.1.4]
	at org.apache.catalina.core.ApplicationFilterChain.internalDoFilter(ApplicationFilterChain.java:174) ~[tomcat-embed-core-10.1.19.jar:10.1.19]
	at com.acme.crm.web.RequestIdFilter.doFilterInternal(RequestIdFilter.java:31) ~[classes/:na]
	at org.springframework.web.filter.OncePerRequestFilter.doFilter(OncePerRequestFilter.java:116) ~[spring-web-6.1.4.jar:6.1.4]
	at java.base/java.lang.Thread.run(Thread.java:1583) ~[na:na]
Caused by: org.hibernate.exception.ConstraintViolationException: could not execute statement
	at org.hibernate.exception.internal.SQLStateConversionDelegate.convert(SQLStateConversionDelegate.java:97) ~[hibernate-core-6.4.4.Final.jar:6.4.4.Final]
	at org.hibernate.engine.jdbc.spi.SqlExceptionHelper.convert(SqlExceptionHelper.java:58) ~[hibernate-core-6.4.4.Final.jar:6.4.4.Final]
	at org.hibernate.persister.entity.AbstractEntityPersister.insert(AbstractEntityPersister.java:2846) ~[hibernate-core-6.4.4.Final.jar:6.4.4.Final]
	at com.acme.crm.customers.CustomerRepositoryImpl.save(CustomerRepositoryImpl.java:72) ~[classes/:na]
	... 34 common frames omitted
Caused by: org.postgresql.util.PSQLException: ERROR: duplicate key value violates unique constraint "uk_customer_email"
	at org.postgresql.core.v3.QueryExecutorImpl.receiveErrorResponse(QueryExecutorImpl.java:2725) ~[postgresql-42.7.2.jar:42.7.2]
	at org.postgresql.core.v3.QueryExecutorImpl.processResults(QueryExecutorImpl.java:2412) ~[postgresql-42.7.2.jar:42.7.2]
	at org.postgresql.jdbc.PgPreparedStatement.executeUpdate(PgPreparedStatement.java:159) ~[postgresql-42.7.2.jar:42.7.2]
	at com.zaxxer.hikari.pool.ProxyPreparedStatement.executeUpdate(ProxyPreparedStatement.java:61) ~[HikariCP-5.0.1.jar:na]
	... 45 common frames omitted`;

export const RUST_SAMPLE = `thread 'main' panicked at src/config/loader.rs:88:42:
called \`Result::unwrap()\` on an \`Err\` value: Error("missing field \`database_url\`", line: 12, column: 1)
note: run with \`RUST_BACKTRACE=1\` environment variable to display a backtrace
stack backtrace:
   0: rust_begin_unwind
             at /rustc/07dca489ac2d933c78d3c5158e3f43beefeb02ce/library/std/src/panicking.rs:645:5
   1: core::panicking::panic_fmt
             at /rustc/07dca489ac2d933c78d3c5158e3f43beefeb02ce/library/core/src/panicking.rs:72:14
   2: core::result::unwrap_failed
             at /rustc/07dca489ac2d933c78d3c5158e3f43beefeb02ce/library/core/src/result.rs:1654:5
   3: core::result::Result<T,E>::unwrap
             at /rustc/07dca489ac2d933c78d3c5158e3f43beefeb02ce/library/core/src/result.rs:1077:23
   4: telemetry_agent::config::loader::load_config
             at ./src/config/loader.rs:88:18
   5: telemetry_agent::app::App::bootstrap
             at ./src/app.rs:41:22
   6: telemetry_agent::main::{{closure}}
             at ./src/main.rs:17:31
   7: tokio::runtime::park::CachedParkThread::block_on::{{closure}}
             at /home/joachim/.cargo/registry/src/index.crates.io-6f17d22bba15001f/tokio-1.36.0/src/runtime/park.rs:281:63
   8: tokio::runtime::coop::with_budget
             at /home/joachim/.cargo/registry/src/index.crates.io-6f17d22bba15001f/tokio-1.36.0/src/runtime/coop.rs:107:5
   9: tokio::runtime::park::CachedParkThread::block_on
             at /home/joachim/.cargo/registry/src/index.crates.io-6f17d22bba15001f/tokio-1.36.0/src/runtime/park.rs:281:31
  10: tokio::runtime::context::runtime::enter_runtime
             at /home/joachim/.cargo/registry/src/index.crates.io-6f17d22bba15001f/tokio-1.36.0/src/runtime/context/runtime.rs:65:16
  11: tokio::runtime::runtime::Runtime::block_on
             at /home/joachim/.cargo/registry/src/index.crates.io-6f17d22bba15001f/tokio-1.36.0/src/runtime/runtime.rs:351:45
  12: telemetry_agent::main
             at ./src/main.rs:17:5
  13: core::ops::function::FnOnce::call_once
             at /rustc/07dca489ac2d933c78d3c5158e3f43beefeb02ce/library/core/src/ops/function.rs:250:5
note: Some details are omitted, run with \`RUST_BACKTRACE=full\` for a verbose backtrace.`;

export const SAMPLES: Sample[] = [
  { id: 'csharp', label: 'C# · EF Core / Async', language: 'csharp', text: CSHARP_SAMPLE },
  { id: 'python', label: 'Python · FastAPI', language: 'python', text: PYTHON_SAMPLE },
  { id: 'typescript', label: 'TypeScript · Node Async', language: 'javascript', text: TYPESCRIPT_SAMPLE },
  { id: 'java', label: 'Java · Spring Boot', language: 'java', text: JAVA_SAMPLE },
  { id: 'rust', label: 'Rust · Panic', language: 'rust', text: RUST_SAMPLE },
];
