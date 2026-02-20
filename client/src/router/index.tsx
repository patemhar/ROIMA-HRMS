import { createBrowserRouter, Navigate } from "react-router-dom";
import { AuthLayout } from "../layouts/AuthLayout";
import { LoginPage } from "@/pages/auth/LoginPage";
import NotFound from "@/pages/NotFound";
import { Travel } from "@/pages/travel/Travel";
import { MainLayout } from "@/layouts/MainLayout";
import { TravelDetail } from "@/pages/travel/TravelDetail";
import { AccountSettingsPage } from "@/pages/AccountSettingsPage";
import { UserManagementPage } from "@/pages/UserManagement";
import { JobListPage } from "@/pages/jobs/JobListing";
import { GamePage } from "@/pages/game/Game";
import { useAuth } from "@/store";
import type { ReactNode } from "react";
import { hasPermission, PermissionCode, type PermissionCodeValue } from "@/constants/permissions";

const RequireAuth = ({ children }: { children: ReactNode }) => {
    const isAuthenticated = useAuth((state) => state.auth.isAuthenticated);

    if (!isAuthenticated) {
        return <Navigate to="/auth/login" replace />;
    }

    return <>{children}</>;
};

const RequirePermission = ({
    permission,
    children,
}: {
    permission: PermissionCodeValue;
    children: ReactNode;
}) => {
    const isAuthenticated = useAuth((state) => state.auth.isAuthenticated);
    const permissions = useAuth((state) => state.auth.user?.permission);

    if (!isAuthenticated) {
        return <Navigate to="/auth/login" replace />;
    }

    if (!hasPermission(permissions, permission)) {
        return <Navigate to="/employee/account" replace />;
    }

    return <>{children}</>;
};

export const router = createBrowserRouter([
    {
        path: "/auth",
        element: <AuthLayout />,
        children: [
            {
                path:"login",
                element: (
                    <LoginPage/>
                )
            }
        ]
    },
    {
        path: "/employee",
        element: (
            <RequireAuth>
                <MainLayout/>
            </RequireAuth>
        ),
        children: [
            {
                path: "travels",
                element: (
                    <RequirePermission permission={PermissionCode.TRAVEL_READ}>
                        <Travel/>
                    </RequirePermission>
                )
            },
            {
                path: "travels/:id",
                element: (
                    <RequirePermission permission={PermissionCode.TRAVEL_READ}>
                        <TravelDetail/>
                    </RequirePermission>
                )
            },
            {
                path: "account",
                element: <AccountSettingsPage/>
            },
            {
                path: "hr/users",
                element: (
                    <RequirePermission permission={PermissionCode.USER_READ}>
                        <UserManagementPage />
                    </RequirePermission>
                )
            }, 
            {
                path: "jobs",
                element: (
                    <RequirePermission permission={PermissionCode.JOB_READ}>
                        <JobListPage />
                    </RequirePermission>
                )
            },
            {
                path: "games",
                element: (
                    <RequirePermission permission={PermissionCode.GAME_READ}>
                        <GamePage />
                    </RequirePermission>
                )
            }
        ]
    },
    {
        path: "*",
        element: <NotFound />
    }
])