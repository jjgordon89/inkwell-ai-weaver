import {
  validateStructureSettings,
  getStructureValidationWarnings,
  getStructurePerformanceLevel,
  calculateTotalDocumentNodes
} from '@/utils/documentStructureValidation';

describe('Document Structure Validation', () => {
  // Valid test settings
  const validSettings = {
    chapterCount: 10,
    scenesPerChapter: 3,
    actCount: 3,
    poemCount: 10,
    researchSections: 5
  };
  
  // Settings with excessive values
  const excessiveSettings = {
    chapterCount: 40,
    scenesPerChapter: 10,
    actCount: 8,
    poemCount: 75,
    researchSections: 25
  };
  
  test('validateStructureSettings applies defaults for missing values', () => {
    const partialSettings = {
      chapterCount: 12
    };
    
    const validated = validateStructureSettings(partialSettings);
    
    expect(validated.chapterCount).toBe(12); // Provided value
    expect(validated.scenesPerChapter).toBe(3); // Default value
    expect(validated.actCount).toBe(3); // Default value
    expect(validated.poemCount).toBe(10); // Default value
    expect(validated.researchSections).toBe(5); // Default value
  });
  
  test('validateStructureSettings enforces minimums and maximums', () => {
    const invalidSettings = {
      chapterCount: 0, // Below minimum
      scenesPerChapter: 30, // Above maximum
      actCount: -1, // Below minimum
      poemCount: 150, // Above maximum
      researchSections: 0 // Below minimum
    };
    
    const validated = validateStructureSettings(invalidSettings);
    
    // Should apply defaults for values outside allowed ranges
    expect(validated.chapterCount).toBe(10);
    expect(validated.scenesPerChapter).toBe(3);
    expect(validated.actCount).toBe(3);
    expect(validated.poemCount).toBe(10);
    expect(validated.researchSections).toBe(5);
  });
  
  test('getStructureValidationWarnings returns no warnings for valid settings', () => {
    const warnings = getStructureValidationWarnings(validSettings);
    
    expect(warnings).toHaveLength(0);
  });
  
  test('getStructureValidationWarnings returns warnings for excessive settings', () => {
    const warnings = getStructureValidationWarnings(excessiveSettings);
    
    expect(warnings.length).toBeGreaterThan(0);
    expect(warnings.some(warning => warning.includes('scenes'))).toBe(true);
    expect(warnings.some(warning => warning.includes('poems'))).toBe(true);
    expect(warnings.some(warning => warning.includes('research sections'))).toBe(true);
  });
  
  test('getStructurePerformanceLevel returns correct levels', () => {
    // Good performance for reasonable settings
    expect(getStructurePerformanceLevel(validSettings)).toBe('good');
    
    // Warning or concern for excessive settings
    expect(getStructurePerformanceLevel(excessiveSettings)).toBe('concern');
    
    // Test borderline cases
    const borderlineSettings = {
      ...validSettings,
      chapterCount: 20,
      scenesPerChapter: 5
    };
    
    expect(getStructurePerformanceLevel(borderlineSettings)).toBe('warning');
  });
  
  test('calculateTotalDocumentNodes returns accurate counts', () => {
    // Calculate expected nodes for novel structure
    const novelNodes = 5 + validSettings.chapterCount + 
      (validSettings.chapterCount * validSettings.scenesPerChapter) + 10;
    
    // Novel structure should be chosen as the most likely structure
    expect(calculateTotalDocumentNodes(validSettings)).toBe(novelNodes);
    
    // Test with settings that would favor screenplay structure
    const screenplaySettings = {
      ...validSettings,
      actCount: 15
    };
    
    // Calculate expected nodes for screenplay structure
    const screenplayNodes = 5 + screenplaySettings.actCount + 
      (screenplaySettings.actCount * 5) + 10;
    
    // Screenplay structure should be chosen based on the weighted calculation
    expect(calculateTotalDocumentNodes(screenplaySettings)).toBe(screenplayNodes);
  });
});
