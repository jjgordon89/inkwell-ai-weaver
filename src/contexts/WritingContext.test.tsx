
import { describe, it, expect, vi } from 'vitest'
import { render, act } from '@testing-library/react'
import { WritingProvider, useWriting } from './WritingContext'

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
  it('should provide initial state', () => {
    const { getByTestId } = render(
      <WritingProvider>
        <TestComponent />
      </WritingProvider>
    )

    expect(getByTestId('document-title')).toHaveTextContent('New Document')
    expect(getByTestId('character-count')).toHaveTextContent('0')
    expect(getByTestId('active-section')).toHaveTextContent('story')
  })

  it('should handle adding characters', async () => {
    const { getByTestId } = render(
      <WritingProvider>
        <TestComponent />
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
        <TestComponent />
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
