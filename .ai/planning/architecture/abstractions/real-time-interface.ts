// Real-time abstraction interface for vendor switching
export interface RealTimeProvider {
  // Connection management
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  isConnected(): boolean;
  
  // Subscription management
  subscribe<T>(channel: string, callback: (data: T) => void): Subscription;
  unsubscribe(subscription: Subscription): void;
  
  // Publishing
  publish<T>(channel: string, data: T): Promise<void>;
  
  // Presence and user status
  setUserStatus(userId: string, status: UserStatus): Promise<void>;
  getUserStatus(userId: string): Promise<UserStatus | null>;
  getOnlineUsers(): Promise<string[]>;
  
  // Room/Channel management
  joinRoom(roomId: string): Promise<void>;
  leaveRoom(roomId: string): Promise<void>;
  getRoomMembers(roomId: string): Promise<string[]>;
  
  // Event handling
  onConnect(callback: () => void): void;
  onDisconnect(callback: (reason?: string) => void): void;
  onError(callback: (error: Error) => void): void;
  onReconnect(callback: () => void): void;
}

// Subscription interface
export interface Subscription {
  id: string;
  channel: string;
  active: boolean;
  unsubscribe(): void;
}

// User status types
export interface UserStatus {
  userId: string;
  status: 'online' | 'offline' | 'away' | 'busy';
  lastSeen: number;
  customStatus?: string;
  metadata?: Record<string, any>;
}

// Real-time data types for CareerOS
export interface RealTimeData {
  type: 'resume_update' | 'job_update' | 'analysis_complete' | 'plan_progress' | 'notification';
  userId: string;
  timestamp: number;
  data: any;
}

// CareerOS specific real-time operations
export interface CareerOSRealTime extends RealTimeProvider {
  // Resume updates
  subscribeToResumeUpdates(userId: string, callback: (resume: Resume) => void): Subscription;
  notifyResumeUpdate(userId: string, resume: Resume): Promise<void>;
  
  // Job updates
  subscribeToJobUpdates(userId: string, callback: (job: JobPosting) => void): Subscription;
  notifyJobUpdate(userId: string, job: JobPosting): Promise<void>;
  
  // Analysis updates
  subscribeToAnalysisUpdates(userId: string, callback: (analysis: Analysis) => void): Subscription;
  notifyAnalysisComplete(userId: string, analysis: Analysis): Promise<void>;
  
  // Development plan updates
  subscribeToPlanUpdates(userId: string, callback: (plan: DevelopmentPlan) => void): Subscription;
  notifyPlanProgress(userId: string, plan: DevelopmentPlan): Promise<void>;
  
  // Notifications
  subscribeToNotifications(userId: string, callback: (notification: Notification) => void): Subscription;
  sendNotification(userId: string, notification: Notification): Promise<void>;
  
  // Collaboration features (future)
  subscribeToCollaboration(userId: string, callback: (collaboration: CollaborationEvent) => void): Subscription;
  notifyCollaboration(userId: string, event: CollaborationEvent): Promise<void>;
}

// Notification types
export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  read: boolean;
  createdAt: number;
  expiresAt?: number;
}

export type NotificationType = 
  | 'analysis_complete'
  | 'plan_milestone'
  | 'skill_reminder'
  | 'job_alert'
  | 'system_update'
  | 'collaboration_invite';

// Collaboration events (future feature)
export interface CollaborationEvent {
  type: 'invite' | 'accept' | 'decline' | 'message' | 'share';
  fromUserId: string;
  toUserId: string;
  data: any;
  timestamp: number;
}

// Real-time configuration
export interface RealTimeConfig {
  provider: 'convex' | 'socket.io' | 'pusher' | 'ably' | 'firebase' | 'custom';
  endpoint?: string;
  apiKey?: string;
  appId?: string;
  cluster?: string;
  region?: string;
  timeout?: number;
  retries?: number;
  heartbeat?: number;
}

// Connection state management
export interface ConnectionState {
  status: 'connecting' | 'connected' | 'disconnected' | 'reconnecting' | 'error';
  lastConnected?: number;
  reconnectAttempts: number;
  maxReconnectAttempts: number;
  error?: Error;
}

// Event emitter interface for real-time events
export interface EventEmitter {
  on(event: string, callback: (...args: any[]) => void): void;
  off(event: string, callback: (...args: any[]) => void): void;
  emit(event: string, ...args: any[]): void;
  once(event: string, callback: (...args: any[]) => void): void;
}

// Real-time message types
export interface RealTimeMessage<T = any> {
  id: string;
  type: string;
  channel: string;
  data: T;
  userId?: string;
  timestamp: number;
  metadata?: Record<string, any>;
}

// Channel management
export interface Channel {
  id: string;
  name: string;
  type: 'user' | 'room' | 'system' | 'broadcast';
  members: string[];
  metadata?: Record<string, any>;
  createdAt: number;
  updatedAt: number;
}

// Presence management
export interface Presence {
  userId: string;
  status: UserStatus;
  channels: string[];
  lastActivity: number;
  metadata?: Record<string, any>;
}

// Error handling
export class RealTimeError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: any
  ) {
    super(message);
    this.name = 'RealTimeError';
  }
}

export class ConnectionError extends Error {
  constructor(
    message: string,
    public retryable: boolean = true
  ) {
    super(message);
    this.name = 'ConnectionError';
  }
}

export class SubscriptionError extends Error {
  constructor(
    message: string,
    public channel: string,
    public details?: any
  ) {
    super(message);
    this.name = 'SubscriptionError';
  }
}

// Real-time hooks for React
export interface UseRealTimeOptions {
  enabled?: boolean;
  onConnect?: () => void;
  onDisconnect?: (reason?: string) => void;
  onError?: (error: Error) => void;
  reconnectAttempts?: number;
  reconnectDelay?: number;
}

export interface UseSubscriptionOptions {
  enabled?: boolean;
  onData?: (data: any) => void;
  onError?: (error: Error) => void;
  transform?: (data: any) => any;
}

// Real-time service factory
export interface RealTimeServiceFactory {
  createProvider(config: RealTimeConfig): RealTimeProvider;
  createCareerOSProvider(config: RealTimeConfig): CareerOSRealTime;
}

// Re-export types from database interface
export type {
  Resume,
  JobPosting,
  Analysis,
  DevelopmentPlan
} from './database-interface';
