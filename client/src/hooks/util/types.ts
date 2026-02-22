export const utilKeys = {

    all: ["util"] as const,

    roles: () => [utilKeys.all, "users"] as const,
    users: () => [utilKeys.all, "roles"] as const,
    departments: () => [utilKeys.all, "departments"] as const,
    usersByTravelId: (id : String) => [utilKeys.all, "users", id] as const,
    games: () => [utilKeys.all, "games"] as const
}