import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import DocumentTreeVisualizer from './DocumentTreeVisualizer';
import { DocumentStructureSettings } from './DocumentStructureCustomizer';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';

// Setup default settings for tests
const defaultSettings: DocumentStructureSettings = {
  chapterCount: 10,
  scenesPerChapter: 3,
  actCount: 3,
  poemCount: 10,
  researchSections: 5,
};

// Mock UI components that might cause issues in tests
vi.mock('@/components/ui/tooltip', () => {
  return {
    TooltipProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    Tooltip: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    TooltipContent: ({ children }: { children: React.ReactNode }) => <div data-testid="tooltip-content">{children}</div>,
    TooltipTrigger: ({ asChild, children }: { asChild?: boolean; children: React.ReactNode }) => 
      <div data-testid="tooltip-trigger">{children}</div>,
  }
});

// Mock Badge component
vi.mock('@/components/ui/badge', () => {
  return {
    Badge: ({ children, className }: { children: React.ReactNode, className?: string }) => 
      <span data-testid="badge">{children}</span>,
  }
});

// Mock Input component
vi.mock('@/components/ui/input', () => {
  return {
    Input: (props: React.InputHTMLAttributes<HTMLInputElement>) => <input {...props} data-testid="search-input" />,
  }
});

describe('DocumentTreeVisualizer', () => {
  test('renders novel structure correctly', () => {
    render(
      <DocumentTreeVisualizer
        structure="novel"
        settings={defaultSettings}
      />
    );
    
    // Check for expected novel structure elements
    expect(screen.getByText('Document Structure Preview')).toBeInTheDocument();
    expect(screen.getByText('Front Matter')).toBeInTheDocument();
    expect(screen.getByText('Manuscript')).toBeInTheDocument();
    expect(screen.getByText('Chapter 1')).toBeInTheDocument();
    // Use getAllByText for elements that might appear multiple times
    expect(screen.getAllByText('Scene 1')[0]).toBeInTheDocument();
    expect(screen.getByText('Characters')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });
  
  test('renders screenplay structure correctly', () => {
    render(
      <DocumentTreeVisualizer
        structure="screenplay"
        settings={defaultSettings}
      />
    );
    
    // Check for expected screenplay structure elements
    expect(screen.getByText('Document Structure Preview')).toBeInTheDocument();
    expect(screen.getByText('Front Matter')).toBeInTheDocument();
    expect(screen.getByText('Screenplay')).toBeInTheDocument();
    expect(screen.getByText('Act 1')).toBeInTheDocument();
    // Use getAllByText for elements that might appear multiple times
    expect(screen.getAllByText('Act Introduction')[0]).toBeInTheDocument();
    expect(screen.getByText('Characters')).toBeInTheDocument();
    expect(screen.getByText('Locations')).toBeInTheDocument();
  });
  
  test('renders poetry structure correctly', () => {
    render(
      <DocumentTreeVisualizer
        structure="poetry"
        settings={defaultSettings}
      />
    );
    
    // Check for expected poetry structure elements
    expect(screen.getByText('Document Structure Preview')).toBeInTheDocument();
    expect(screen.getByText('Collection')).toBeInTheDocument();
    expect(screen.getByText('Title Page')).toBeInTheDocument();
    expect(screen.getByText('Introduction')).toBeInTheDocument();
    expect(screen.getByText('Poems')).toBeInTheDocument();
    expect(screen.getByText('Poem 1')).toBeInTheDocument();
    expect(screen.getByText('Themes')).toBeInTheDocument();
    expect(screen.getByText('References')).toBeInTheDocument();
    
    // Check for new tooltip triggers
    const tooltipTriggers = screen.getAllByTestId('tooltip-trigger');
    expect(tooltipTriggers.length).toBeGreaterThan(0);
  });
  
  test('renders research structure correctly', () => {
    render(
      <DocumentTreeVisualizer
        structure="research"
        settings={defaultSettings}
      />
    );
    
    // Check for expected research structure elements
    expect(screen.getByText('Document Structure Preview')).toBeInTheDocument();
    expect(screen.getByText('Front Matter')).toBeInTheDocument();
    expect(screen.getByText('Main Document')).toBeInTheDocument();
    expect(screen.getByText('Introduction')).toBeInTheDocument();
    expect(screen.getByText('Methodology')).toBeInTheDocument();
    expect(screen.getByText('Research Sections')).toBeInTheDocument();
    expect(screen.getByText('Section 1')).toBeInTheDocument();
    expect(screen.getByText('References')).toBeInTheDocument();
    expect(screen.getByText('Appendices')).toBeInTheDocument();
    
    // Check for new tooltip triggers
    const tooltipTriggers = screen.getAllByTestId('tooltip-trigger');
    expect(tooltipTriggers.length).toBeGreaterThan(0);
  });
  
  test('truncates large structures with ellipsis', () => {
    const largeSettings: DocumentStructureSettings = {
      chapterCount: 20,
      scenesPerChapter: 10,
      actCount: 10,
      poemCount: 30,
      researchSections: 15,
    };
    
    render(
      <DocumentTreeVisualizer
        structure="novel"
        settings={largeSettings}
      />
    );
    
    // Check that the truncation messages appear
    expect(screen.getByText('... 15 more chapters')).toBeInTheDocument();
    expect(screen.getAllByText('... 7 more scenes')[0]).toBeInTheDocument();
  });
  
  test('search feature filters items correctly', async () => {
    const user = userEvent.setup();
    
    render(
      <DocumentTreeVisualizer
        structure="novel"
        settings={defaultSettings}
      />
    );
    
    // Get the search input
    const searchInput = screen.getByTestId('search-input');
    
    // Search for a specific term
    await user.type(searchInput, 'Character');
    
    // Check that matching items are highlighted (we can't check CSS classes in this test)
    expect(screen.getByText('Characters')).toBeInTheDocument();
    expect(screen.getByText('Character Template')).toBeInTheDocument();
    expect(screen.getByText('Main Character')).toBeInTheDocument();
    
    // Clear search
    await user.clear(searchInput);
    await user.type(searchInput, 'Setting');
    
    // Check that other matching items are found
    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.getByText('Setting Template')).toBeInTheDocument();
    expect(screen.getByText('Main Setting')).toBeInTheDocument();
  });
  
  test('poetry structure includes sample content in tooltips', () => {
    render(
      <DocumentTreeVisualizer
        structure="poetry"
        settings={defaultSettings}
      />
    );
    
    // Check for tooltip triggers that would contain poetry-specific sample content
    const tooltipTriggers = screen.getAllByTestId('tooltip-trigger');
    expect(tooltipTriggers.length).toBeGreaterThan(0);
    
    // At least one should contain the Poem label
    const poemTriggers = tooltipTriggers.filter(trigger => 
      trigger.textContent?.includes('Poem 1'));
    expect(poemTriggers.length).toBeGreaterThan(0);
  });
  
  test('research structure includes sample content in tooltips', () => {
    render(
      <DocumentTreeVisualizer
        structure="research"
        settings={defaultSettings}
      />
    );
    
    // Check for tooltip triggers that would contain research-specific sample content
    const tooltipTriggers = screen.getAllByTestId('tooltip-trigger');
    expect(tooltipTriggers.length).toBeGreaterThan(0);
    
    // At least one should contain the Section label
    const sectionTriggers = tooltipTriggers.filter(trigger => 
      trigger.textContent?.includes('Section 1'));
    expect(sectionTriggers.length).toBeGreaterThan(0);
  });
});
