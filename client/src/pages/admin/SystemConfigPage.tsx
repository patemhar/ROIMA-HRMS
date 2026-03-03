import { useState } from "react";
import {
  useGetAllSystemConfigs,
  useCreateSystemConfig,
  useUpdateSystemConfig,
  useDeleteSystemConfig,
} from "@/hooks/admin/admin.hooks";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Pencil, Trash2 } from "lucide-react";
import type { components } from "@/types/api";
import { toast } from "sonner";
import { getErrorMessage } from "@/utils/error";

type Schemas = components["schemas"];
type SystemConfigResponse = Schemas["SystemConfigResponseDto"];
type SystemConfigRequest = Schemas["SystemConfigRequestDto"];

const SystemConfigPage = () => {
  const { data: configs, isLoading } = useGetAllSystemConfigs();
  const createMutation = useCreateSystemConfig();
  const updateMutation = useUpdateSystemConfig();
  const deleteMutation = useDeleteSystemConfig();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingConfig, setEditingConfig] = useState<SystemConfigResponse | null>(null);
  const [formData, setFormData] = useState<SystemConfigRequest>({
    keyName: "",
    value: "",
  });

  const handleOpenDialog = (config?: SystemConfigResponse) => {
    if (config) {
      setEditingConfig(config);
      setFormData({
        keyName: config.keyName || "",
        value: config.value || "",
      });
    } else {
      setEditingConfig(null);
      setFormData({ keyName: "", value: "" });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingConfig(null);
    setFormData({ keyName: "", value: "" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingConfig) {
        await updateMutation.mutateAsync({ id: editingConfig.id!, data: formData });
        toast.success("System config updated successfully");
      } else {
        await createMutation.mutateAsync(formData);
        toast.success("System config created successfully");
      }
      handleCloseDialog();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this system config?")) {
      try {
        await deleteMutation.mutateAsync(id);
        toast.success("System config deleted successfully");
      } catch (error) {
        toast.error(getErrorMessage(error));
      }
    }
  };

  return (
    <div className="space-y-6 p-1">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            System Configuration
          </h1>
          <p className="text-muted-foreground mt-1">Manage system default values</p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="h-4 w-4 mr-2" />
          Add Config
        </Button>
      </div>

      <Card>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Key Name</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {!configs || configs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground py-6 italic text-sm">
                      No system configs found. Add one to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  configs.map((config) => (
                    <TableRow key={config.id}>
                      <TableCell className="font-medium">{config.keyName}</TableCell>
                      <TableCell className="max-w-md truncate">{config.value}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenDialog(config)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(config.id!)}
                            disabled={deleteMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingConfig ? "Edit Config" : "Add New Config"}</DialogTitle>
            <DialogDescription>
              {editingConfig
                ? "Update the system configuration setting."
                : "Add a new system configuration setting."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="keyName">Key Name</Label>
                <Input
                  id="keyName"
                  placeholder="e.g., MAX_LOGIN_ATTEMPTS"
                  value={formData.keyName}
                  onChange={(e) => setFormData({ ...formData, keyName: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="value">Value</Label>
                <Input
                  id="value"
                  placeholder="e.g., 5"
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {editingConfig ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SystemConfigPage;
