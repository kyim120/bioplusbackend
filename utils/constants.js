// Application constants

// User roles
exports.USER_ROLES = {
  STUDENT: 'student',
  ADMIN: 'admin',
  OWNER: 'owner'
};

// User status
exports.USER_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended',
  PENDING: 'pending'
};

// Grades
exports.GRADES = ['9', '10', '11', '12'];

// Subjects (common biology subjects)
exports.SUBJECTS = [
  'Cell Biology',
  'Genetics',
  'Ecology',
  'Human Biology',
  'Microbiology',
  'Botany',
  'Zoology',
  'Biochemistry',
  'Molecular Biology',
  'Evolution',
  'Physiology',
  'Immunology'
];

// Test difficulty levels
exports.TEST_DIFFICULTY = {
  EASY: 'easy',
  MEDIUM: 'medium',
  HARD: 'hard'
};

// Test status
exports.TEST_STATUS = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  ARCHIVED: 'archived'
};

// Test result status
exports.TEST_RESULT_STATUS = {
  PASSED: 'passed',
  FAILED: 'failed',
  INCOMPLETE: 'incomplete'
};

// Progress status
exports.PROGRESS_STATUS = {
  NOT_STARTED: 'not-started',
  IN_PROGRESS: 'in-progress',
  COMPLETED: 'completed',
  ABANDONED: 'abandoned'
};

// Content types
exports.CONTENT_TYPES = {
  NOTE: 'note',
  ANIMATION: 'animation',
  TEST: 'test',
  BOOK: 'book',
  CHAPTER: 'chapter',
  SUBJECT: 'subject'
};

// File types
exports.FILE_TYPES = {
  IMAGE: 'image',
  DOCUMENT: 'document',
  VIDEO: 'video',
  AUDIO: 'audio',
  XML: 'xml'
};

// Allowed file extensions
exports.ALLOWED_EXTENSIONS = {
  IMAGE: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
  DOCUMENT: ['pdf', 'doc', 'docx', 'txt', 'rtf'],
  VIDEO: ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm'],
  AUDIO: ['mp3', 'wav', 'ogg', 'aac'],
  XML: ['xml']
};

// File size limits (in bytes)
exports.FILE_SIZE_LIMITS = {
  IMAGE: 5 * 1024 * 1024,      // 5MB
  DOCUMENT: 10 * 1024 * 1024,  // 10MB
  VIDEO: 100 * 1024 * 1024,    // 100MB
  AUDIO: 50 * 1024 * 1024,     // 50MB
  XML: 5 * 1024 * 1024         // 5MB
};

// Book categories
exports.BOOK_CATEGORIES = [
  'textbook',
  'reference',
  'guide',
  'workbook',
  'manual',
  'encyclopedia'
];

// Priority levels
exports.PRIORITY_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high'
};

// Notification types
exports.NOTIFICATION_TYPES = {
  SYSTEM: 'system',
  ACHIEVEMENT: 'achievement',
  TEST_RESULT: 'test_result',
  REMINDER: 'reminder',
  ANNOUNCEMENT: 'announcement'
};

// Achievement types
exports.ACHIEVEMENT_TYPES = {
  TEST_PASSED: 'test_passed',
  PERFECT_SCORE: 'perfect_score',
  STUDY_STREAK: 'study_streak',
  SUBJECT_MASTER: 'subject_master',
  BOOK_COMPLETED: 'book_completed',
  FIRST_LOGIN: 'first_login'
};

// Analytics periods
exports.ANALYTICS_PERIODS = {
  DAY: '1d',
  WEEK: '7d',
  MONTH: '30d',
  QUARTER: '90d',
  YEAR: '365d',
  ALL: 'all'
};

// Sort options
exports.SORT_OPTIONS = {
  NEWEST: 'newest',
  OLDEST: 'oldest',
  POPULAR: 'popular',
  RATING: 'rating',
  ALPHABETICAL: 'alphabetical',
  RELEVANCE: 'relevance'
};

// Pagination defaults
exports.PAGINATION_DEFAULTS = {
  PAGE: 1,
  LIMIT: 10,
  MAX_LIMIT: 100
};

// Cache TTL (in seconds)
exports.CACHE_TTL = {
  SHORT: 300,      // 5 minutes
  MEDIUM: 1800,    // 30 minutes
  LONG: 3600,      // 1 hour
  DAY: 86400       // 1 day
};

// Rate limits
exports.RATE_LIMITS = {
  API: {
    WINDOW: 15 * 60 * 1000, // 15 minutes
    MAX: 100
  },
  AUTH: {
    WINDOW: 15 * 60 * 1000, // 15 minutes
    MAX: 5
  },
  AI: {
    WINDOW: 60 * 1000, // 1 minute
    MAX: 10
  },
  UPLOAD: {
    WINDOW: 60 * 1000, // 1 minute
    MAX: 5
  },
  SEARCH: {
    WINDOW: 60 * 1000, // 1 minute
    MAX: 20
  }
};

// Email templates
exports.EMAIL_TEMPLATES = {
  WELCOME: 'welcome',
  PASSWORD_RESET: 'password_reset',
  TEST_COMPLETED: 'test_completed',
  ACHIEVEMENT: 'achievement',
  ADMIN_NOTIFICATION: 'admin_notification'
};

// Error messages
exports.ERROR_MESSAGES = {
  UNAUTHORIZED: 'Access denied. Please log in.',
  FORBIDDEN: 'Access denied. Insufficient permissions.',
  NOT_FOUND: 'Resource not found.',
  VALIDATION_ERROR: 'Validation failed.',
  SERVER_ERROR: 'Internal server error.',
  RATE_LIMIT_EXCEEDED: 'Too many requests. Please try again later.',
  FILE_TOO_LARGE: 'File size exceeds the maximum allowed limit.',
  INVALID_FILE_TYPE: 'File type not allowed.',
  DUPLICATE_ENTRY: 'Duplicate entry found.',
  MISSING_REQUIRED_FIELD: 'Required field is missing.'
};

// Success messages
exports.SUCCESS_MESSAGES = {
  CREATED: 'Resource created successfully.',
  UPDATED: 'Resource updated successfully.',
  DELETED: 'Resource deleted successfully.',
  UPLOADED: 'File uploaded successfully.',
  SENT: 'Email sent successfully.',
  COMPLETED: 'Operation completed successfully.'
};

// HTTP status codes
exports.HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503
};

// Database collections
exports.COLLECTIONS = {
  USERS: 'users',
  SUBJECTS: 'subjects',
  CHAPTERS: 'chapters',
  NOTES: 'notes',
  TESTS: 'tests',
  QUESTIONS: 'questions',
  TEST_RESULTS: 'testresults',
  ANIMATIONS: 'animations',
  BOOKS: 'books',
  BOOKMARKS: 'bookmarks',
  PROGRESS: 'progress',
  ANALYTICS: 'analytics',
  NOTIFICATIONS: 'notifications',
  SUBSCRIPTIONS: 'subscriptions',
  PROFILES: 'profiles'
};

// API versions
exports.API_VERSIONS = {
  V1: 'v1',
  CURRENT: 'v1'
};

// Environment types
exports.ENVIRONMENTS = {
  DEVELOPMENT: 'development',
  STAGING: 'staging',
  PRODUCTION: 'production',
  TEST: 'test'
};
