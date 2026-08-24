export declare enum ElectionStatus {
    DRAFT = "draft",
    SCHEDULED = "scheduled",
    ACTIVE = "active",
    CLOSED = "closed"
}
export declare enum ApplicationStatus {
    PENDING = "pending",
    APPROVED = "approved",
    REJECTED = "rejected",
    WITHDRAWN = "withdrawn"
}
export declare enum UserRole {
    USER = "USER",
    ADMIN = "ADMIN",
    SUPER_ADMIN = "SUPER_ADMIN"
}
export declare enum UserAction {
    LOGIN = "login",
    LOGOUT = "logout",
    REGISTER = "register",
    VOTE = "vote",
    APPLICATION_SUBMITTED = "application_submitted",
    APPLICATION_APPROVED = "application_approved",
    APPLICATION_REJECTED = "application_rejected",
    ELECTION_CREATED = "election_created",
    ELECTION_UPDATED = "election_updated",
    ELECTION_STATUS_CHANGED = "election_status_changed"
}
