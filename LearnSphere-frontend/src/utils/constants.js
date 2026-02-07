export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'

export const DIFFICULTY_LEVELS = {
  BEGINNER: { label: 'Beginner', color: 'green' },
  INTERMEDIATE: { label: 'Intermediate', color: 'yellow' },
  ADVANCED: { label: 'Advanced', color: 'red' }
}

export const ROLES = {
  STUDENT: 'STUDENT',
  INSTRUCTOR: 'INSTRUCTOR',
  ADMIN: 'ADMIN'
}

export const MATERIAL_TYPES = {
  VIDEO: 'VIDEO',
  PDF: 'PDF',
  IMAGE: 'IMAGE',
  LINK: 'LINK',
  TEXT: 'TEXT'
}

export const QUESTION_TYPES = {
  MCQ: 'Multiple Choice',
  TRUE_FALSE: 'True/False',
  SHORT_ANSWER: 'Short Answer',
  LONG_ANSWER: 'Long Answer'
}