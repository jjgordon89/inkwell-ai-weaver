/**
 * Tauri compatibility layer
 * Provides mock functions when Tauri is not available (web environment)
 */

// Type definitions for Tauri commands
interface TauriInvokeFunction {
  <T>(command: string, args?: Record<string, unknown>): Promise<T>;
}

// Check if we're in a Tauri environment
const isTauri = typeof window !== 'undefined' && '__TAURI__' in window;

// Mock implementation for web environment
function mockInvoke<T>(command: string, args?: Record<string, unknown>): Promise<T> {
  console.warn(`Tauri command '${command}' called in web environment, using mock data`);
  
  switch (command) {
    case 'get_projects': {
      return Promise.resolve([
        {
          id: 'sample-project-1',
          name: 'The Dragon\'s Legacy',
          description: 'An epic fantasy novel about a young mage discovering her dragon ancestry.',
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          lastModified: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          lastAccessedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          structure: 'novel',
          status: 'active',
          wordCountTarget: 80000,
          owner: 'demo-user'
        },
        {
          id: 'sample-project-2',
          name: 'City of Shadows',
          description: 'A noir detective story set in 1940s Los Angeles.',
          createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          lastModified: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          lastAccessedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          structure: 'novel',
          status: 'revision',
          wordCountTarget: 75000,
          owner: 'demo-user'
        }
      ] as T);
    }
      
    case 'get_project': {
      const projectId = args?.id || args?.projectId;
      return Promise.resolve({
        id: projectId || 'sample-project-1',
        name: 'The Dragon\'s Legacy',
        description: 'An epic fantasy novel about a young mage discovering her dragon ancestry.',
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        lastModified: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        lastAccessedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        structure: 'novel',
        status: 'active',
        wordCountTarget: 80000,
        owner: 'demo-user'
      } as T);
    }
      
    case 'create_project': {
      // Using unknown and type assertions to prevent TypeScript errors
      // while keeping the code safe
      const projectData = (args?.project as Record<string, unknown>) || {};
      const documentStructure = (args?.documentStructure as unknown[]) || [];
      
      return Promise.resolve({ 
        id: `project-${Date.now()}`, 
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        name: (projectData.name as string) || 'Untitled Project',
        description: (projectData.description as string) || '',
        structure: (projectData.structure as string) || 'novel',
        status: 'active',
        wordCountTarget: (projectData.wordCountTarget as number) || 50000,
        owner: 'demo-user',
        // Return document structure so it can be associated with the project
        documentStructure: documentStructure.length ? documentStructure : undefined
      } as T);
    }
      
    case 'update_project': {
      return Promise.resolve({ 
        id: args?.id || 'unknown',
        lastModified: new Date().toISOString(),
        ...args 
      } as T);
    }
      
    case 'delete_project': {
      return Promise.resolve({ success: true } as T);
    }
    
    case 'get_document_tree': {
      const projectId = args?.projectId || 'sample-project-1';
      return Promise.resolve({
        id: 'root',
        type: 'folder',
        name: 'Project Root',
        projectId,
        children: [
          {
            id: 'chapter-1',
            type: 'document',
            name: 'Chapter 1: The Beginning',
            projectId,
            parentId: 'root',
            content: 'The first rays of dawn painted the sky in shades of gold and crimson...',
            wordCount: 1234,
            createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            lastModified: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
          },
          {
            id: 'chapter-2',
            type: 'document',
            name: 'Chapter 2: The Discovery',
            projectId,
            parentId: 'root',
            content: 'Elena had never seen anything quite like the ancient tome before her...',
            wordCount: 1567,
            createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
            lastModified: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString()
          }
        ]
      } as T);
    }
    
    case 'create_document': {
      const newDoc = {
        id: `doc-${Date.now()}`,
        type: args?.type || 'document',
        name: args?.name || 'Untitled Document',
        projectId: args?.projectId || 'sample-project-1',
        parentId: args?.parentId || 'root',
        content: args?.content || '',
        wordCount: 0,
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString()
      };
      
      if (args?.type === 'folder') {
        return Promise.resolve({
          ...newDoc,
          children: []
        } as T);
      }
      
      return Promise.resolve(newDoc as T);
    }
    
    case 'update_document': {
      return Promise.resolve({
        id: args?.id || 'unknown',
        lastModified: new Date().toISOString(),
        wordCount: args?.content ? (args.content as string).split(/\s+/).length : 0,
        ...args
      } as T);
    }
    
    case 'delete_document': {
      return Promise.resolve({ success: true } as T);
    }
    
    default: {
      console.warn(`Unknown Tauri command: ${command}`);
      return Promise.reject(new Error(`Unknown command: ${command}`));
    }
  }
}

// Mock event listener for web environment
const mockListen = (event: string, handler: (payload: unknown) => void) => {
  console.warn(`Event listener for '${event}' registered in web environment`);
  return Promise.resolve(() => {
    console.warn(`Event listener for '${event}' unregistered`);
  });
};

// Export the invoke function
export const invoke: TauriInvokeFunction = isTauri 
  ? (window as unknown as { __TAURI__: { core: { invoke: TauriInvokeFunction } } }).__TAURI__.core.invoke 
  : mockInvoke;

// Mock event listener for web environment
export const listen = isTauri 
  ? (window as unknown as { __TAURI__: { event: { listen: typeof mockListen } } }).__TAURI__.event.listen 
  : mockListen;

// Export for backward compatibility
export default {
  invoke,
  listen,
  isInTauri: () => isTauri
};
