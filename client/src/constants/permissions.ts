export const PermissionCode = {
  USER_SELF_UPDATE: "PER001",        // Update own user account
  USER_MANAGE: "PER002",             // Manage all users (HR/Admin)
  PROFILE_SELF_MANAGE: "PER003",     // Manage own profile
  PROFILE_MANAGE: "PER004",          // Manage all profiles (HR/Admin)
  JOB_VIEW: "PER005",                // View jobs, share, refer
  JOB_MANAGE: "PER006",              // Manage jobs (HR)
  TRAVEL_MANAGE: "PER010",           // Manage travels
  TRAVEL_APPROVE: "PER014",          // Approve/reject travel expenses
  GAME_MANAGE: "PER015",             // Manage games (HR)
  GAME_VIEW: "PER016",               // View games, book slots
  ORG_READ: "PER018",                // Read org chart
  UTIL_READ: "PER019",               // Read utility/dropdown data
  NOTIFICATION_SUBSCRIBE: "PER020",  // Subscribe to notifications
  TRAVEL_DOC: "PER021",              // Manage travel documents & expenses
  ACHIEVEMENT: "PER022",             // Access achievements page
  READ_ALL_TRAVELS: "PER023",              // Read all travels (HR/Manager)
} as const;

export type PermissionCodeValue =
  (typeof PermissionCode)[keyof typeof PermissionCode];

export const hasPermission = (
  userPermissions: string[] | undefined,
  requiredPermission: PermissionCodeValue,
) => Boolean(userPermissions?.includes(requiredPermission));
