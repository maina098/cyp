/**
 * Election Status Enum
 * Defines all valid states an election can be in
 */
export enum ElectionStatus {
  DRAFT = 'draft',
  SCHEDULED = 'scheduled',
  ACTIVE = 'active',
  CLOSED = 'closed',
}

/**
 * Application Status Enum
 * Defines all valid states an application can be in
 */
export enum ApplicationStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  WITHDRAWN = 'withdrawn',
}

/**
 * User Role Enum
 * Defines roles for role-based access control
 */
export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN',
}

/**
 * User Action Enum
 * Defines types of actions that can be audited
 */
export enum UserAction {
  LOGIN = 'login',
  LOGOUT = 'logout',
  REGISTER = 'register',
  VOTE = 'vote',
  APPLICATION_SUBMITTED = 'application_submitted',
  APPLICATION_APPROVED = 'application_approved',
  APPLICATION_REJECTED = 'application_rejected',
  ELECTION_CREATED = 'election_created',
  ELECTION_UPDATED = 'election_updated',
  ELECTION_STATUS_CHANGED = 'election_status_changed',
}
