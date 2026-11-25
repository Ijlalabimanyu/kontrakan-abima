# Repository Guidelines

## General Principles

- Use TypeScript for all new application code.
- Follow existing coding conventions, naming patterns, and feature/service architecture.
- Keep changes minimal and focused on the requested task.
- Preserve existing functionality and avoid unrelated refactoring.
- Reuse existing components, hooks, utilities, schemas, and API fetcher/service conventions.
- Do not introduce unnecessary dependencies.
- Do not change API contracts, database schemas, or existing business logic unless explicitly requested.
- Prefer readable, maintainable, and type-safe implementations.
- Avoid using `any` unless absolutely necessary.

## Project Structure

- `src/app/`: Next.js App Router pages, layouts, and route handlers.
- `src/features/`: Domain-specific modules containing components, services, schemas, hooks, and interfaces.
- `src/components/`: Shared UI components, layouts, forms, tables, and templates.
- `src/services/`: Server actions and application-level services.
- `src/lib/supabase/`: Supabase client setup and configuration.
- `supabase/migrations/`: Database migration files.

## Development Guidelines

### Next.js
- Follow Next.js App Router conventions.
- Use Server Components by default.
- Use Client Components only when client-side interactivity or browser APIs are required.
- Keep server-side and client-side responsibilities separated.
- Follow existing patterns for data fetching and mutations.

### TypeScript
- Define explicit interfaces or types for application data.
- Reuse existing types whenever possible.
- Avoid duplicate type definitions.
- Ensure proper typing for component props, service responses, and function parameters.

### Supabase
- Reuse the existing Supabase client configuration.
- Follow established authentication and authorization patterns.
- Never expose service role keys or other secrets to client-side code.
- Use migrations for database structure changes.
- Do not modify existing migrations that have already been applied; create new migrations instead.
- Respect Row Level Security (RLS) policies.

### Components and Features
- Keep domain-specific logic inside the corresponding `src/features/` module.
- Put reusable components in `src/components/`.
- Separate UI components from business logic and data access.
- Follow existing naming and file organization conventions.
- Avoid duplicating components or utilities.

### Services and Data Fetching
- Follow existing service and server action patterns.
- Keep API and database access logic outside presentation components whenever practical.
- Handle loading, success, empty, and error states appropriately.
- Validate input before performing mutations.
- Preserve existing response structures and API contracts.

## Validation

- Run TypeScript validation after TypeScript changes.
- Run relevant tests when modifying existing functionality.
- Run linting on affected files when applicable.
- Run production builds when changes affect application configuration, routing, or build behavior.
- Fix errors introduced by the changes.
- Do not claim validation passed if the relevant command was not executed.

## Git and Change Management

- Do not revert or overwrite unrelated user changes.
- Do not modify environment files containing secrets.
- Do not commit or push changes unless explicitly requested.
- Keep changes scoped to the requested feature or bug fix.
- Summarize modified files and validation results after completing a task.
