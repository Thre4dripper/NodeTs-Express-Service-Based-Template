# Protos (local)

Local Protocol Buffer definitions for this service. Protos live **inside the
service** (no git submodule) so a freshly scaffolded project works end-to-end.

```
proto/
  shared/     # reusable messages + health check contract
  user/       # demo User service (mirror of the REST user demo)
  generated/  # ts-proto output (git-ignored, TS tree only)
```

## TypeScript tree

Generate type-safe stubs with ts-proto:

```bash
pnpm proto:build-ts        # runs scripts/proto-gen.sh src-typescript/proto
```

`pnpm build` runs this before compiling TypeScript. For a fresh clone, run
`pnpm proto:build-ts` after `pnpm install` if the generated folder does not exist.
No system `protoc` is required because the bundled compiler ships with the
`grpc-tools` dev dependency. The generated output is git-ignored; it is always
rebuilt from the `.proto` files, which are the single source of truth.

Output lands in `proto/generated/` and is imported via the `@proto/*` path alias,
e.g. `import { UserRpcService } from '@proto/generated/user/user'`. The demo user
controllers import the generated response types (`RegisterUserResponse`,
`LoginUserResponse`) so the gRPC response shape is validated against the proto.

## JavaScript tree

The JS variant has **no codegen**. It loads these same `.proto` files at runtime
with `@grpc/proto-loader` (see `src-javascript/config/grpcConfig.js`). Keep both
trees in sync from this single set of `.proto` files.

## Calling another service (consumer)

To call a remote service, drop a copy of that service's `.proto` here, regenerate,
and use `GrpcClientFactory` together with the generic `getRpcClient` helper in
`app/common/grpc.client.ts` (see the usage example in the user controllers).

> Optional alternative for large multi-service estates: a central proto repo via
> git submodule. Not used by default in this template.
