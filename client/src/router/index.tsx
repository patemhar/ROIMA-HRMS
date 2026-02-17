import { createBrowserRouter } from "react-router-dom";
import { AuthLayout } from "../layouts/AuthLayout";
import { LoginPage } from "@/pages/auth/LoginPage";
import NotFound from "@/pages/NotFound";
import { Travel } from "@/pages/travel/Travel";
import { MainLayout } from "@/layouts/MainLayout";
import { TravelDetail } from "@/pages/travel/TravelDetail";
import { AccountSettingsPage } from "@/pages/AccountSettingsPage";
import OrgChartComponent from "@/components/orgChart/orgChart";

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
        element: <MainLayout/>,
        children: [
            {
                path: "travels",
                element: <Travel/>
            },
            {
                path: "travels/:id",
                element: <TravelDetail/>
            },
            {
                path: "account",
                element: <AccountSettingsPage/>
            }
        ]
    },
    {
        path: "*",
        element: <NotFound />
    }
])