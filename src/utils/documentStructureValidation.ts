import { z } from 'zod';

/**
 * Zod schema for validating document structure settings
 */
export const documentStructureSchema = z.object({
  chapterCount: z.number()
    .int("Chapter count must be a whole number")
    .min(1, "Must have at least 1 chapter")
    .max(100, "Maximum of 100 chapters allowed")
    .default(10),
  
  scenesPerChapter: z.number()
    .int("Scenes per chapter must be a whole number")
    .min(1, "Must have at least 1 scene per chapter")
    .max(20, "Maximum of 20 scenes per chapter allowed")
    .default(3),
  
  actCount: z.number()
    .int("Act count must be a whole number")
    .min(1, "Must have at least 1 act")
    .max(10, "Maximum of 10 acts allowed")
    .default(3),
  
  poemCount: z.number()
    .int("Poem count must be a whole number")
    .min(1, "Must have at least 1 poem")
    .max(100, "Maximum of 100 poems allowed")
    .default(10),
  
  researchSections: z.number()
    .int("Research section count must be a whole number")
    .min(1, "Must have at least 1 section")
    .max(30, "Maximum of 30 research sections allowed")
    .default(5)
});

/**
 * Type definition derived from the Zod schema
 */
export type ValidatedDocumentStructureSettings = z.infer<typeof documentStructureSchema>;

/**
 * Validates document structure settings and returns a safe, validated object
 * @param settings The settings to validate
 * @returns Validated settings with defaults applied for missing values
 */
export function validateStructureSettings(settings: Partial<ValidatedDocumentStructureSettings>): ValidatedDocumentStructureSettings {
  const result = documentStructureSchema.safeParse(settings);
  
  if (result.success) {
    return result.data;
  } else {
    // If validation fails, return the default values
    // We could also choose to throw an error here
    console.warn('Structure settings validation failed:', result.error.format());
    return {
      chapterCount: 10,
      scenesPerChapter: 3,
      actCount: 3,
      poemCount: 10,
      researchSections: 5
    };
  }
}

/**
 * Check if the structure settings are within reasonable limits
 * @param settings Settings to check
 * @returns Array of validation messages (empty if all is valid)
 */
export function getStructureValidationWarnings(settings: ValidatedDocumentStructureSettings): string[] {
  const warnings: string[] = [];
  
  // Check for potentially problematic combinations
  if (settings.chapterCount * settings.scenesPerChapter > 200) {
    warnings.push(`You're creating ${settings.chapterCount * settings.scenesPerChapter} total scenes. Consider reducing chapters or scenes per chapter for better performance.`);
  }
  
  if (settings.poemCount > 50) {
    warnings.push(`${settings.poemCount} poems might be difficult to manage. Consider splitting into multiple collections.`);
  }
  
  if (settings.researchSections > 20) {
    warnings.push(`${settings.researchSections} research sections might be excessive. Consider organizing into subsections.`);
  }
  
  return warnings;
}

/**
 * Checks if there are any performance concerns with the structure settings
 */
export function getStructurePerformanceLevel(settings: ValidatedDocumentStructureSettings): 'good' | 'warning' | 'concern' {
  const totalDocumentNodes = calculateTotalDocumentNodes(settings);
  
  if (totalDocumentNodes < 100) {
    return 'good';
  } else if (totalDocumentNodes < 300) {
    return 'warning';
  } else {
    return 'concern';
  }
}

/**
 * Calculate the approximate number of document nodes that will be created
 */
export function calculateTotalDocumentNodes(settings: ValidatedDocumentStructureSettings): number {
  const { chapterCount, scenesPerChapter, actCount, poemCount, researchSections } = settings;
  
  // Novel structure
  const novelNodes = 5 + // Front Matter nodes
    chapterCount + // Chapter nodes
    (chapterCount * scenesPerChapter) + // Scene nodes
    10; // Character, setting, and note nodes
  
  // Screenplay structure
  const screenplayNodes = 5 + // Front Matter nodes
    actCount + // Act nodes
    (actCount * 5) + // Scenes per act (approximately)
    10; // Character, location, and note nodes
  
  // Poetry structure
  const poetryNodes = 3 + // Collection intro nodes
    poemCount + // Poem nodes
    5; // Theme and reference nodes
  
  // Research structure
  const researchNodes = 5 + // Front Matter and intro nodes
    researchSections + // Research section nodes
    10; // References, appendices, and other nodes
  
  // Return the count based on structure
  const structure = getHighestStructureCount(settings);
  switch (structure) {
    case 'novel':
      return novelNodes;
    case 'screenplay':
      return screenplayNodes;
    case 'poetry':
      return poetryNodes;
    case 'research':
      return researchNodes;
    default:
      return 50; // Default reasonable estimate
  }
}

/**
 * Determine which structure has the highest count
 * This is a heuristic to estimate which structure the user is most likely using
 */
function getHighestStructureCount(settings: ValidatedDocumentStructureSettings): 'novel' | 'screenplay' | 'poetry' | 'research' {
  const { chapterCount, scenesPerChapter, actCount, poemCount, researchSections } = settings;
  
  const novelWeight = chapterCount * scenesPerChapter * 2;
  const screenplayWeight = actCount * 5;
  const poetryWeight = poemCount * 2;
  const researchWeight = researchSections * 3;
  
  const max = Math.max(novelWeight, screenplayWeight, poetryWeight, researchWeight);
  
  if (max === novelWeight) return 'novel';
  if (max === screenplayWeight) return 'screenplay';
  if (max === poetryWeight) return 'poetry';
  return 'research';
}
