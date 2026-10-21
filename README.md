# Zero-Docs Copilot

A Next.js/Gemini prototype for generating and revising payment integration code.
The generation and revision routes call Gemini. The generated-code audit checks
for substrings; it does not run that code, launch attacks, verify cryptographic
behavior or establish production safety. Telemetry/scenarios in the UI are
illustrations, not measured traffic or executed tests. The displayed CLI command
is an example; no published CLI is supplied.

## Run
`npm ci`, set `GEMINI_API_KEY` on the server, then `npm run dev`.

## Executable reference checks
`npm test` exercises a separate reference webhook validator: a valid signed
request, wrong signatures, duplicate event IDs and invalid currency values.
These tests establish the behavior of that reference module only. They do not
prove the correctness of arbitrary Gemini-generated code. The in-memory event
registry is a local demonstration, not a concurrent, durable payment ledger.

Before using generated code, independently inspect it and run contract/integration
tests against the provider sandbox with persistent, transactional idempotency.
