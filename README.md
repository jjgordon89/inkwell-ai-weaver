# Inkwell AI Weaver

Inkwell AI Weaver is a creative writing studio designed to help you organize your stories, develop characters, build worlds, and write with AI assistance.

## Features

### Core Writing Features
- **Rich Text Editor**: A powerful writing environment with syntax highlighting and formatting
- **Document Organization**: Organize your work into projects, chapters, scenes, and story arcs
- **Writing Progress Tracking**: Monitor word counts, targets, and writing statistics
- **Document Outline**: Automatic outline generation from headings for easy navigation

### Project Management
- **Project Dashboard**: Overview of all your writing projects with statistics
- **Project Templates**: Quick-start templates for different types of writing projects
- **Search and Filtering**: Find projects by status, structure, or other criteria
- **Project Statistics**: Track progress across all your writing projects

### Writing Tools
- **Word Count Display**: Real-time word count, character count, and reading time estimates
- **Writing Progress Tracker**: Visual progress bars and statistics for your writing goals
- **Auto-save**: Configurable auto-save functionality to never lose your work
- **Focus Mode**: Distraction-free writing environment

### Character & World Building
- **Character Development**: Create and manage detailed character profiles and relationships
- **World Building**: Build and maintain comprehensive fictional worlds
- **Story Arcs**: Plan and track story progression and character development

### Customization & Settings
- **Writing Environment**: Customize font, size, line height, and editor appearance
- **Dark/Light Mode**: Toggle between dark and light themes
- **Auto-save Settings**: Configure auto-save intervals and preferences
- **Focus Mode**: Enable distraction-free writing mode

### AI Integration
- **AI Writing Assistance**: Leverage AI to enhance your creative writing process
- **Content Suggestions**: Get AI-powered suggestions for plot, character, and dialogue
- **Writing Analysis**: AI-powered analysis of your writing style and structure

### Cross-Platform Compatibility
- **Web-First Design**: Runs perfectly in any modern web browser
- **Tauri Desktop App**: Optional desktop app with native OS integration
- **Mock Data System**: Comprehensive mock data for development and testing

## Technologies Used

This project is built with modern web technologies:

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and building
- **UI Library**: shadcn/ui components with Radix UI primitives
- **Styling**: Tailwind CSS for utility-first styling
- **State Management**: TanStack Query for server state management
- **Routing**: React Router for client-side routing
- **Desktop App**: Tauri (optional) for cross-platform desktop application
- **Development**: TypeScript, ESLint, and comprehensive type safety

## Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm, yarn, or bun package manager

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/your_username/inkwell-ai-weaver.git
   cd inkwell-ai-weaver
   ```

2. Install dependencies
   ```bash
   npm install
   # or
   yarn install
   # or
   bun install
   ```

3. Start the development server
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   bun dev
   ```

4. Open your browser and navigate to `http://localhost:5173` (or the port shown in your terminal)

## Available Scripts

- `npm run dev`: Starts the development server with hot reload
- `npm run build`: Builds the app for production
- `npm run build:dev`: Builds the app in development mode
- `npm run preview`: Serves the production build locally
- `npm run lint`: Runs ESLint for code quality checks
- `npm run test`: Runs the test suite
- `npm run test:ui`: Runs tests with UI interface
- `npm run test:coverage`: Runs tests with coverage report

## Development Features

### Mock Data System
The application includes a comprehensive mock data system that allows full functionality even without a backend server. This includes:

- Sample projects with realistic content
- Document tree structures with chapters and research notes
- Writing statistics and progress tracking
- Project management and filtering capabilities

### Tauri Compatibility Layer
The application includes a compatibility layer (`src/lib/tauri-compat.ts`) that allows it to run in both web browsers and as a Tauri desktop application without code changes.

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── dashboard/      # Project dashboard components
│   ├── settings/       # Settings panels and forms
│   ├── writing/        # Writing-specific components
│   └── ui/            # Base UI components (shadcn/ui)
├── contexts/           # React contexts for state management
├── hooks/              # Custom React hooks
│   └── queries/       # TanStack Query hooks
├── lib/               # Utility libraries and configurations
├── pages/             # Main application pages
├── types/             # TypeScript type definitions
└── utils/             # Utility functions
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
- `npm run lint`: Lints the codebase.
- `npm run test`: Runs the test suite.

## Project Structure

The project is organized as follows:

- `src/components`: Contains all the React components.
- `src/contexts`: Holds the React contexts for state management.
- `src/hooks`: Stores custom React hooks.
- `src/lib`: Includes utility functions and libraries.
- `src/pages`: Contains the main pages of the application.
- `src/types`: Defines the TypeScript types used in the project.