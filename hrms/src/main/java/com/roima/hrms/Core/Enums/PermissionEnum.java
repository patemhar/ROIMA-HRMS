package com.roima.hrms.Core.Enums;

public enum PermissionEnum {
    // User permissions
    USER_SELF_UPDATE("PER001", "Update own user account"),
    USER_MANAGE("PER002", "Manage all users (HR/Admin)"),

    // Profile permissions
    PROFILE_SELF_MANAGE("PER003", "Manage own profile"),
    PROFILE_MANAGE("PER004", "Manage all profiles (HR/Admin)"),

    // Job permissions
    JOB_VIEW("PER005", "View jobs"),
    JOB_MANAGE("PER006", "Manage jobs (HR)"),

    // Travel permissions
    TRAVEL_VIEW("PER007", "View travels"),
    TRAVEL_MANAGE("PER010", "Manage travels"),
    TRAVEL_APPROVE("PER014", "Approve travel expenses"),

    // Game permissions
    GAME_VIEW("PER016", "View games"),
    GAME_MANAGE("PER015", "Manage games"),

    // OrgChart permissions
    ORG_READ("PER018", "Read org chart"),

    // Util permissions
    UTIL_READ("PER019", "Read utility data"),

    TRAVEL_DOC("PER021", "Manage travel documents"),

    ACHIEVEMENT("PER022", "Achievements"),

    ADMIN("PER053", "Admin permissions"),

    // Notification permissions
    NOTIFICATION_SUBSCRIBE("PER020", "Subscribe to notifications");

    private final String code;
    private final String description;

    PermissionEnum(String code, String description) {
        this.code = code;
        this.description = description;
    }

    public String getCode() {
        return code;
    }

    public String getDescription() {
        return description;
    }
}
