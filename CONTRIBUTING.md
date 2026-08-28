# Contributing to Zero-Docs Copilot

Thank you for your interest in contributing to the Zero-Docs Chaos Copilot. As an open-source project aimed at improving Developer Experience (DX) across the FinTech ecosystem, we welcome contributions from the community.

## Development Process

1. **Fork the repository** and create your branch from `main`.
2. **Install dependencies** via `npm install`.
3. **Environment setup:** Ensure you have a valid `GEMINI_API_KEY` in your `.env.local` file.
4. **Code Standards:** 
   - Ensure all Next.js server components and client components are properly demarcated (`"use client"`).
   - Maintain strict typing where applicable.
   - Do not introduce UI frameworks (e.g., Tailwind, Material UI) as this project strictly relies on optimized Vanilla CSS for its design system.
5. **Run tests:** Ensure `npm run build` succeeds locally before opening a Pull Request.

## Pull Request Process

1. Describe the problem your PR solves in detail.
2. If your PR introduces changes to the Prompt Engineering logic in `src/app/api/generate/route.ts`, include an example of the generated code output in your PR description.
3. Ensure the CI pipeline passes.

## Code of Conduct
By participating in this project, you agree to maintain a professional, inclusive, and respectful environment for all contributors.
