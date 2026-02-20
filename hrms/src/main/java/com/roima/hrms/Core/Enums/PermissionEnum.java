package com.roima.hrms.Core.Enums;

public enum PermissionEnum {
    // User permissions
    USER_READ("PER001", "Read user details"),
    USER_UPDATE("PER002", "Update user details"),
    USER_UPDATE_ADMIN("PER053", "Permission to update user details as admin"),

    // Profile permissions
    PROFILE_CREATE("PER003", "Create profile"),
    PROFILE_READ("PER004", "Read profiles"),
    PROFILE_UPDATE("PER005", "Update profiles"),

    // Job permissions
    JOB_CREATE("PER006", "Create job"),
    JOB_READ("PER007", "Read jobs"),
    JOB_UPDATE("PER008", "Update job"),
    JOB_DELETE("PER009", "Delete job"),

    // Travel permissions
    TRAVEL_CREATE("PER010", "Create travel"),
    TRAVEL_READ("PER011", "Read travels"),
    TRAVEL_UPDATE("PER012", "Update travel"),
    TRAVEL_DELETE("PER013", "Delete travel"),
    TRAVEL_APPROVE("PER014", "Approve travel expenses"),

    // Game permissions
    GAME_CREATE("PER015", "Create game"),
    GAME_READ("PER016", "Read games"),
    GAME_UPDATE("PER017", "Update game"),

    // OrgChart permissions
    ORG_READ("PER018", "Read org chart"),

    // Util permissions
    UTIL_READ("PER019", "Read utility data"),

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
