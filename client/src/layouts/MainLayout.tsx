import { NavLink, Outlet } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAuth } from "@/store";
import { cn } from "@/lib/utils";
import { useLogout } from "@/hooks/auth/logout.hooks";
import { useState } from "react";
import { Bell, Menu } from "lucide-react";
import logo from "../assets/Roima_logo.png";
import {
  hasPermission,
  PermissionCode,
  type PermissionCodeValue,
} from "@/constants/permissions";
import { useNotificationsStore } from "@/store/notifications";
import { DateTimeDisplay } from "@/utils/dateUtils";

const navItems: Array<{
  to: string;
  label: string;
  permission?: PermissionCodeValue;
}> = [
  { to: "achievements", label: "Achievements"},
  { to: "travels", label: "Travels" },
  { to: "account", label: "Account" },
  { to: "hr/users", label: "Users", permission: PermissionCode.USER_MANAGE },
  {
    to: "hr/job-records",
    label: "Job Records",
    permission: PermissionCode.USER_MANAGE,
  },
  { to: "jobs", label: "Jobs" },
  { to: "games", label: "Games" },
];

export const MainLayout = () => {
  const user = useAuth((state) => state.auth.user);

  const performLogout = useLogout({ redirectTo: "/auth/login" });

  const role = user?.role;
  const permissions = user?.permission;
  const notifications = useNotificationsStore((state) => state.notifications);
  const unreadCount = useNotificationsStore(
    (state) => state.notifications.filter((item) => !item.read).length,
  );
  const markAllRead = useNotificationsStore((state) => state.markAllRead);
  const clearAll = useNotificationsStore((state) => state.clearAll);
  const markRead = useNotificationsStore((state) => state.markRead);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const visibleNavItems = navItems.filter(
    (item) => !item.permission || hasPermission(permissions, item.permission),
  );

  const handleLogout = () => {
    performLogout();
  };

  return (
    <div className="min-h-screen bg-muted/20 text-foreground">
      <header className="border-b bg-emerald-300 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-screen-2xl items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <Menu className="h-4 w-4" />
            </Button>
            <div>
              <img src={logo} className="h-6"/>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="relative">
                  <Bell className="h-4 w-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 rounded-full bg-destructive px-1.5 text-[10px] font-semibold text-white">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Notifications</DialogTitle>
                </DialogHeader>
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No notifications yet.
                    </p>
                  ) : (
                    notifications.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => markRead(item.id)}
                        className={cn(
                          "w-full rounded-md border px-3 py-2 text-left text-sm transition",
                          item.read
                            ? "bg-white"
                            : "bg-emerald-50 border-emerald-200",
                        )}
                      >
                        <div className="font-medium text-foreground">
                          {item.message}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {DateTimeDisplay(item.created_at)}
                        </div>
                      </button>
                    ))
                  )}
                </div>
                <DialogFooter className="gap-2 flex">
                  <Button variant="outline" size="sm" onClick={markAllRead}>
                    Mark all read
                  </Button>
                  <Button variant="outline" size="sm" onClick={clearAll}>
                    Clear all
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <div className="hidden md:block text-right">
              <p className="text-sm font-medium">
                {user?.first_name
                  ? `${user.first_name} ${user?.last_name ?? ""}`
                  : "Staff"}
              </p>
              <p className="text-xs text-muted-foreground">
                {role ? `${role} workspace` : "HRMS"}
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
        <div className="hidden border-t bg-white/95 md:block">
          <div className="mx-auto flex w-full max-w-screen-2xl overflow-x-auto px-4">
            {visibleNavItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    "flex items-center px-3 py-3 text-sm font-medium transition-colors",
                    isActive
                      ? "text-primary border-b-2 border-primary"
                      : "text-muted-foreground hover:text-foreground",
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>
        </div>
        {isMobileMenuOpen && (
          <div className="border-t bg-white/95 md:hidden">
            <div className="flex flex-col gap-1 p-4">
              {visibleNavItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-2 rounded px-3 py-2 text-sm font-medium",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted",
                    )
                  }
                >
                  {item.label}
                </NavLink>
              ))}
              <div className="border-t pt-2 mt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full justify-start"
                >
                  Logout
                </Button>
              </div>
            </div>
          </div>
        )}
      </header>

      <main className="mx-auto w-full max-w-screen-2xl px-6 py-6 min-h-[calc(100vh-8rem)]">
        <Outlet />
      </main>
    </div>
  );
};
