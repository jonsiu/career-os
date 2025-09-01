// Authentication abstraction interface for vendor switching
export interface AuthenticationProvider {
  // User authentication
  signIn(credentials: SignInCredentials): Promise<AuthResult>;
  signUp(userData: SignUpData): Promise<AuthResult>;
  signOut(): Promise<void>;
  
  // User management
  getCurrentUser(): Promise<User | null>;
  updateUser(userData: Partial<User>): Promise<User>;
  deleteUser(): Promise<void>;
  
  // Session management
  getSession(): Promise<Session | null>;
  refreshSession(): Promise<Session>;
  isAuthenticated(): Promise<boolean>;
  
  // Password management
  resetPassword(email: string): Promise<void>;
  updatePassword(currentPassword: string, newPassword: string): Promise<void>;
  
  // Multi-factor authentication
  enableMFA(): Promise<MFASetup>;
  verifyMFA(code: string): Promise<boolean>;
  disableMFA(): Promise<void>;
  
  // Social authentication
  signInWithProvider(provider: SocialProvider): Promise<AuthResult>;
  linkAccount(provider: SocialProvider): Promise<void>;
  unlinkAccount(provider: SocialProvider): Promise<void>;
  
  // Event handling
  onAuthStateChange(callback: (user: User | null) => void): () => void;
  onUserUpdate(callback: (user: User) => void): () => void;
}

// Authentication data types
export interface SignInCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface SignUpData {
  email: string;
  password: string;
  name: string;
  currentRole: string;
  targetRole: string;
  experience: number;
  company?: string;
  location?: string;
  linkedinUrl?: string;
  githubUrl?: string;
}

export interface AuthResult {
  user: User;
  session: Session;
  isNewUser: boolean;
}

export interface User {
  id: string;
  email: string;
  name: string;
  currentRole: string;
  targetRole: string;
  experience: number;
  company?: string;
  location?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  emailVerified: boolean;
  mfaEnabled: boolean;
  linkedAccounts: LinkedAccount[];
  createdAt: number;
  updatedAt: number;
}

export interface Session {
  id: string;
  userId: string;
  expiresAt: number;
  createdAt: number;
  lastActivity: number;
  deviceInfo?: DeviceInfo;
}

export interface LinkedAccount {
  provider: SocialProvider;
  providerUserId: string;
  email?: string;
  name?: string;
  linkedAt: number;
}

export interface DeviceInfo {
  userAgent: string;
  ipAddress?: string;
  location?: string;
  deviceType?: 'desktop' | 'mobile' | 'tablet';
}

export interface MFASetup {
  secret: string;
  qrCode: string;
  backupCodes: string[];
  verified: boolean;
}

// Social authentication providers
export type SocialProvider = 
  | 'google'
  | 'github'
  | 'linkedin'
  | 'microsoft'
  | 'apple'
  | 'twitter';

// Authentication configuration
export interface AuthConfig {
  provider: 'clerk' | 'auth0' | 'firebase' | 'supabase' | 'cognito' | 'custom';
  domain?: string;
  clientId?: string;
  clientSecret?: string;
  redirectUrl?: string;
  audience?: string;
  scope?: string[];
  socialProviders?: SocialProvider[];
  mfaEnabled?: boolean;
  passwordPolicy?: PasswordPolicy;
  sessionTimeout?: number;
}

export interface PasswordPolicy {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  preventCommonPasswords: boolean;
}

// Authentication hooks for React
export interface UseAuthOptions {
  onSignIn?: (user: User) => void;
  onSignOut?: () => void;
  onUserUpdate?: (user: User) => void;
  onError?: (error: AuthError) => void;
}

export interface UseUserOptions {
  onUserChange?: (user: User | null) => void;
  onUserUpdate?: (user: User) => void;
}

// Error handling
export class AuthError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: any
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

export class ValidationError extends Error {
  constructor(
    message: string,
    public field: string,
    public value?: any
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class MFAError extends Error {
  constructor(
    message: string,
    public attempts: number,
    public maxAttempts: number
  ) {
    super(message);
    this.name = 'MFAError';
  }
}

// Authentication state management
export interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: AuthError | null;
}

// Authentication service factory
export interface AuthServiceFactory {
  createProvider(config: AuthConfig): AuthenticationProvider;
}

// User profile management
export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  bio?: string;
  preferences: UserPreferences;
  privacy: PrivacySettings;
}

export interface UserPreferences {
  emailNotifications: boolean;
  pushNotifications: boolean;
  marketingEmails: boolean;
  language: string;
  timezone: string;
  theme: 'light' | 'dark' | 'system';
}

export interface PrivacySettings {
  profileVisibility: 'public' | 'private' | 'connections';
  resumeVisibility: 'public' | 'private' | 'connections';
  activityVisibility: 'public' | 'private' | 'connections';
  allowMessages: boolean;
  allowConnections: boolean;
}

// Authentication middleware
export interface AuthMiddleware {
  requireAuth(): (req: any, res: any, next: any) => void;
  requireRole(role: string): (req: any, res: any, next: any) => void;
  requirePermission(permission: string): (req: any, res: any, next: any) => void;
  optionalAuth(): (req: any, res: any, next: any) => void;
}

// Session management
export interface SessionManager {
  createSession(userId: string, deviceInfo?: DeviceInfo): Promise<Session>;
  validateSession(sessionId: string): Promise<Session | null>;
  refreshSession(sessionId: string): Promise<Session>;
  revokeSession(sessionId: string): Promise<void>;
  revokeAllSessions(userId: string): Promise<void>;
  getActiveSessions(userId: string): Promise<Session[]>;
}

// Security features
export interface SecurityManager {
  // Rate limiting
  checkRateLimit(identifier: string, action: string): Promise<boolean>;
  
  // IP blocking
  isIPBlocked(ipAddress: string): Promise<boolean>;
  blockIP(ipAddress: string, reason: string, duration?: number): Promise<void>;
  
  // Suspicious activity detection
  detectSuspiciousActivity(userId: string, action: string, context: any): Promise<boolean>;
  reportSuspiciousActivity(userId: string, activity: SuspiciousActivity): Promise<void>;
}

export interface SuspiciousActivity {
  type: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  context: Record<string, any>;
  timestamp: number;
}

// Audit logging
export interface AuditLogger {
  logAuthEvent(event: AuthEvent): Promise<void>;
  logUserAction(userId: string, action: string, details: any): Promise<void>;
  getAuditLogs(userId: string, filters?: AuditFilters): Promise<AuditLog[]>;
}

export interface AuthEvent {
  type: 'sign_in' | 'sign_up' | 'sign_out' | 'password_reset' | 'mfa_enabled' | 'mfa_disabled';
  userId: string;
  timestamp: number;
  ipAddress?: string;
  userAgent?: string;
  success: boolean;
  error?: string;
  metadata?: Record<string, any>;
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  details: any;
  timestamp: number;
  ipAddress?: string;
  userAgent?: string;
}

export interface AuditFilters {
  startDate?: number;
  endDate?: number;
  actions?: string[];
  limit?: number;
  offset?: number;
}
