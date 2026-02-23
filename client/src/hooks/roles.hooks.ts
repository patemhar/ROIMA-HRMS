// import { useMemo } from "react";
// import { useAuth } from "@/store";

// const ROLE_PRIORITY = ["HR", "MANAGER", "EMPLOYEE"] as const;
// const ORG_WIDE_ROLES = ["HR"] as const;

// export const useStaffRoles = () => {
  
//     const role = useAuth((state) => state.auth.role ?? "");

//     const hasRole = (role: string) => {
//         return role.includes(role)
//     }   

//     const hasAnyRole = (targetRoles: readonly string[]) => {
//         targetRoles.some((role) => role.includes(role))
//     }

//     const isHR = hasRole("HR");
//     const isEmployee = hasRole("EMPLOYEE");
//     const isManager = hasRole("MANAGER");

//     const canViewOrgWidePipeline = hasAnyRole(ORG_WIDE_ROLES);
//     const canManageTravel = canViewOrgWidePipeline;

//     return {
        
//     } as const;
// };
