import { describe, it, expect } from 'vitest'
import {
  validateField,
  validationRules,
  validateCharacterInput,
  validateStoryArcInput,
  validateApiKey,
  validateAIResponse,
  validateDocumentContent
} from './validation'

describe('Validation Utils', () => {
  describe('validationRules', () => {
    it('should validate required fields', () => {
      const rule = validationRules.required()
      expect(rule.validate('')).toBe(false)
      expect(rule.validate('   ')).toBe(false)
      expect(rule.validate('valid')).toBe(true)
    })

    it('should validate minimum length', () => {
      const rule = validationRules.minLength(5)
      expect(rule.validate('abc')).toBe(false)
      expect(rule.validate('abcde')).toBe(true)
      expect(rule.validate('abcdef')).toBe(true)
    })

    it('should validate email format', () => {
      const rule = validationRules.email()
      expect(rule.validate('invalid-email')).toBe(false)
      expect(rule.validate('test@example.com')).toBe(true)
      expect(rule.validate('user+tag@domain.co.uk')).toBe(true)
    })

    it('should validate positive numbers', () => {
      const rule = validationRules.positiveNumber()
      expect(rule.validate('0')).toBe(false)
      expect(rule.validate('-1')).toBe(false)
      expect(rule.validate('5')).toBe(true)
      expect(rule.validate('10.5')).toBe(true)
    })
  })

  describe('validateField', () => {
    it('should validate field with multiple rules', () => {
      const rules = [
        validationRules.required(),
        validationRules.minLength(3),
        validationRules.maxLength(10)
      ]

      const result1 = validateField('', rules)
      expect(result1.isValid).toBe(false)
      expect(result1.errors).toContain('This field is required')

      const result2 = validateField('ab', rules)
      expect(result2.isValid).toBe(false)
      expect(result2.errors).toContain('Must be at least 3 characters')

      const result3 = validateField('valid', rules)
      expect(result3.isValid).toBe(true)
      expect(result3.errors).toHaveLength(0)
    })
  })

  describe('validateCharacterInput', () => {
    it('should validate valid character input', () => {
      const validInput = {
        name: 'John Doe',
        description: 'A brave knight who fights for justice and honor',
        age: '25',
        occupation: 'Knight'
      }

      const result = validateCharacterInput(validInput)
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should reject invalid character input', () => {
      const invalidInput = {
        name: '',
        description: 'Too short',
        age: '300',
        occupation: ''
      }

      const result = validateCharacterInput(invalidInput)
      expect(result.isValid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
    })
  })

  describe('validateApiKey', () => {
    it('should validate OpenAI API key format', () => {
      const result1 = validateApiKey('sk-1234567890abcdef', 'OpenAI')
      expect(result1.isValid).toBe(true)

      const result2 = validateApiKey('invalid-key', 'OpenAI')
      expect(result2.isValid).toBe(false)
    })

    it('should validate Groq API key format', () => {
      const result1 = validateApiKey('gsk_1234567890abcdef', 'Groq')
      expect(result1.isValid).toBe(true)

      const result2 = validateApiKey('sk-1234567890abcdef', 'Groq')
      expect(result2.isValid).toBe(false)
    })
  })

  describe('validateAIResponse', () => {
    it('should validate proper AI responses', () => {
      const result1 = validateAIResponse('This is a valid response')
      expect(result1.isValid).toBe(true)

      const result2 = validateAIResponse('')
      expect(result2.isValid).toBe(false)

      const result3 = validateAIResponse(123 as unknown)
      expect(result3.isValid).toBe(false)
    })
  })

  describe('validateDocumentContent', () => {
    it('should validate document title and content', () => {
      const result1 = validateDocumentContent('Some content', 'Valid Title')
      expect(result1.isValid).toBe(true)

      const result2 = validateDocumentContent('Content', '')
      expect(result2.isValid).toBe(false)
    })
  })
})