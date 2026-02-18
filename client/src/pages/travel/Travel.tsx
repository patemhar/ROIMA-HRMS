import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useCreateTravel, useGetAllTravels, useGetMyTravels } from "@/hooks/travel/travel.hooks";
import { getErrorMessage } from "@/utils/error";
import { useState } from "react";
import { useForm } from "react-hook-form";
import type { components } from "@/types/api";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter,
  DialogContent,
  DialogHeader,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/store";

type Schemas = components["schemas"];

export const Travel = () => {
  const navigate = useNavigate();

  const userRole = useAuth((state) => state.auth.user?.role);

  const getMyTravelsQuery = useGetMyTravels();

  const getAllTravelsquery = useGetAllTravels();

  const [createDialogOpen, setCreateDialogOpen] = useState<boolean>(false);

  const createTravel = useCreateTravel();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Schemas["TravelRequest"]>({
    mode: "onBlur",
    defaultValues: {
      title: "",
      description: "",
      start_date: "",
      end_date: "",
      destination: "",
    },
  });

  

  const onSubmit = (data: Schemas["TravelRequest"]) => {
    createTravel.mutate(data, {
      onSuccess: () => {
        reset();
        setCreateDialogOpen(false);
      },
      onError: (err: any) => {},
    });
  };

  const items = getAllTravelsquery.data ?? [];

  const handleRowClick = (id?: string) => {
    if (!id) return;
    navigate(`${id}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => getAllTravelsquery.refetch()}
            >
              Refresh
            </Button>
          </div>
        </div>

        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>Create Travel</Button>
          </DialogTrigger>

          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Travel</DialogTitle>
              <DialogDescription>
                Fill in the details to create a new travel plan.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="grid gap-4 py-4">
                {/* Title */}
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input
                    {...register("title", { required: "Title is required" })}
                  />
                  {errors.title && (
                    <p className="text-sm text-destructive">
                      {errors.title.message}
                    </p>
                  )}
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea {...register("description")} />
                </div>

                {/* Destination */}
                <div className="space-y-2">
                  <Label>Destination</Label>
                  <Input {...register("destination")} />
                </div>

                {/* Dates */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Start Date</Label>
                    <Input
                      type="date"
                      {...register("start_date", {
                        required: "Start date required",
                      })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>End Date</Label>
                    <Input
                      type="date"
                      {...register("end_date", {
                        required: "End date required",
                      })}
                    />
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCreateDialogOpen(false)}
                >
                  Cancel
                </Button>

                <Button type="submit" disabled={createTravel.isPending}>
                  {createTravel.isPending ? "Creating..." : "Create Travel"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Travels</CardTitle>
              <CardDescription>All Travels</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {getAllTravelsquery.isLoading && (
            <div className="flex justify-center py-6">
              <Spinner />
            </div>
          )}

          {getAllTravelsquery.isError && (
            <p className="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
              {getErrorMessage(getAllTravelsquery.error)}
            </p>
          )}

          {Boolean(items.length) && (
            <div className="rounded-lg border border-slate-100">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Travel ID</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Destination</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>StartDate</TableHead>
                    <TableHead>End Date</TableHead>
                    <TableHead>Created By</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((travel, id) => {
                    return (
                      <TableRow
                        key={
                          travel?.id ?? `${travel.title ?? "candidate"}-${id}`
                        }
                        className="transition-colors hover:bg-muted/40"
                      >
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          {travel?.id ?? "—"}
                        </TableCell>
                        <TableCell className="font-medium">
                          {travel.title ?? "Unknown"}
                        </TableCell>
                        <TableCell>{travel?.destination ?? "—"}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{travel.status}</Badge>
                        </TableCell>
                        <TableCell>{travel.start_date}</TableCell>
                        <TableCell>{travel.end_date}</TableCell>
                        <TableCell>{travel.createdByName}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleRowClick(travel?.id)}
                            className="cursor-pointer"
                          >
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
