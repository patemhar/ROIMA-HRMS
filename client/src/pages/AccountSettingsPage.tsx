import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Upload, User } from "lucide-react";
import { ProfileInfoCard } from "@/components/Account/ProfileInfoCard";
import { MyAccountCard } from "@/components/Account/MyAccountCard";
import { GameInterestsCard } from "@/components/Account/GameInterestsCard";
import {
  useCreateProfile,
  useMyProfile,
  useUploadAvatar,
  useUpdateUserByHR,
} from "@/hooks/user/user.hooks";
import OrgChartComponent from "@/components/orgChart/orgChart";
import { useAuth } from "@/store";
import { hasPermission, PermissionCode } from "@/constants/permissions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useGetAllDepartments,
  useGetAllRoles,
  useGetAllUsers,
} from "@/hooks/util/util.hooks";
import { toast } from "sonner";
import { getErrorMessage } from "@/utils/error";
import type { components } from "@/types/api";
import { DateTimeDisplay } from "@/utils/dateUtils";

type Schemas = components["schemas"];

const emptyCreateProfileForm: Schemas["ProfileAdminRequestDTO"] = {
  userId: "",
  empNumber: "",
  departmentId: "",
  joinedDate: "",
  phone: "",
  bio: "",
  location: "",
};

const emptyUpdateUserForm = {
  userId: "",
  firstName: "",
  lastName: "",
  email: "",
  roleId: "",
  reportsToId: "",
  isActive: "true",
};

export const AccountSettingsPage = () => {
  const role = useAuth((state) => state.auth.user?.role);
  const permissions = useAuth((state) => state.auth.user?.permission);
  const canReadOrgChart = hasPermission(
    permissions,
    PermissionCode.ORG_READ,
  );
  const isHR = role === "HR";

  // Queries
  const myProfileQuery = useMyProfile();
  const usersQuery = useGetAllUsers();
  const departmentsQuery = useGetAllDepartments();
  const rolesQuery = useGetAllRoles();

  const users = usersQuery.data ?? [];
  const departments = departmentsQuery.data ?? [];
  const roles = rolesQuery.data ?? [];
  const myInterests = myProfileQuery.data?.gameInterests ?? [];

  // Mutations
  const updateUserByHRMutation = useUpdateUserByHR();
  const createProfileMutation = useCreateProfile();
  const uploadAvatarMutation = useUploadAvatar();

  // Avatar state
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }
    if (!file.type.startsWith("image/")) {
      toast.error("File must be an image");
      return;
    }
    setAvatarFile(file);
  };

  const handleAvatarUpload = async () => {
    if (!avatarFile) {
      toast.error("Please select an image");
      return;
    }
    try {
      await uploadAvatarMutation.mutateAsync(avatarFile);
      toast.success("Avatar uploaded successfully");
      setAvatarFile(null);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  // HR: Create Profile dialog
  const [createProfileOpen, setCreateProfileOpen] = useState(false);
  const [createProfileForm, setCreateProfileForm] = useState(
    emptyCreateProfileForm,
  );

  const handleCreateProfile = async () => {
    try {
      await createProfileMutation.mutateAsync(createProfileForm);
      toast.success("Profile created successfully");
      setCreateProfileOpen(false);
      setCreateProfileForm(emptyCreateProfileForm);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  // HR: Update User Account dialog
  const [updateUserOpen, setUpdateUserOpen] = useState(false);
  const [updateUserForm, setUpdateUserForm] = useState(emptyUpdateUserForm);

  const handleSelectUserForAccountUpdate = (userId: string) => {
    const user = users.find((u) => u.userId === userId);
    setUpdateUserForm({
      userId,
      firstName: user?.name?.split(" ")[0] ?? "",
      lastName: user?.name?.split(" ").slice(1).join(" ") ?? "",
      email: "",
      roleId: "",
      reportsToId: "",
      isActive: "true",
    });
  };

  const handleUpdateUserAccount = async () => {
    try {
      await updateUserByHRMutation.mutateAsync({
        userId: updateUserForm.userId,
        data: {
          firstName: updateUserForm.firstName || undefined,
          lastName: updateUserForm.lastName || undefined,
          email: updateUserForm.email || undefined,
          roleId: updateUserForm.roleId || undefined,
          reportsToId: updateUserForm.reportsToId || undefined,
          isActive: updateUserForm.isActive === "true",
        },
      });
      toast.success("User account updated successfully");
      setUpdateUserOpen(false);
      setUpdateUserForm(emptyUpdateUserForm);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <div className="container mx-auto max-w-4xl py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Account Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your account, profile, and preferences
        </p>
      </div>

      {/* HR Management */}
      {isHR && (
        <Card>
          <CardHeader>
            <CardTitle>HR Management</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            {/* Create Profile */}
            <Dialog
              open={createProfileOpen}
              onOpenChange={(o) => {
                setCreateProfileOpen(o);
                if (!o) setCreateProfileForm(emptyCreateProfileForm);
              }}
            >
              <DialogTrigger asChild>
                <Button>Create Employee Profile</Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create Employee Profile</DialogTitle>
                  <DialogDescription>
                    Create a new employment profile for a user.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-3 py-2">
                  <Label>User *</Label>
                  <Select
                    value={createProfileForm.userId}
                    onValueChange={(v) =>
                      setCreateProfileForm((p) => ({ ...p, userId: v }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select user" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {users.map((u) => (
                          <SelectItem key={u.userId} value={u.userId!}>
                            {u.name}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <Label>Employee Number</Label>
                  <Input
                    value={createProfileForm.empNumber ?? ""}
                    onChange={(e) =>
                      setCreateProfileForm((p) => ({
                        ...p,
                        empNumber: e.target.value,
                      }))
                    }
                    placeholder="EMP-001"
                  />
                  <Label>Department *</Label>
                  <Select
                    value={createProfileForm.departmentId}
                    onValueChange={(v) =>
                      setCreateProfileForm((p) => ({ ...p, departmentId: v }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {departments.map((d) => (
                          <SelectItem
                            key={d.departmentId}
                            value={d.departmentId!}
                          >
                            {d.name}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <Label>Joined Date</Label>
                  <Input
                    type="date"
                    value={createProfileForm.joinedDate ?? ""}
                    onChange={(e) =>
                      setCreateProfileForm((p) => ({
                        ...p,
                        joinedDate: e.target.value,
                      }))
                    }
                  />
                  <Label>Phone</Label>
                  <Input
                    value={createProfileForm.phone ?? ""}
                    onChange={(e) =>
                      setCreateProfileForm((p) => ({
                        ...p,
                        phone: e.target.value,
                      }))
                    }
                    placeholder="+91 12345 67890"
                  />
                  <Label>Bio</Label>
                  <Input
                    value={createProfileForm.bio ?? ""}
                    onChange={(e) =>
                      setCreateProfileForm((p) => ({
                        ...p,
                        bio: e.target.value,
                      }))
                    }
                    placeholder="Short bio"
                  />
                  <Label>Location</Label>
                  <Input
                    value={createProfileForm.location ?? ""}
                    onChange={(e) =>
                      setCreateProfileForm((p) => ({
                        ...p,
                        location: e.target.value,
                      }))
                    }
                    placeholder="City, Country"
                  />
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setCreateProfileOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateProfile}
                    disabled={
                      createProfileMutation.isPending ||
                      !createProfileForm.userId ||
                      !createProfileForm.departmentId
                    }
                  >
                    {createProfileMutation.isPending
                      ? "Creating..."
                      : "Create Profile"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Update User Account */}
            <Dialog
              open={updateUserOpen}
              onOpenChange={(o) => {
                setUpdateUserOpen(o);
                if (!o) setUpdateUserForm(emptyUpdateUserForm);
              }}
            >
              <DialogTrigger asChild>
                <Button variant="outline">Update User Account</Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Update User Account</DialogTitle>
                  <DialogDescription>
                    Update a user's credentials, role, and manager.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-3 py-2">
                  <Label>Select User *</Label>
                  <Select
                    value={updateUserForm.userId}
                    onValueChange={handleSelectUserForAccountUpdate}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select user" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {users.map((u) => (
                          <SelectItem key={u.userId} value={u.userId!}>
                            {u.name}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <Label>First Name</Label>
                  <Input
                    value={updateUserForm.firstName}
                    onChange={(e) =>
                      setUpdateUserForm((p) => ({
                        ...p,
                        firstName: e.target.value,
                      }))
                    }
                    placeholder="First name"
                  />
                  <Label>Last Name</Label>
                  <Input
                    value={updateUserForm.lastName}
                    onChange={(e) =>
                      setUpdateUserForm((p) => ({
                        ...p,
                        lastName: e.target.value,
                      }))
                    }
                    placeholder="Last name"
                  />
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={updateUserForm.email}
                    onChange={(e) =>
                      setUpdateUserForm((p) => ({
                        ...p,
                        email: e.target.value,
                      }))
                    }
                    placeholder="email@example.com"
                  />
                  <Label>Role</Label>
                  <Select
                    value={updateUserForm.roleId}
                    onValueChange={(v) =>
                      setUpdateUserForm((p) => ({ ...p, roleId: v }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {roles.map((r) => (
                          <SelectItem key={r.id} value={r.id!}>
                            {r.name}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <Label>Reports To</Label>
                  <Select
                    value={updateUserForm.reportsToId}
                    onValueChange={(v) =>
                      setUpdateUserForm((p) => ({ ...p, reportsToId: v }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select manager" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {users.map((u) => (
                          <SelectItem key={u.userId} value={u.userId!}>
                            {u.name}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <Label>Status</Label>
                  <Select
                    value={updateUserForm.isActive}
                    onValueChange={(v) =>
                      setUpdateUserForm((p) => ({ ...p, isActive: v }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Active</SelectItem>
                      <SelectItem value="false">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setUpdateUserOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleUpdateUserAccount}
                    disabled={
                      updateUserByHRMutation.isPending || !updateUserForm.userId
                    }
                  >
                    {updateUserByHRMutation.isPending
                      ? "Updating..."
                      : "Update Account"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      )}

      {/* My Account */}
      <MyAccountCard />

      {/* My Profile (phone, bio, location) */}
      <ProfileInfoCard />

      {/* Profile Avatar */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Avatar</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            <div className="shrink-0">
              {myProfileQuery.data?.avatarUrl ? (
                <img
                  src={myProfileQuery.data.avatarUrl}
                  alt="Avatar"
                  className="w-24 h-24 rounded-full object-cover border-2 border-primary"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-12 h-12 text-primary" />
                </div>
              )}
            </div>
            <div className="flex-1 space-y-3">
              <div>
                <Label htmlFor="avatar-upload" className="text-sm font-medium">
                  Upload New Avatar
                </Label>
                <Input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  JPG, PNG or GIF (max. 5MB)
                </p>
              </div>
              {avatarFile && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    Selected: {avatarFile.name}
                  </span>
                  <Button
                    size="sm"
                    onClick={handleAvatarUpload}
                    disabled={uploadAvatarMutation.isPending}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {uploadAvatarMutation.isPending ? "Uploading..." : "Upload"}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Game Interests */}
      <GameInterestsCard />

      {/* Org Chart */}
      {canReadOrgChart && <OrgChartComponent />}
    </div>
  );
};
