import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Spinner } from "@/components/ui/spinner";
import { useAllUsers, useUserProfile, useUpdateProfile } from "@/hooks/user/user.hooks";
import { DateTimeDisplay } from "@/utils/dateUtils";
import { useState } from "react";
import { toast } from 'sonner';
import type { components } from "@/types/api";
import { authService } from "@/services/authService";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useGetAllRoles, useGetAllUsers, useGetAllDepartments } from "@/hooks/util/util.hooks";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getErrorMessage } from "@/utils/error";
import { hasPermission, PermissionCode } from "@/constants/permissions";
import { useAuth } from "@/store";

type Schemas = components["schemas"];
type RegisterForm = Schemas["RegisterRequestDto"];

export const UserManagementPage = () => {
  const permissions = useAuth((state) => state.auth.user?.permission);
  const canManageUsers = hasPermission(permissions, PermissionCode.USER_UPDATE);
  const canViewUserProfiles = hasPermission(permissions, PermissionCode.PROFILE_READ) || 
                              hasPermission(permissions, PermissionCode.USER_READ);

  const [open, setOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  
  const [userDetailsOpen, setUserDetailsOpen] = useState(false);
  
  const [editProfileOpen, setEditProfileOpen] = useState(false);

  const [editProfileForm, setEditProfileForm] = useState({
    userId: "",
    empNumber: "",
    departmentId: "",
    joinedDate: "",
    phone: "",
    bio: "",
    location: "",
  });

  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>();
  const [errorMessage, setErrorMessage] = useState<string | null>();

  const roleQuery = useGetAllRoles();
  const roles = roleQuery.data;
  const departmentQuery = useGetAllDepartments();
  const departments = departmentQuery.data ?? [];

  const updateProfileMutation = useUpdateProfile();
  const usersQuery = useAllUsers();
  const users = usersQuery.data ?? [];
  const userProfileQuery = useUserProfile(selectedUserId || "");

  const [registerForm, setRegisterForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    confirm_password: "",
    role: "",
    reports_to: ""
  });

  const handleSubmit = async () => {

    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      setLoading(true);

      const response = await authService.register({
        first_name: registerForm.first_name,
        last_name: registerForm.last_name,
        email: registerForm.email,
        password: registerForm.password,
        confirm_password: registerForm.confirm_password,
        role: registerForm.role,
        reports_to: registerForm.reports_to
      });

      if (!response.success) {
        throw new Error(response.errors || "Registration failed");
      }

      toast.success(response.message);
      setSuccessMessage(response.message || "Success");
      setRegisterForm({
        first_name: "",
        last_name: "",
        email: "",
        password: "",
        confirm_password: "",
        role: "",
        reports_to: ""
      });
      setOpen(false);

    } catch (err) {
      toast.error(getErrorMessage(err));
      setErrorMessage(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const openEditProfileDialog = () => {
    if (!userProfileQuery.data) return;
    
    setEditProfileForm({
      userId: selectedUserId || "",
      empNumber: userProfileQuery.data.empNumber ?? "",
      departmentId: userProfileQuery.data.departmentId ?? "",
      joinedDate: userProfileQuery.data.joinedDate ?? "",
      phone: userProfileQuery.data.phone ?? "",
      bio: userProfileQuery.data.bio ?? "",
      location: userProfileQuery.data.location ?? "",
    });
    setEditProfileOpen(true);
  };

  const toOptional = (value: string) => {
    const sanitized = value.trim();
    return sanitized ? sanitized : undefined;
  };

  const handleSaveProfile = async () => {
    try {
      await updateProfileMutation.mutateAsync({
        userId: toOptional(editProfileForm.userId),
        empNumber: toOptional(editProfileForm.empNumber),
        departmentId: toOptional(editProfileForm.departmentId),
        joinedDate: toOptional(editProfileForm.joinedDate),
        phone: toOptional(editProfileForm.phone),
        bio: toOptional(editProfileForm.bio),
        location: toOptional(editProfileForm.location),
      });

      toast.success("Profile updated successfully");
      setEditProfileOpen(false);
      userProfileQuery.refetch();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update profile");
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "HR":
        return "destructive";
      case "MANAGER":
        return "default";
      case "EMPLOYEE":
        return "secondary";
      default:
        return "outline";
    }
  };

  return (
    <div className="space-y-6">

      {/* Access Denied Message */}
      {!canViewUserProfiles && !canManageUsers && (
        <Card>
          <CardContent className="py-8">
            <div className="text-center text-muted-foreground">
              <p className="text-lg font-semibold mb-2">Access Denied</p>
              <p>You don't have permission to view user management.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Success/Error Messages */}
      {successMessage && (
        <div className="bg-green-50 text-green-800 p-3 rounded-md text-sm">
          {successMessage}
        </div>
      )}
      {errorMessage && (
        <div className="bg-red-50 text-red-800 p-3 rounded-md text-sm">
          {errorMessage}
        </div>
      )}

      {/* Header */}
      {(canViewUserProfiles || canManageUsers) && (
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground mt-2">
            Manage all users, roles, and permissions across the system
          </p>
        </div>
      )}

      {canManageUsers && (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>Create User</Button>
          </DialogTrigger>

        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create User</DialogTitle>
            <DialogDescription>
              Enter user details to register a new employee.
            </DialogDescription>
          </DialogHeader>

            <div className="grid gap-4 py-4">

              <div className="space-y-1">
                <Label htmlFor="firstname">First Name</Label>
                <Input
                  id="firstname"
                  type="text"
                  onChange={(e) => 
                    setRegisterForm((prev) => ({
                      ...prev, first_name: e.target.value
                    }))
                  }
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="last-name">Last Name</Label>
                <Input 
                  id="last-name"
                  type="text"
                  onChange={(e) => 
                    setRegisterForm((prev) => ({
                      ...prev, last_name: e.target.value
                    }))
                  }
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  onChange={(e) => 
                    setRegisterForm((prev) => ({
                      ...prev, email: e.target.value
                    }))
                  }
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  onChange={(e) => 
                    setRegisterForm((prev) => ({
                      ...prev, password: e.target.value
                    }))
                  }
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  onChange={(e) => 
                    setRegisterForm((prev) => ({
                      ...prev, confirm_password: e.target.value
                    }))
                  }
                />
              </div>

              <div className="space-y-1">
                <Label>Role</Label>
                <Select value={registerForm.role} 
                  onValueChange={(value) =>
                      setRegisterForm((prev) => ({ ...prev, role: value }))
                    }
                >
                  <SelectTrigger>
                    <SelectValue placeholder={roleQuery.isLoading ? "Loading..." : "Select a role"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {roles?.map((role) => (
                        <SelectItem key={role.id} value={role.id!}>
                          {role.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label>Reports To (User ID)</Label>
                <Select value={registerForm.reports_to} 
                  onValueChange={(value) => 
                    setRegisterForm((prev) => ({...prev, reports_to: value}))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a manager"/>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {users?.map((user) => (
                        <SelectItem key={user.id} value={user.id!}>
                          {user.first_name} {user.last_name} - {user.role}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>

              <Button onClick={handleSubmit} type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create User"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Users Table - visible if user can view profiles or manage users */}
      {(canViewUserProfiles || canManageUsers) && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Users ({users.length})</CardTitle>
              </div>
            </div>
          </CardHeader>
        <CardContent>
          {usersQuery.isLoading ? (
            <div className="flex justify-center py-8">
              <Spinner />
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No users found
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Id</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Reports To</TableHead>
                    <TableHead>Is Active</TableHead>
                    <TableHead>Last Login</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>{user.id}</TableCell>
                      <TableCell className="font-medium">
                        {user.first_name} {user.last_name}
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge
                          variant={getRoleBadgeVariant(user.role || "null")}
                        >
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>{user.reports_to || "Null"}</TableCell>
                      <TableCell>
                        <Badge
                          variant={user.is_active ? "default" : "secondary"}
                        >
                          {user.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {DateTimeDisplay(user.last_login || "")}
                      </TableCell>
                      <TableCell>
                        {canViewUserProfiles && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedUserId(user.id!);
                              setUserDetailsOpen(true);
                            }}
                          >
                            View Details
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </>
          )}
        </CardContent>
      </Card>
      )}

      {/* User Details Dialog - only if user can view profiles */}
      {canViewUserProfiles && (
        <Dialog open={userDetailsOpen} onOpenChange={setUserDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>
              View user profile and detailed information
            </DialogDescription>
          </DialogHeader>

          {userProfileQuery.isLoading ? (
            <div className="flex justify-center py-8">
              <Spinner />
            </div>
          ) : userProfileQuery.error ? (
            <div className="text-center py-8 text-red-500">
              Failed to load user profile
            </div>
          ) : userProfileQuery.data ? (
            <div className="space-y-6">
              {/* Avatar and Basic Info */}
              <div className="flex items-start gap-6">
                <div className="shrink-0">
                  {userProfileQuery.data.avatarUrl ? (
                    <img
                      src={userProfileQuery.data.avatarUrl}
                      alt="User Avatar"
                      className="w-24 h-24 rounded-full object-cover border-2 border-primary"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-2xl font-bold text-primary">
                        {users.find(u => u.id === selectedUserId)?.first_name?.[0]}
                        {users.find(u => u.id === selectedUserId)?.last_name?.[0]}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex-1 space-y-2">
                  <h3 className="text-lg font-semibold">
                    {users.find(u => u.id === selectedUserId)?.first_name}{" "}
                    {users.find(u => u.id === selectedUserId)?.last_name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {users.find(u => u.id === selectedUserId)?.email}
                  </p>
                  <div className="flex gap-2">
                    <Badge variant={getRoleBadgeVariant(users.find(u => u.id === selectedUserId)?.role || "")}>
                      {users.find(u => u.id === selectedUserId)?.role}
                    </Badge>
                    <Badge variant={users.find(u => u.id === selectedUserId)?.is_active ? "default" : "secondary"}>
                      {users.find(u => u.id === selectedUserId)?.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Profile Details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-muted-foreground">Employee Number</Label>
                  <p className="text-sm font-medium">{userProfileQuery.data.empNumber || "N/A"}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Department</Label>
                  <p className="text-sm font-medium">{userProfileQuery.data.departmentName || "N/A"}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Joined Date</Label>
                  <p className="text-sm font-medium">{userProfileQuery.data.joinedDate || "N/A"}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Phone</Label>
                  <p className="text-sm font-medium">{userProfileQuery.data.phone || "N/A"}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Location</Label>
                  <p className="text-sm font-medium">{userProfileQuery.data.location || "N/A"}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Reports To</Label>
                  <p className="text-sm font-medium">
                    {users.find(u => u.id === selectedUserId)?.reports_to || "N/A"}
                  </p>
                </div>
              </div>

              {/* Bio */}
              {userProfileQuery.data.bio && (
                <div>
                  <Label className="text-sm text-muted-foreground">Bio</Label>
                  <p className="text-sm mt-1">{userProfileQuery.data.bio}</p>
                </div>
              )}

              {/* Game Interests */}
              {userProfileQuery.data.gameInterests && userProfileQuery.data.gameInterests.length > 0 && (
                <div>
                  <Label className="text-sm text-muted-foreground mb-2 block">Game Interests</Label>
                  <div className="flex flex-wrap gap-2">
                    {userProfileQuery.data.gameInterests.map((interest, idx) => (
                      <Badge key={idx} variant="outline">
                        {interest}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : null}

          <DialogFooter>
            <Button variant="outline" onClick={() => setUserDetailsOpen(false)}>
              Close
            </Button>
            {canManageUsers && (
              <Button onClick={openEditProfileDialog}>
                Edit Profile
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
      )}

      {/* Edit Profile */}
      {canManageUsers && (
        <Dialog open={editProfileOpen} onOpenChange={setEditProfileOpen}>
          <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit User Profile</DialogTitle>
            <DialogDescription>
              Update profile with HR fields.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-3 py-2">
            <Label>Employee Number</Label>
            <Input
              value={editProfileForm.empNumber}
              onChange={(e) =>
                setEditProfileForm((prev) => ({ ...prev, empNumber: e.target.value }))
              }
              placeholder="EMP-001"
            />

            <Label>Department</Label>
            <Select
              value={editProfileForm.departmentId}
              onValueChange={(value) =>
                setEditProfileForm((prev) => ({ ...prev, departmentId: value }))
              }
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    departmentQuery.isLoading
                      ? "Loading departments..."
                      : "Select department"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {departments.map((department) => (
                    <SelectItem
                      key={department.departmentId}
                      value={department.departmentId!}
                    >
                      {department.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>

            <Label>Joined Date</Label>
            <Input
              type="date"
              value={editProfileForm.joinedDate}
              onChange={(e) =>
                setEditProfileForm((prev) => ({ ...prev, joinedDate: e.target.value }))
              }
            />

            <Label>Phone</Label>
            <Input
              value={editProfileForm.phone}
              onChange={(e) =>
                setEditProfileForm((prev) => ({ ...prev, phone: e.target.value }))
              }
              placeholder="Phone"
            />

            <Label>Bio</Label>
            <Input
              value={editProfileForm.bio}
              onChange={(e) =>
                setEditProfileForm((prev) => ({ ...prev, bio: e.target.value }))
              }
              placeholder="Bio"
            />

            <Label>Location</Label>
            <Input
              value={editProfileForm.location}
              onChange={(e) =>
                setEditProfileForm((prev) => ({ ...prev, location: e.target.value }))
              }
              placeholder="Location"
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditProfileOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveProfile}
              disabled={updateProfileMutation.isPending}
            >
              {updateProfileMutation.isPending ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      )}
    </div>
  );
};
