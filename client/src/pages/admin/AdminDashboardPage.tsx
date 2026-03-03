import {
  useGetDashboardStats,
  useGetSystemActivity,
  useGetAllDepartments,
  useGetAllRoles,
} from "@/hooks/admin/admin.hooks";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Users,
  Building,
  Shield,
  Briefcase,
  Plane,
  Activity,
  TrendingUp,
  Gamepad2,
  FileText,
  Clock,
  Receipt,
  Plus,
  Pencil,
  Trash,
  MoreHorizontal,
  Settings,
} from "lucide-react";
import { use, useState } from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import type { components } from "@/types/api";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AdminService } from "@/services/adminService";
import { toast } from "sonner";
import { getErrorMessage } from "@/utils/error";
import { Button } from "@/components/ui/button";
import { de } from "zod/v4/locales";
import { Spinner } from "@/components/ui/spinner";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";

type Schemas = components["schemas"];

const AdminDashboardPage = () => {
  const { data: stats, isLoading: statsLoading } = useGetDashboardStats();
  const { data: activity, isLoading: activityLoading } = useGetSystemActivity();
  const { data: departments } = useGetAllDepartments(1, 10);
  const { data: roles } = useGetAllRoles(1, 5);

  const [departmentId, setDepartmentId] = useState<string | null>(null);
  const [roleId, setRoleId] = useState<string | null>(null);                  

  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [departmentDialogOpen, setDepartmentDialogOpen] = useState(false);

  const navigate = useNavigate();

  const departmentSchema = z.object({
    departmentName: z.string().min(2, "Department name must be at least 2 characters"),
    departmentCode: z.string().min(2, "Department code must be at least 2 characters").max(10, "Department code must be at most 10 characters"),
  });

  const roleSchema = z.object({
    name: z.string().min(2, "Role name must be at least 2 characters"),
    description: z.string().max(255, "Role description must be at most 255 characters").optional(),
  });

  const {
    register: registerDepartment,
    handleSubmit: handleSubmitDepartment,
    reset: resetDepartmentForm,
    setValue: setDepartmentFormValue,
    formState: { errors: departmentErrors, isSubmitting: isDepartmentSubmitting }
  } = useForm<Schemas["DepartmentRequestDto"]>({
    mode: "onChange",
    defaultValues: {
      departmentCode: "",
      departmentName: "",
    }
  })

  const {
    register: registerRole,
    handleSubmit: handleSubmitRole,
    reset: resetRoleForm,
    setValue: setRoleFormValue,
    formState: { errors: roleErrors, isSubmitting: isRoleSubmitting } 
  } = useForm<Schemas["RoleRequestDto"]>({
    mode: "onChange",
    defaultValues: {
      name: "",
      description: "",
    }
  })

  const handleDepartmentCreateSubmit = async (data: Schemas["DepartmentRequestDto"]) => {
    try {

      departmentSchema.parse(data);

      await AdminService.createDepartment(data);

      resetDepartmentForm();
      toast.success("Department created successfully!");
      setDepartmentDialogOpen(false);
    } catch (error) {
      toast.error("Failed to create department. Please try again." + getErrorMessage(error));
    }
  }

  const handleDepartmentUpdateSubmit = async ({ id, data }: { id: string; data: Schemas["DepartmentRequestDto"] }) => {
    
    if(!id) {
      toast.error("No department selected for update.");
      return;
    }

    try {
      
      departmentSchema.parse(data);

      await AdminService.updateDepartment(id, data);

      resetDepartmentForm();
      toast.success("Department updated successfully!");
      setDepartmentDialogOpen(false);
    } catch (error) {
      toast.error("Failed to update department. Please try again." + getErrorMessage(error));
    }
  }

  const handleDepartmentDelete = async (id: string) => {
    
    if(!id) {
      toast.error("No department selected for deletion.");
      return;
    }

    if(!confirm("Are you sure you want to delete this department? This action cannot be undone.")) {
      return;
    }

    try {
      await AdminService.deleteDepartment(id);

      toast.success("Department deleted successfully!");
      setDepartmentDialogOpen(false);
    } catch (error) {
      toast.error("Failed to delete department. Please try again." + getErrorMessage(error));
    }
  }

  const handleRoleCreateSubmit = async (data: Schemas["RoleRequestDto"]) => {

    roleSchema.parse(data);

    try {
      await AdminService.createRole(data);

      resetRoleForm();
      toast.success("Role created successfully!");
      setRoleDialogOpen(false);
    } catch (error) {
      toast.error("Failed to create role. Please try again." + getErrorMessage(error));
    }
  }

  const handleRoleUpdateSubmit = async ({ id, data }: { id: string; data: Schemas["RoleRequestDto"] }) => {
    
    if(!id) {
      toast.error("No role selected for update.");
      return;
    }

    try {
      roleSchema.parse(data);

      await AdminService.updateRole(id, data);

      resetRoleForm();
      toast.success("Role updated successfully!");
      setRoleDialogOpen(false);
    } catch (error) {
      toast.error("Failed to update role. Please try again." + getErrorMessage(error));
    }
  }

  const handleRoleDelete = async (id: string) => {
    
    if(!id) {
      toast.error("No role selected for deletion.");
      return;
    }

    if(!confirm("Are you sure you want to delete this role? This action cannot be undone.")) {
      return;
    }

    try {
      await AdminService.deleteRole(id);

      toast.success("Role deleted successfully!");
      setRoleDialogOpen(false);
    } catch (error) {
      toast.error("Failed to delete role. Please try again." + getErrorMessage(error));
    }
  }

  const StatCard = ({
    title,
    value,
    sub,
    icon: Icon,
    loading,
    highlight = false,
  }: {
    title: string;
    value: string | number;
    sub: string;
    icon: any;
    loading: boolean;
    highlight?: boolean;
  }) => (
    <Card className={highlight ? "border-destructive" : ""}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon
          className={`h-4 w-4 ${highlight ? "text-destructive" : "text-muted-foreground"}`}
        />
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-8 w-8" />
        ) : (
          <div
            className={`text-2xl font-bold ${highlight ? "text-destructive" : ""}`}
          >
            {value}
          </div>
        )}
        <p className="text-xs text-muted-foreground mt-1">{sub}</p>
      </CardContent>
    </Card>
  );

  return (
    <>
      <div className="space-y-6 p-1">
        <div className="flex justify-between items-center">
          <div className="flex flex-col">
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">
              System overview and management data
            </p>
          </div>
          <div>
              <Button variant="outline" onClick={() => navigate("/employee/admin/system-config")}>
                <Settings className="h-4 w-4 mr-2" />
                System Config
              </Button>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Users"
            value={stats?.totalUsers ?? 0}
            sub={`${stats?.activeUsers ?? 0} active - ${stats?.inactiveUsers ?? 0} inactive`}
            icon={Users}
            loading={statsLoading}
            />
          <StatCard
            title="Departments"
            value={stats?.totalDepartments ?? 0}
            sub="Across the organisation"
            icon={Building}
            loading={statsLoading}
          />
          <StatCard
            title="Roles"
            value={stats?.totalRoles ?? 0}
            sub="Defined permission roles"
            icon={Shield}
            loading={statsLoading}
            />
          <StatCard
            title="Total Jobs"
            value={stats?.totalJobs ?? 0}
            sub={`${stats?.activeJobs ?? 0} active postings`}
            icon={Briefcase}
            loading={statsLoading}
            />
          <StatCard
            title="Total Travels"
            value={stats?.totalTravels ?? 0}
            sub={`${stats?.activeTravels ?? 0} currently active`}
            icon={Plane}
            loading={statsLoading}
            />
          <StatCard
            title="Games"
            value={stats?.totalGames ?? 0}
            sub="Games registered in system"
            icon={Gamepad2}
            loading={statsLoading}
            />
          <StatCard
            title="Achievement Posts"
            value={stats?.totalPosts ?? 0}
            sub="Posts on the achievements feed"
            icon={FileText}
            loading={statsLoading}
            />
          <StatCard
            title="Total Expenses"
            value={stats?.totalTravelExpenses ?? 0}
            sub="Travel expense claims filed"
            icon={Receipt}
            loading={statsLoading}
            />
          <StatCard
            title="Pending Approvals"
            value={stats?.pendingExpenseApprovals ?? 0}
            sub="Expense approvals awaiting action"
            icon={Clock}
            loading={statsLoading}
          />
          <StatCard
            title="Active Jobs"
            value={stats?.activeJobs ?? 0}
            sub="Open job postings right now"
            icon={TrendingUp}
            loading={statsLoading}
            />
        </div>

        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" /> System Activity
            </CardTitle>
            <CardDescription>Login and creation metrics</CardDescription>
          </CardHeader>
          <CardContent>
            {activityLoading ? (
              <div className="grid sm:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full rounded-lg" />
                ))}
              </div>
            ) : (
              <div className="grid sm:grid-cols-3 gap-4">
                {[
                  {
                    label: "Logins (last 24 h)",
                    value: activity?.recentLogins ?? 0,
                  },
                  {
                    label: "New users this month",
                    value: activity?.newUsersThisMonth ?? 0,
                  },
                  {
                    label: "New travels this month",
                    value: activity?.newTravelsThisMonth ?? 0,
                  },
                  {
                    label: "New jobs this month",
                    value: activity?.newJobsThisMonth ?? 0,
                  },
                  {
                    label: "New posts this month",
                    value: activity?.newPostsThisMonth ?? 0,
                  },
                ].map(({ label, value }) => (
                  <div key={label} className="rounded-lg border p-3">
                    <p className="text-xs text-muted-foreground">{label}</p>
                    <p className="text-2xl font-bold mt-1">{value}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="overflow-hidden">
            <CardHeader>
              <CardTitle className="flex justify-between">
                Departments
                <Button size="sm" variant="outline" onClick={() => {
                  setDepartmentId(null);
                  resetRoleForm();
                  setDepartmentDialogOpen(true)}
                }>
                  <Plus className="h-4 w-4 mr-2" />
                  New Department
                </Button>
              </CardTitle>
              <CardDescription>
                Showing {departments?.content?.length ?? 0} of{" "}
                {departments?.totalElements ?? 0}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead className="text-center">Employees</TableHead>
                    <TableHead className="text-center">Open Jobs</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {departments?.content?.length ? (
                    departments.content.map((d) => (
                      <TableRow key={d.id}>
                        <TableCell className="font-medium">
                          {d.departmentName}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{d.departmentCode}</Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          {d.employeeCount ?? 0}
                        </TableCell>
                        <TableCell className="text-center">
                          {d.jobOpeningsCount ?? 0}
                        </TableCell>
                        <TableCell className="text-right">
                           <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" disabled={isDepartmentSubmitting}>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="bg-emerald-50">
                              <DropdownMenuItem>
                                <Button variant="ghost" size="sm" onClick={() => {
                                  setDepartmentId(d.id!);
                                  setDepartmentFormValue("departmentName", d.departmentName!);
                                  setDepartmentFormValue("departmentCode", d.departmentCode!);
                                  setDepartmentDialogOpen(true);
                                }}>
                            <Pencil className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Button variant="ghost" size="sm" onClick={() => handleDepartmentDelete(d.id!)}>
                                  <Trash className="h-4 w-4 mr-1"/>
                                  Delete
                                </Button>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow className="text-center">
                      <TableCell colSpan={4} className="text-muted-foreground py-6 text-sm">
                        No departments found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card className="overflow-auto">
            <CardHeader>
              <CardTitle className="flex justify-between">
                Roles
                <Button size="sm" variant="outline" onClick={() => {
                  setRoleId(null);
                  resetRoleForm();
                  setRoleDialogOpen(true)
                  }
                }>
                  <Plus className="h-4 w-4 mr-2" />
                  New Role
                </Button>
              </CardTitle>
              <CardDescription>
                Showing {roles?.content?.length ?? 0} of{" "}
                {roles?.totalElements ?? 0}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Users</TableHead>
                    <TableHead className="text-right">Perms</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {roles?.content?.length ? (
                    roles.content.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell className="font-medium">{r.name}</TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {r.description || "—"}
                        </TableCell>
                        <TableCell className="text-center">
                          {r.userCount ?? 0}
                        </TableCell>
                        <TableCell className="text-center">
                          {r.permissionCount ?? 0}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" disabled={isDepartmentSubmitting}>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="bg-emerald-50">
                              <DropdownMenuItem>
                                <Button variant="ghost" size="sm" onClick={() => {
                                  setRoleId(r.id!);
                                  setRoleFormValue("name", r.name!);
                                  setRoleFormValue("description", r.description || "");
                                  setRoleDialogOpen(true);
                                }}>
                                  <Pencil className="h-4 w-4 mr-1" />
                                  Edit
                                </Button>
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Button variant="ghost" size="sm" onClick={() => handleRoleDelete(r.id!)}>
                                  <Trash className="h-4 w-4 mr-1"/>
                                  Delete
                                </Button>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow className="text-center">
                      <TableCell colSpan={4} className="text-muted-foreground py-6 text-sm">
                        No roles found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <Dialog open={departmentDialogOpen} onOpenChange={setDepartmentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {departmentId ? "Edit Department" : "Create New Department"}
            </DialogTitle>
          </DialogHeader>
          <Label htmlFor="departmentName">
            Department Name
          </Label>
          <Input
            id="departmentName"
            placeholder="Department Name"
            {...registerDepartment("departmentName")}
            disabled={isDepartmentSubmitting}
          />          
          {departmentErrors.departmentName && (
            <p className="text-xs text-destructive mt-1">
              {departmentErrors.departmentName.message}
            </p>
          )}
          <Label htmlFor="departmentCode">
            Department Code
          </Label>
          <Input
            id="departmentCode"
            placeholder="Department Code"
            {...registerDepartment("departmentCode")}
            disabled={isDepartmentSubmitting}
          />
          {departmentErrors.departmentCode && (
            <p className="text-xs text-destructive mt-1">
              {departmentErrors.departmentCode.message}              
            </p>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDepartmentId(null);
                resetDepartmentForm();
                setDepartmentDialogOpen(false);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={departmentId ? handleSubmitDepartment((data) => handleDepartmentUpdateSubmit({ id: departmentId, data })) : handleSubmitDepartment(handleDepartmentCreateSubmit)}
              disabled={isDepartmentSubmitting}
            >
              {departmentId ? isDepartmentSubmitting ? "Updating Department..." : "Update Department" : isDepartmentSubmitting ? "Creating Department..." : "Create Department"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    
      <Dialog open={roleDialogOpen} onOpenChange={setRoleDialogOpen}>
        <DialogContent>
          <DialogHeader>  
            <DialogTitle>
              {roleId ? "Edit Role" : "Create New Role"}
            </DialogTitle>
          </DialogHeader>
          <Label htmlFor="name">
            Role Name
          </Label>
          <Input
            id="roleName"
            placeholder="Role Name"
            {...registerRole("name")}
            disabled={isRoleSubmitting}
          />
          {roleErrors.name && (
            <p className="text-xs text-destructive mt-1">
              {roleErrors.name.message}
            </p>
          )}
          <Label htmlFor="roleDescription">
            Role Description
          </Label>
          <Input
            id="roleDescription"
            placeholder="Role Description"
            {...registerRole("description")}
            disabled={isRoleSubmitting} 
          />
          {roleErrors.description && (
            <p className="text-xs text-destructive mt-1">
              {roleErrors.description.message}
            </p>
          )}
          <DialogFooter>
            <Button
              onClick={roleId ? handleSubmitRole((data) => handleRoleUpdateSubmit({ id: roleId, data })) : handleSubmitRole(handleRoleCreateSubmit)}
              disabled={isRoleSubmitting}
            >
              {roleId ? isRoleSubmitting ? "Updating Role..." : "Update Role" : isRoleSubmitting ? "Creating Role..." : "Create Role"} 
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setRoleId(null);
                resetRoleForm();
                setRoleDialogOpen(false);
              }}
              disabled={isRoleSubmitting}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AdminDashboardPage;
