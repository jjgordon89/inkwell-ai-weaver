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
*   When using Web Workers with TypeScript:
    *   Define types for the expected data structures passed between the main thread and the worker to avoid the use of `any` or `unknown` types, and add type assertions where needed.
    *   Ensure that all database code, including SQL.js, in web workers is fully type-safe and ESLint-compliant. Replace `any` usages with type-safe assertions, type guards, or specific types, with comments explaining dynamic injections or type conversions where necessary.
    *   Remove any unused `@ts-expect-error` directives and unnecessary `eslint-disable` comments. If a `@ts-expect-error` is needed, add a description of at least 3 characters explaining why.
*   When working with database interactions:
    *   Implement debounced and/or batched writes to `localStorage` for better performance, especially in AI or autosave scenarios.
    *   Add validation for JSON fields before saving to the database.
    *   Sanitize all user input before saving to the database.
*   When sanitizing string inputs, use a `sanitizeString` utility for all user-facing string fields (project/template/provider names, descriptions, etc.) to prevent XSS/injection.
*   Ensure there is only one implementation of each method within a class. Remove any duplicate method implementations.

## WORKFLOW & RELEASE RULES
*   Clicking the "Create New Project" button on the Projects page navigates to `/projects/new`.
*   `/projects/new` displays a project creation form (with name, description, and buttons).
*   Submitting the form or clicking "Cancel" on the new project page returns the user to the Projects page.
*   A workflow (state machine, wizard, or explicit process manager) should be implemented to improve user experience, reliability, and extensibility.
    *   The project creation process should use a workflow (state machine) to manage steps: idle → editing → validating → saving → success/error. This workflow should support navigation (cancel, submit, back) and integrate with the database for persistence, and be extensible for future steps (e.g., AI project setup, template selection, etc.). This workflow must be implemented in the `/projects/new` page/component.
*   New projects must be persisted to the database.
    *   **NOTE:** With the elimination of the backend database dependency, persistence will be handled via browser local storage (or IndexedDB for larger datasets). All existing database persistence rules now apply to local storage persistence.
*   The Projects page must fetch and display the list of projects dynamically from the database. The page must not use hardcoded mock data.
    *   **NOTE:** With the elimination of the backend database dependency, the Projects page will now fetch project data from local storage (or IndexedDB).
*   The project creation workflow should incorporate a template selection step before editing project details.
*   The project creation workflow must support AI-powered template selection. This includes:
    *   An "AI-Powered Template" option in the template selection step.
    *   An input field for the user to describe the project or desired template.
    *   Allow users to specify more details (genre, tone, structure, etc.) for the AI template.
    *   A "Generate Template with AI" button that calls an AI service to generate a project name/description/template.
    *   Integration of the generated template into the workflow, allowing the user to edit before saving.
    *   Show a live preview of the generated template before finalizing.
    *   Allow users to iteratively refine the AI-generated template (e.g., “Regenerate” or “Edit and Retry”).
*   Template Library Management: Allow saving, editing, and reusing custom templates.
    *   Users must be able to edit and delete templates via the UI.
    *   The template selection UI should show a richer preview or allow inline editing before use.
*   Fallback Logic: Add support for alternative AI providers or graceful fallback if the main API fails.
*   Inline editing and richer previews are present, but template re-use (applying a template to a new/existing project) should be accessible from the project creation and editing flows.
*   Implement hybrid synchronization strategies for seamless transitions between devices, using local storage as the primary source of truth.
*   Implement versioning capabilities, conflict resolution mechanisms, and encrypted storage for sensitive data within the local storage management system.
*   Develop comprehensive data integrity checks and backup/restore utilities to protect against local storage corruption or unpredictable device behaviors.
*   Use browser localStorage as the main persistent store for all user data (settings, preferences, app state, etc.).
*   Optionally leverage IndexedDB for large datasets, but always treat localStorage as the primary source of truth.
*   Implement:
    *   Versioning and schema migration for stored data.
    *   Conflict resolution (for multi-device or concurrent access).
    *   Encryption for sensitive data.
    *   Data validation and integrity checks.
    *   Backup/restore utilities for user data.

## TECH STACK
*   sql.js - SQLite compiled to WebAssembly **NOTE:** Will be removed as part of the backend elimination refactor.
*   ReactQuill - Rich text editor component

## PROJECT DOCUMENTATION & CONTEXT SYSTEM
*   Add JSDoc comments for all public methods in `database.ts` for better maintainability. **NOTE:** Much of `database.ts` will be removed as part of the backend elimination refactor. New data management modules will need similar documentation.

## DEBUGGING

*   When debugging Typescript or JSX errors, always check the file extension. React components with JSX must use the `.tsx` extension.
*   When debugging app freezing issues, especially when using AI Assistance:
    *   **Database Blocking:** `sql.js` runs database operations synchronously on the main thread which can block the UI. To avoid blocking the main thread with `sql.js`, move all database operations into a Web Worker. This way, heavy queries and writes won't freeze the UI, especially during AI Assistance or autosave. The main thread should communicate with the worker using message passing and Promises. **NOTE:** This rule will be updated to reflect local storage/IndexedDB usage instead of `sql.js`.
    *   **AI Assistance Loops:** Heavy computations or loops in AI Assistance can freeze the UI.
    *   **Unawaited Initialization:** Ensure `database.initialize()` is only called once at app startup and is awaited properly. **NOTE:** `database.initialize()` and related rules will need to be updated or removed based on the refactor.
    *   **Debounce Saves:** Debounce database writes from AI Assistance (e.g., save every 1-2 seconds or after the user stops typing).
    *   **Profile:** Use `console.time`/`console.timeEnd` around database and AI Assistance calls to identify slow operations.
    *   **Log:** Log when `database.initialize()` is called to ensure it isn't called too often.
    *   **Batch Writes:** Batch database writes instead of writing after every AI event.
*   When debugging database issues:
    *   Expand logging and profiling for easier debugging and performance monitoring.
    *   Improve error handling for worker communication (e.g., adding timeouts). **NOTE:** This will need to be updated to reflect local storage/IndexedDB and any worker communication changes.
*   When debugging Typescript `addProject` method recognition errors, ensure that the `addProject` method is present and correctly typed on the `SQLiteDatabase` class, and that the default export is used consistently, including adding JSDoc comments to the `addProject` method. Also ensure `SQLiteDatabase` is exported from `database.ts`. **NOTE:** This will need to be updated as the database dependency will be removed.
*   When debugging SQL.js initialization failures in Web Workers:
    *   Prioritize loading the UMD build of SQL.js. The worker should first attempt to load `/sql-wasm.js` from the project's `public` directory. This file must be manually downloaded from the official UMD build and placed in the `public` directory: https://github.com/sql-js/sql.js/releases/download/1.8.0/sql-wasm.js
    *   **Do not use the GitHub releases URL directly from a browser-based worker due to CORS restrictions.**
    *   After loading the script with `eval`, check for `initSqlJs` on:
        *   `self.initSqlJs`
        *   `self.Module.initSqlJs`
        *   `self.exports.initSqlJs`
        *   `self.sqlJs.initSqlJs`
    *   If still not found, try to find any function named `initSqlJs` in all global keys, and assign it to `self.initSqlJs`.
    *   Add more detailed logging of all global keys and their types if not found, to help debug future issues.
    *   If all fail, provide a clear error message about the CDN build and suggest using a UMD build.
    *   If `initSqlJs` is still not available after loading the SQL.js script with `eval`, explicitly assign `self.initSqlJs` if it is not already present but is available as a property of `self` or the evaluated script. After loading the script with `eval`, check for `self.Module` or any global object that may contain `initSqlJs`. If still not found, log all global keys for debugging and provide a clear error message about CDN build incompatibility. **NOTE:** This will be removed as the database dependency is removed.

## AI PROVIDER MANAGEMENT
*   API keys must be stored securely (never hardcoded).
*   The app must allow dynamic selection of the active provider for AI calls. If no provider is active, the user should be prompted to configure one.
*   The AI template generation logic must fetch the active provider from the database and use its settings for API calls.
*   If the active provider fails, the system will automatically try a secondary provider (such as a local or alternative endpoint).
*   A settings UI for managing AI providers (add/edit/delete, set active) must be created. (e.g., `AIProviderSettings.tsx`)
    *   The UI should list all AI providers from the database.
    *   The UI should allow adding a new provider (name, endpoint, API key, model, is_active, is_local, config).
    *   The UI should allow editing and deleting providers.
    *   The UI should allow setting one provider as active.
    *   The UI will allow entering/updating the API key, but will not display it in plain text after saving. API keys should be masked when returned (only show first and last 2 characters).
*   Mask `api_key` when returning AI providers in `listAIProviders` (return only the first and last 2 chars, rest as `*`).

## TEMPLATE LIBRARY ENHANCEMENTS
*   Users must be able to edit and delete templates via the UI.
*   The template selection UI should show a richer preview or allow inline editing before use.
*   Inline editing and richer previews are present, but template re-use (applying a template to a new/existing project) should be accessible from the project creation and editing flows.

## ERROR HANDLING & USER FEEDBACK
*   Implement better error messages for AI failures, DB issues, etc.
    *   **NOTE:** Update error handling to account for local storage/IndexedDB errors, as opposed to database errors.
*   Implement more granular loading/progress indicators for long-running operations (AI, DB, etc.).
    *   **NOTE:** Update loading indicators to reflect local storage/IndexedDB operations.
*   Implement more robust handling of slow or failed AI/database operations with timeouts and retry mechanisms.
    *   **NOTE:** Update timeouts and retry mechanisms to account for local storage/IndexedDB operations.
*   Add user-friendly error messages and loading indicators for all async/template/AI/database actions.
    *   **NOTE:** Update error messages and loading indicators to account for local storage/IndexedDB operations.
*   Ensure errors from the database and AI calls are surfaced in the UI, not just the console.
    *   **NOTE:** Ensure errors from local storage, IndexedDB, and AI calls are surfaced in the UI.

## SETTINGS & CUSTOMIZATION
*   Implement a User Preferences UI for changing app settings (theme, autosave, etc.).
*   Implement a Project Settings UI for editing project-specific settings after creation.
*   The Project Settings UI should be integrated as a side panel in the Writing Studio's Editor view (visible on desktop). Users can view and edit project-specific settings directly while writing.

## TESTING & VALIDATION
*   Implement comprehensive unit/integration tests for workflows, DB, and AI integration.
    *   **NOTE:** Update tests to reflect local storage/IndexedDB usage instead of the database.
*   Ensure strict type safety everywhere, especially in worker communication and AI result parsing.

## DOCUMENTATION & ONBOARDING
*   Implement in-app help or onboarding for new users.
*   Ensure all new features and APIs are documented for maintainers.

## PERFORMANCE & SCALABILITY
*   Implement pagination or lazy loading for large project/template lists.
*   Implement database migration logic. **NOTE:** Database migration logic will be replaced with local storage/IndexedDB migration logic.

## SECURITY
*   Implement more robust validation for all user inputs (not just JSON).
*   Ensure all user-generated content is sanitized before rendering to prevent XSS/injection.
*   Implement encrypted storage for sensitive data in local storage.

## UI COMPONENT & PAGE REVIEW
*   The following components and pages must be reviewed and updated for compliance, input sanitization, async feedback, and documentation/testing:
    *   `Projects.tsx` (Projects list, navigation)
    *   `NewProjectPage.tsx` (Project creation workflow)
    *   `TemplateLibrary.tsx` (Template selection, editing, preview)
    *   `ProjectSettings.tsx` (Project settings side panel)
    *   `Editor.tsx` / `EnhancedEditor.tsx` (Project editing, user input)
    *   (Story, WorldBuilding, etc. — user-generated content)
    *   `AIProviderSettings.tsx` (AI provider management UI)
    *   `UserSettings.tsx` (User preferences/settings)
    *   `AsyncFeedback.tsx` (Feedback UI)
    *   All components/pages making async DB/AI calls. **NOTE:** Update to reflect local storage/IndexedDB calls.

## USER INPUT HANDLING
*   For each form/editor (project, template, provider, settings, world/story elements, etc.):
    *   Ensure all string fields are sanitized with `sanitizeString` before saving or rendering.
    *   Check for any direct use of user input in the UI or DB and update as needed. **NOTE:** Update to reflect local storage/IndexedDB instead of DB.

## ASYNC OPERATIONS AUDIT
*   For each async operation (DB, AI, network):
    *   Confirm there is a loading/progress indicator.
    *   Ensure errors are caught and displayed to the user.
    *   Add timeouts/retries where appropriate. **NOTE:** Update to reflect local storage/IndexedDB.

## TESTS & DOCUMENTATION
*   Review the `test/` directory for coverage of:
    *   Project/template workflows
    *   AI provider management
    *   Settings and user preferences
*   Add or update JSDoc comments for all public methods in new/updated files.