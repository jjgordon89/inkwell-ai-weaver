# Template Type System Documentation

## Overview

The Template Type System provides a unified approach to managing project templates throughout the application. It resolves the previous mismatches between different parts of the application by creating a cohesive type system that serves backend storage, application logic, and UI presentation needs.

## Key Components

### 1. UnifiedProjectTemplate

The `UnifiedProjectTemplate` is the primary interface that combines all template concerns:

- **Backend Fields**: Derived from Rust/database storage (author_name, author_email, etc.)
- **Logic Fields**: Required for project creation (initialDocumentTree, metadata)
- **UI Fields**: Required for presentation (icon, features, defaultSettings)

### 2. TemplateAdapters

The `TemplateAdapters` class provides conversion functions between different template formats:

- `fromBackend`: Converts a backend template to the unified format
- `toBackend`: Converts a unified template to the backend format
- `toUI`: Converts a unified template to the UI-only format
- `toLogic`: Converts a unified template to the logic format

### 3. Type Guards

The `TemplateTypeGuards` class provides runtime type checking to determine the format of a template object.

## Usage Guidelines

### Creating Templates

Always use the `CreateTemplateInput` type when creating templates. This ensures all required fields are provided:

```typescript
const newTemplate: CreateTemplateInput = {
  name: 'My Template',
  description: 'Template description',
  structure: 'novel',
  icon: '📝',
  features: ['Feature 1', 'Feature 2'],
  defaultSettings: {
    wordCountTarget: 50000
  }
};

// Use with hook
const { createTemplate } = useProjectTemplates();
const template = await createTemplate(newTemplate);
```

### Updating Templates

Use the `UpdateTemplateInput` type when updating templates, which requires the ID but makes all other fields optional:

```typescript
const updates: UpdateTemplateInput = {
  id: 'template-id',
  name: 'Updated Name',
  description: 'Updated description'
};

// Use with hook
const { updateTemplate } = useProjectTemplates();
const updatedTemplate = await updateTemplate(updates.id, updates);
```

### UI Components

UI components should always use the `UnifiedProjectTemplate` type for consistent access to all template fields:

```typescript
interface MyComponentProps {
  template: UnifiedProjectTemplate;
}
```

## Type Migration

For backward compatibility, the original `ProjectTemplate` interface in `templates.ts` is maintained but should be considered deprecated. New code should use `UnifiedProjectTemplate` from `unified-templates.ts`.

## Backend Integration

The backend Rust code uses a different structure for templates. The TypeScript adapter functions in `TemplateAdapters` handle conversion between the backend format and the unified format.

## Future Improvements

1. Gradually replace all usages of the original `ProjectTemplate` interface with `UnifiedProjectTemplate`
2. Add runtime validation for template data using Zod schemas
3. Implement enhanced error handling for template operations
4. Create a migration utility to convert legacy templates to the unified format
