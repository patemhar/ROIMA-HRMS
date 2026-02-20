import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { User, Upload, Edit2, Save, X } from "lucide-react";
import { ProfileInfoCard } from "@/components/Account/ProfileInfoCard";
import {
  useAccountDetails,
  useAddInterest,
  useCreateProfile,
  useMyProfile,
  useRemoveInterest,
  useUploadAvatar,
  useUpdateMyUser,
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
import { useGetAllDepartments, useGetAllGames, useGetAllRoles, useGetAllUsers } from "@/hooks/util/util.hooks";
import { toast } from "sonner";
import { getErrorMessage } from "@/utils/error";

const emptyProfileForm = {
  userId: "",
  empNumber: "",
  departmentId: "",
  joinedDate: "",
  phone: "",
  bio: "",
  location: "",
};

export const AccountSettingsPage = () => {
  const role = useAuth((state) => state.auth.user?.role);
  const permissions = useAuth((state) => state.auth.user?.permission);
  const canReadOrgChart = hasPermission(
    permissions,
    PermissionCode.ORG_CHART_READ,
  );
  const canManageHrProfiles = role === "HR";

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [updateAccountDialogOpen, setUpdateAccountDialogOpen] = useState(false);
  const [createForm, setCreateForm] = useState(emptyProfileForm);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [isEditingAccount, setIsEditingAccount] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const [accountEditForm, setAccountEditForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    role: "",
    reports_to: "",
    is_active: "true",
    userId: "",
  });
  
  const [adminAccountEditForm, setAdminAccountEditForm] = useState({
    userId: "",
    first_name: "",
    last_name: "",
    email: "",
    role: "",
    reports_to: "",
    is_active: "true",
  });

  const useAccountDetailsQuery = useAccountDetails();
  const accountDetails = useAccountDetailsQuery.data;
  const myProfileQuery = useMyProfile();
  const usersQuery = useGetAllUsers();
  const departmentsQuery = useGetAllDepartments();
  const gamesQuery = useGetAllGames();
  const getAllRoles = useGetAllRoles();

  const roles = getAllRoles.data ?? [];

  const users = usersQuery.data ?? [];
  const departments = departmentsQuery.data ?? [];
  const games = gamesQuery.data ?? [];
  const myInterests = myProfileQuery.data?.gameInterests ?? [];

  const getUserName = (userId: string): string => {
    const user = users.find(u => u.userId === userId);
    return user ? user.name || userId : userId;
  };

  const createProfileMutation = useCreateProfile();
  const addInterestMutation = useAddInterest();
  const uploadAvatarMutation = useUploadAvatar();
  const removeInterestMutation = useRemoveInterest();
  const updateMyUserMutation = useUpdateMyUser();
  const updateUserByHRMutation = useUpdateUserByHR();

  useEffect(() => {
    if (!accountDetails) return;

    setAccountEditForm({
      first_name: accountDetails.first_name ?? "",
      last_name: accountDetails.last_name ?? "",
      email: accountDetails.email ?? "",
      role: accountDetails.role ?? "",
      reports_to: accountDetails.reports_to ?? "",
      is_active: accountDetails.is_active?.toString() ?? "true",
      userId: accountDetails.id ?? "",
    });
  }, [accountDetails]);

  const handleCreateProfile = async () => {
    try {
      await createProfileMutation.mutateAsync({
        userId: createForm.userId,
        empNumber: createForm.empNumber,
        departmentId: createForm.departmentId,
        joinedDate: createForm.joinedDate,
        phone: createForm.phone,
        bio: createForm.bio,
        location: createForm.location,
      });

      toast.success("Profile created successfully");
      setCreateDialogOpen(false);
      setCreateForm(emptyProfileForm);
      myProfileQuery.refetch();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create profile");
    }
  };

  const handleAddInterest = async (gameId: string) => {

    if (myInterests.includes(gameId)) {
      toast.error("You already have this interest");
      return;
    }

    try {
      await addInterestMutation.mutateAsync(gameId);
      toast.success("Interest added successfully");
    } catch (error) {
      toast.error(getErrorMessage(error));
      console.error("Error adding interest:", error);
    }
  };

  const handleRemoveInterest = async (gameId: string) => {
    try {
      await removeInterestMutation.mutateAsync(gameId);
      toast.success("Interest removed successfully");
    } catch (error) {
      toast.error(getErrorMessage(error));
      console.error("Error removing interest:", error);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { 
        toast.error("File size must be less than 5MB");
        return;
      }
      if (!file.type.startsWith("image/")) {
        toast.error("File must be an inage");
        return;
      }
      setAvatarFile(file);
    }
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
     
      const errorMessage = error instanceof Error ? error.message : "Failed to upload avatar";
      toast.error(errorMessage);
      console.error("Error uploading avatar:", error);
    }
  };

  const handleSaveAccountEdit = async () => {
    try {
      const baseData = {
        firstName: accountEditForm.first_name,
        lastName: accountEditForm.last_name,
        email: accountEditForm.email,
      };

      if (canManageHrProfiles) {
        await updateUserByHRMutation.mutateAsync({
          userId: accountEditForm.userId,
          data: {
            ...baseData,
            roleId: accountEditForm.role,
            reportsToId: accountEditForm.reports_to,
            isActive: accountEditForm.is_active === "true",
          } as any,
        });
      } else {
        await updateMyUserMutation.mutateAsync(baseData);
      }

      toast.success("Account updated successfully");
      setIsEditingAccount(false);
      useAccountDetailsQuery.refetch();
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
      toast.error(getErrorMessage(error));
      console.error("Error updating account:", error);
    }
  };

  const handleSaveAdminAccountEdit = async () => {
    try {
      await updateUserByHRMutation.mutateAsync({
        userId: adminAccountEditForm.userId,
        data: {
          firstName: adminAccountEditForm.first_name,
          lastName: adminAccountEditForm.last_name,
          email: adminAccountEditForm.email,
          roleId: adminAccountEditForm.role,
          reportsToId: adminAccountEditForm.reports_to,
          isActive: adminAccountEditForm.is_active === "true",
        } as any,
      });

      toast.success("Account updated successfully");
      setUpdateAccountDialogOpen(false);
      setAdminAccountEditForm({
        userId: "",
        first_name: "",
        last_name: "",
        email: "",
        role: "",
        reports_to: "",
        is_active: "true",
      });
      usersQuery.refetch();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to update account";
      toast.error(errorMessage);
      console.error("Error updating account:", error);
    }
  };

  const handleSelectUserForAdminUpdate = (userId: string) => {
    const user = users.find(u => u.userId === userId);
    if (user) {
      setAdminAccountEditForm({
        userId: user.userId || "",
        first_name: user.name?.split(" ")[0] ?? "",
        last_name: user.name?.split(" ").slice(1).join(" ") ?? "",
        email: "",
        role: "",
        reports_to: "",
        is_active: "true",
      });
    }
  };

  console.log(accountDetails?.is_active);

  return (
    <div className="container mx-auto max-w-4xl py-8 space-y-6">

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

      <div>
        <h1 className="text-3xl font-bold tracking-tight">Account Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your account information and security
        </p>
      </div>

      {canManageHrProfiles && (
        <Card>
          <CardHeader>
            <CardTitle>HR Profile Management</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button>Create Profile</Button>
                </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Create Profile</DialogTitle>
                  <DialogDescription>
                    Create a profile.
                  </DialogDescription>
                </DialogHeader>

                <div className="grid gap-3 py-2">
                  <Label>User</Label>
                  <Select
                    value={createForm.userId}
                    onValueChange={(value) =>
                      setCreateForm((prev) => ({ ...prev, userId: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={usersQuery.isLoading ? "Loading users..." : "Select user"}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {users.map((user) => (
                          <SelectItem key={user.userId} value={user.userId!}>
                            {user.name}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>

                  <Label>Employee Number</Label>
                  <Input
                    value={createForm.empNumber}
                    onChange={(e) =>
                      setCreateForm((prev) => ({ ...prev, empNumber: e.target.value }))
                    }
                    placeholder="EMP-001"
                  />

                  <Label>Department</Label>
                  <Select
                    value={createForm.departmentId}
                    onValueChange={(value) =>
                      setCreateForm((prev) => ({ ...prev, departmentId: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          departmentsQuery.isLoading
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
                    value={createForm.joinedDate}
                    onChange={(e) =>
                      setCreateForm((prev) => ({ ...prev, joinedDate: e.target.value }))
                    }
                  />

                  <Label>Phone</Label>
                  <Input
                    value={createForm.phone}
                    onChange={(e) =>
                      setCreateForm((prev) => ({ ...prev, phone: e.target.value }))
                    }
                    placeholder="Phone"
                  />

                  <Label>Bio</Label>
                  <Input
                    value={createForm.bio}
                    onChange={(e) =>
                      setCreateForm((prev) => ({ ...prev, bio: e.target.value }))
                    }
                    placeholder="Bio"
                  />

                  <Label>Location</Label>
                  <Input
                    value={createForm.location}
                    onChange={(e) =>
                      setCreateForm((prev) => ({ ...prev, location: e.target.value }))
                    }
                    placeholder="Location"
                  />
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateProfile}
                    disabled={createProfileMutation.isPending || !createForm.userId}
                  >
                    {createProfileMutation.isPending ? "Creating..." : "Create"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog open={updateAccountDialogOpen} onOpenChange={setUpdateAccountDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">Update User Account</Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Update User Account</DialogTitle>
                  <DialogDescription>
                    Update a user's account details including role and manager assignment.
                  </DialogDescription>
                </DialogHeader>

                <div className="grid gap-3 py-2">
                  <Label>User</Label>
                  <Select
                    value={adminAccountEditForm.userId}
                    onValueChange={(value) => {
                      handleSelectUserForAdminUpdate(value);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={usersQuery.isLoading ? "Loading users..." : "Select user"}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {users.map((user) => (
                          <SelectItem key={user.userId} value={user.userId!}>
                            {user.name}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>

                  <Label>First Name</Label>
                  <Input
                    value={adminAccountEditForm.first_name}
                    onChange={(e) =>
                      setAdminAccountEditForm((prev) => ({ ...prev, first_name: e.target.value }))
                    }
                    placeholder="First name"
                  />

                  <Label>Last Name</Label>
                  <Input
                    value={adminAccountEditForm.last_name}
                    onChange={(e) =>
                      setAdminAccountEditForm((prev) => ({ ...prev, last_name: e.target.value }))
                    }
                    placeholder="Last name"
                  />

                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={adminAccountEditForm.email}
                    onChange={(e) =>
                      setAdminAccountEditForm((prev) => ({ ...prev, email: e.target.value }))
                    }
                    placeholder="Email"
                  />

                  <Label>Role</Label>
                  <Select
                    value={adminAccountEditForm.role}
                    onValueChange={(value) =>
                      setAdminAccountEditForm((prev) => ({ ...prev, role: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {
                          roles.map((role) => (
                            <SelectItem key={role.id} value={role.id || ""}>
                              {role.name}
                            </SelectItem>
                          ))
                        }
                      </SelectGroup>
                    </SelectContent>
                  </Select>

                  <Label>Reports To</Label>
                  <Select
                    value={adminAccountEditForm.reports_to}
                    onValueChange={(value) =>
                      setAdminAccountEditForm((prev) => ({ ...prev, reports_to: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select manager" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {users
                          .map((user) => (
                            <SelectItem key={user.userId} value={user.userId!}>
                              {user.name}
                            </SelectItem>
                          ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>

                  <Label>Is Active</Label>
                  <Select
                    value={adminAccountEditForm.is_active}
                    onValueChange={(value) =>
                      setAdminAccountEditForm((prev) => ({ ...prev, is_active: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="true">Active</SelectItem>
                        <SelectItem value="false">Inactive</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setUpdateAccountDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSaveAdminAccountEdit}
                    disabled={updateUserByHRMutation.isPending || !adminAccountEditForm.userId}
                  >
                    {updateUserByHRMutation.isPending ? "Updating..." : "Update"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <CardTitle>User Account</CardTitle>
            </div>
            {!isEditingAccount && (
              <button
                onClick={() => setIsEditingAccount(true)}
                className="p-2 hover:bg-accent rounded-md transition-colors"
                title="Edit account"
              >
                <Edit2 className="h-4 w-4" />
              </button>
            )}
          </div>
        </CardHeader>

        <CardContent>
          {isEditingAccount ? (
            <div className="space-y-4">
              {/* Regular fields */}
              <div>
                <Label htmlFor="first_name" className="text-sm font-medium">First Name</Label>
                <Input
                  id="first_name"
                  value={accountEditForm.first_name}
                  onChange={(e) =>
                    setAccountEditForm((prev) => ({
                      ...prev,
                      first_name: e.target.value,
                    }))
                  }
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="last_name" className="text-sm font-medium">Last Name</Label>
                <Input
                  id="last_name"
                  value={accountEditForm.last_name}
                  onChange={(e) =>
                    setAccountEditForm((prev) => ({
                      ...prev,
                      last_name: e.target.value,
                    }))
                  }
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={accountEditForm.email}
                  onChange={(e) =>
                    setAccountEditForm((prev) => ({
                      ...prev,
                      email: e.target.value,
                    }))
                  }
                  className="mt-1"
                />
              </div>

              {/* HR-only fields */}
              {canManageHrProfiles && (
                <>
                  <div>
                    <Label htmlFor="role" className="text-sm font-medium">Role</Label>
                    <Select
                      value={accountEditForm.role}
                      onValueChange={(value) =>
                        setAccountEditForm((prev) => ({
                          ...prev,
                          role: value,
                        }))
                      }
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value="EMPLOYEE">Employee</SelectItem>
                          <SelectItem value="HR">HR</SelectItem>
                          <SelectItem value="MANAGER">Manager</SelectItem>
                          <SelectItem value="ADMIN">Admin</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="reports_to" className="text-sm font-medium">Reports To</Label>
                    <Select
                      value={accountEditForm.reports_to}
                      onValueChange={(value) =>
                        setAccountEditForm((prev) => ({
                          ...prev,
                          reports_to: value,
                        }))
                      }
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select manager" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {users.map((user) => (
                            <SelectItem key={user.userId} value={user.userId!}>
                              {user.name}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="is_active" className="text-sm font-medium">Is Active</Label>
                    <Select
                      value={accountEditForm.is_active}
                      onValueChange={(value) =>
                        setAccountEditForm((prev) => ({
                          ...prev,
                          is_active: value,
                        }))
                      }
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value="true">Active</SelectItem>
                          <SelectItem value="false">Inactive</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

              {/* Action buttons */}
              <div className="flex gap-2 justify-end pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditingAccount(false);
                    setAccountEditForm({
                      first_name: accountDetails?.first_name ?? "",
                      last_name: accountDetails?.last_name ?? "",
                      email: accountDetails?.email ?? "",
                      role: accountDetails?.role ?? "",
                      reports_to: accountDetails?.reports_to ?? "",
                      is_active: accountDetails?.is_active?.toString() ?? "true",
                      userId: accountDetails?.id ?? "",
                    });
                  }}
                  disabled={updateMyUserMutation.isPending || updateUserByHRMutation.isPending}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveAccountEdit}
                  disabled={updateMyUserMutation.isPending || updateUserByHRMutation.isPending}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {updateMyUserMutation.isPending || updateUserByHRMutation.isPending
                    ? "Saving..."
                    : "Save"}
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Name</Label>
                <p className="text-sm font-medium">{accountDetails?.first_name} {accountDetails?.last_name}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Email</Label>
                <p className="text-sm font-medium">{accountDetails?.email}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Last Login</Label>
                <p className="text-sm font-medium">{accountDetails?.last_login}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Role</Label>
                <p className="text-sm font-medium">{accountDetails?.role}</p>
              </div>
              {canManageHrProfiles && (
                <>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Reports to</Label>
                    <p className="text-sm font-medium">
                      {accountDetails?.reports_to ? getUserName(accountDetails.reports_to) : "—"}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Is Active</Label>
                    <p className="text-sm font-medium">{accountDetails?.is_active ? "True" : "False"}</p>
                  </div>
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Account info card */}
      <ProfileInfoCard />

      {/* avatar */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Avatar</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
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

      {/* Game Interests Card */}
      <Card>
        <CardHeader>
          <CardTitle>Game Interests</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-sm font-medium mb-2 block">Your Interests</Label>
            {myInterests.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {myInterests.map((gameId: string) => {
                  const game = games.find((g) => g.id === gameId);
                  if (!game) return null;
                  return (
                    <div
                      key={gameId}
                      className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-lg"
                    >
                      <span className="text-sm font-medium">
                        {game.name}
                      </span>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-5 w-5 p-0"
                        onClick={() => handleRemoveInterest(gameId)}
                        disabled={removeInterestMutation.isPending}
                      >
                        ×
                      </Button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No interests added yet
              </p>
            )}
          </div>

          <div>
            <Label className="text-sm font-medium mb-2 block">
              Available Games
            </Label>
            {gamesQuery.isLoading ? (
              <p className="text-sm text-muted-foreground">Loading games...</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {games
                  .filter((game) => !myInterests.includes(game.id!))
                  .map((game) => (
                    <div
                      key={game.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div>
                        <p className="text-sm font-medium">{game.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {game.description}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleAddInterest(game.id!)}
                        disabled={addInterestMutation.isPending}
                      >
                        Add
                      </Button>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {canReadOrgChart && <OrgChartComponent />}
    </div>
  );
};
