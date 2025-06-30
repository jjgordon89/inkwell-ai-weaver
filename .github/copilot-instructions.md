---
description: AI rules derived by SpecStory from the project AI interaction history
globs: *
---

## HEADERS

## PROJECT RULES
*   The project should open to the Projects page on startup.
*   The default route ("/") should redirect to `/projects`.
*   All unknown routes should redirect to `/projects`.

## CODING STANDARDS

*   When fixing Typescript issues reported by the IDE:
    *   If the error is caused by passing `string | undefined` to a function that expects a `string`, use the nullish coalescing operator (`??`) to provide a default empty string, ensuring a string is always passed.  For example: `description ?? title ?? ""`
*   When working with user input, always sanitize string fields using the `sanitizeString` utility before saving to the database or rendering in the UI to prevent XSS/injection vulnerabilities. Pay special attention to sanitizing rich text fields.
*   When handling asynchronous operations (database, AI, network requests), always provide user feedback (e.g., loading indicators) and implement robust error handling to display errors in the UI. Use toasts or modals for error/success messages to make feedback more noticeable. Consider using skeleton loaders or spinners for async operations.
*   Ensure that the API key is masked in all UI and API responses when dealing with AI Providers. Only the first and last 2 characters should be shown, with the rest as asterisks (e.g., `AK****************9Z`).
*   Use a single source of truth for union types and interfaces (e.g., define them in `types/` and import everywhere).
*   When addressing ESLint errors for `@typescript-eslint/no-explicit-any`, replace `any` types with specific types, `unknown`, or type assertions with comments explaining why the assertion is safe. Use strict TypeScript settings to minimize `any` usage.
*   When initializing SQL.js in a Web Worker:
    *   Load the official UMD build of SQL.js from `https://github.com/sql-js/sql.js/releases/download/1.8.0/sql-wasm.js` first.
    *   After `eval(scriptText)`, check for `initSqlJs` on `self`, `self.Module`, `self.exports`, and `self.sqlJs`.
    *   If `initSqlJs` is still not found, log all global keys and types for easier debugging.
*   Ensure all UI elements are accessible (ARIA labels, keyboard navigation, color contrast). Regularly audit accessibility with tools like axe or Lighthouse. Add skip-to-content links and focus outlines for all interactive elements.

## WORKFLOW & RELEASE RULES
*   Clicking the "Create New Project" button on the Projects page navigates to `/projects/new`.
*   `/projects/new` displays a project creation form (with name, description, and buttons).
*   Submitting the form or clicking "Cancel" on the new project page returns the user to the Projects page.
*   Implement pagination or lazy loading for large project lists.
*   The Projects page must include search, filter, and sort options for projects.
*   Users must be able to archive or delete projects from the Projects page. Implement confirmation dialogs before deleting.
*   The Projects page must display project metadata (created date, last modified date, etc.).

## TECH STACK
*   sql.js - SQLite compiled to WebAssembly
*   ReactQuill - Rich text editor component

## PROJECT DOCUMENTATION & CONTEXT SYSTEM

*   ManuscriptAppPlan-Refinement_.md
*   DevelopmentBlueprint.md

## DEBUGGING

*   When debugging Typescript or JSX errors, always check the file extension. React components with JSX must use the `.tsx` extension.