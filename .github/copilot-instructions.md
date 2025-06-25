---
description: AI rules derived by SpecStory from the project AI interaction history
globs: *
---

## HEADERS

## PROJECT RULES
*   The project should open to the Projects page on startup.

## CODING STANDARDS

*   When fixing Typescript issues reported by the IDE:
    *   If the error is caused by passing `string | undefined` to a function that expects a `string`, use the nullish coalescing operator (`??`) to provide a default empty string, ensuring a string is always passed.  For example: `description ?? title ?? ""`
*   When using the Typescript workflow utility, always specify the data and payload types for each workflow instance to improve reliability and IDE support.
*   When fixing Typescript errors, ensure that workflow state machines are fully type-safe.

## WORKFLOW & RELEASE RULES
*   Clicking the "Create New Project" button on the Projects page navigates to `/projects/new`.
*   `/projects/new` displays a project creation form (with name, description, and buttons).
*   Submitting the form or clicking "Cancel" on the new project page returns the user to the Projects page.
*   A workflow (state machine, wizard, or explicit process manager) should be implemented to improve user experience, reliability, and extensibility.
*   New projects must be persisted (in context, state, or database).
*   The Projects page must fetch and display the list of projects dynamically. The page must not use hardcoded mock data.

## TECH STACK
*   sql.js - SQLite compiled to WebAssembly
*   ReactQuill - Rich text editor component

## PROJECT DOCUMENTATION & CONTEXT SYSTEM

## DEBUGGING

*   When debugging Typescript or JSX errors, always check the file extension. React components with JSX must use the `.tsx` extension.