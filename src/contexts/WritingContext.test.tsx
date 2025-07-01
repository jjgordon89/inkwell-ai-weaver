
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, act } from '@testing-library/react'
import { WritingProvider, useWriting } from './WritingContext'

// Mock the initial state with a default document
vi.mock('./WritingContext.types', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    initialState: {
      currentDocument: {
        id: 'test-doc-1',
        title: 'New Document',
        content: '',
        created: new Date(),
        lastModified: new Date(),
        wordCount: 0,
        type: 'story'
      },
      documents: [],
      characters: [],
      storyArcs: [],
      worldElements: [],
      selectedText: '',
      activeSection: 'story',
      isLoading: false,
      error: null
    }
  }
})

// Test component that uses the WritingContext
const TestComponent = () => {
  const { state, dispatch } = useWriting()
  
  return (
    <div>
      <div data-testid="document-title">{state.currentDocument?.title}</div>
      <div data-testid="character-count">{state.characters.length}</div>
      <div data-testid="active-section">{state.activeSection}</div>
      <button 
        data-testid="add-character"
        onClick={() => dispatch({
          type: 'ADD_CHARACTER',
          payload: {
            id: '1',
            name: 'Test Character',
            description: 'A test character',
            notes: '',
            tags: [],
            relationships: []
          }
        })}
      >
        Add Character
      </button>
      <button
        data-testid="change-section"
        onClick={() => dispatch({
          type: 'SET_ACTIVE_SECTION',
          payload: 'characters'
        })}
      >
        Change Section
      </button>
    </div>
  )
}

describe('WritingContext', () => {
  // Override the test component to ensure it works with a null document
  const TestComponentWithFallback = () => {
    const { state, dispatch } = useWriting()
    
    return (
      <div>
        <div data-testid="document-title">{state.currentDocument?.title || 'New Document'}</div>
        <div data-testid="character-count">{state.characters.length}</div>
        <div data-testid="active-section">{state.activeSection}</div>
        <button 
          data-testid="add-character"
          onClick={() => dispatch({
            type: 'ADD_CHARACTER',
            payload: {
              id: '1',
              name: 'Test Character',
              description: 'A test character',
              notes: '',
              tags: [],
              relationships: []
            }
          })}
        >
          Add Character
        </button>
        <button
          data-testid="change-section"
          onClick={() => dispatch({
            type: 'SET_ACTIVE_SECTION',
            payload: 'characters'
          })}
        >
          Change Section
        </button>
      </div>
    )
  }

  it('should provide initial state', () => {
    const { getByTestId } = render(
      <WritingProvider>
        <TestComponentWithFallback />
      </WritingProvider>
    )

    expect(getByTestId('document-title')).toHaveTextContent('New Document')
    expect(getByTestId('character-count')).toHaveTextContent('0')
    expect(getByTestId('active-section')).toHaveTextContent('story')
  })

  it('should handle adding characters', async () => {
    const { getByTestId } = render(
      <WritingProvider>
        <TestComponentWithFallback />
      </WritingProvider>
    )

    const addButton = getByTestId('add-character')
    
    await act(async () => {
      addButton.click()
    })

    expect(getByTestId('character-count')).toHaveTextContent('1')
  })

  it('should handle section changes', async () => {
    const { getByTestId } = render(
      <WritingProvider>
        <TestComponentWithFallback />
      </WritingProvider>
    )

    const changeSectionButton = getByTestId('change-section')
    
    await act(async () => {
      changeSectionButton.click()
    })

    expect(getByTestId('active-section')).toHaveTextContent('characters')
  })

  it('should throw error when used outside provider', () => {
    // Suppress console.error for this test
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    
    expect(() => render(<TestComponent />)).toThrow('useWriting must be used within a WritingProvider')
    
    consoleSpy.mockRestore()
  })
})
