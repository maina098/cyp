"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserAction = exports.UserRole = exports.ApplicationStatus = exports.ElectionStatus = void 0;
var ElectionStatus;
(function (ElectionStatus) {
    ElectionStatus["DRAFT"] = "draft";
    ElectionStatus["SCHEDULED"] = "scheduled";
    ElectionStatus["ACTIVE"] = "active";
    ElectionStatus["CLOSED"] = "closed";
})(ElectionStatus || (exports.ElectionStatus = ElectionStatus = {}));
var ApplicationStatus;
(function (ApplicationStatus) {
    ApplicationStatus["PENDING"] = "pending";
    ApplicationStatus["APPROVED"] = "approved";
    ApplicationStatus["REJECTED"] = "rejected";
    ApplicationStatus["WITHDRAWN"] = "withdrawn";
})(ApplicationStatus || (exports.ApplicationStatus = ApplicationStatus = {}));
var UserRole;
(function (UserRole) {
    UserRole["USER"] = "USER";
    UserRole["ADMIN"] = "ADMIN";
    UserRole["SUPER_ADMIN"] = "SUPER_ADMIN";
})(UserRole || (exports.UserRole = UserRole = {}));
var UserAction;
(function (UserAction) {
    UserAction["LOGIN"] = "login";
    UserAction["LOGOUT"] = "logout";
    UserAction["REGISTER"] = "register";
    UserAction["VOTE"] = "vote";
    UserAction["APPLICATION_SUBMITTED"] = "application_submitted";
    UserAction["APPLICATION_APPROVED"] = "application_approved";
    UserAction["APPLICATION_REJECTED"] = "application_rejected";
    UserAction["ELECTION_CREATED"] = "election_created";
    UserAction["ELECTION_UPDATED"] = "election_updated";
    UserAction["ELECTION_STATUS_CHANGED"] = "election_status_changed";
})(UserAction || (exports.UserAction = UserAction = {}));
//# sourceMappingURL=election-status.enum.js.map