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
import {
  useCreateTravel,
  useGetAllTravels,
  useGetMyTravels,
} from "@/hooks/travel/travel.hooks";
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
import { toast } from "sonner";

type Schemas = components["schemas"];

export const Travel = () => {
  
  const permissions = useAuth((state) => state.auth.user?.permission);

  const isAdmin = permissions?.includes("PER001")
  const getAllTravelsquery = useGetAllTravels(
    !!isAdmin
  );

  const allItems = getAllTravelsquery.data ?? [];

  const navigate = useNavigate();

  const userRole = useAuth((state) => state.auth.user?.role);

  const getMyTravelsQuery = useGetMyTravels();

  const [createDialogOpen, setCreateDialogOpen] = useState<boolean>(false);

  const createTravel = useCreateTravel();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<Schemas["TravelRequest"]>({
    mode: "onChange",
    defaultValues: {
      title: "",
      description: "",
      start_date: "",
      end_date: "",
      destination: "",
    },
  });

  const startDate = watch("start_date");

  const onSubmit = async (data: Schemas["TravelRequest"]) => {
    try {
      await createTravel.mutateAsync(data);
      reset();
      setCreateDialogOpen(false);
    } catch (error) {
      toast.error(getErrorMessage(error));
      console.error("Submission failed", error);
    }
  };

  const items = getMyTravelsQuery.data ?? [];

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

        <Dialog
          open={createDialogOpen}
          onOpenChange={(open) => {
            setCreateDialogOpen(open);
            if (!open) reset(); 
          }}
        >
          <DialogTrigger asChild>
            <Button>Create Travel</Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-[525px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Travel Plan</DialogTitle>
              <DialogDescription>
                Enter the details of your upcoming trip. All fields marked with
                * are required.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pt-4">
              <div className="grid gap-5">
                {/* Title */}
                <div className="space-y-2">
                  <Label
                    htmlFor="title"
                    className={errors.title ? "text-destructive" : ""}
                  >
                    Title *
                  </Label>
                  <Input
                    id="title"
                    placeholder="e.g. Q3 Client Visit"
                    className={
                      errors.title
                        ? "border-destructive focus-visible:ring-destructive"
                        : ""
                    }
                    {...register("title", {
                      required: "A catchy title is required",
                      minLength: {
                        value: 3,
                        message: "Title must be at least 3 characters",
                      },
                    })}
                  />
                  {errors.title && (
                    <p className="text-[0.8rem] font-medium text-destructive">
                      {errors.title.message}
                    </p>
                  )}
                </div>

                {/* Destination */}
                <div className="space-y-2">
                  <Label
                    htmlFor="destination"
                    className={errors.destination ? "text-destructive" : ""}
                  >
                    Destination *
                  </Label>
                  <Input
                    id="destination"
                    placeholder="City, Country"
                    className={
                      errors.destination
                        ? "border-destructive focus-visible:ring-destructive"
                        : ""
                    }
                    {...register("destination", {
                      required: "Where are you going?",
                    })}
                  />
                  {errors.destination && (
                    <p className="text-[0.8rem] font-medium text-destructive">
                      {errors.destination.message}
                    </p>
                  )}
                </div>

                {/* Dates Section */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="start_date">Start Date *</Label>
                    <Input
                      id="start_date"
                      type="date"
                      className={
                        errors.start_date
                          ? "border-destructive focus-visible:ring-destructive"
                          : ""
                      }
                      {...register("start_date", {
                        required: "Start date is required",
                        validate: (value) => {

                          if(!value) return "Start date is required"

                          const selected = new Date(value);
                          const today = new Date();
                          today.setHours(0, 0, 0, 0);
                          return (
                            selected >= today || "Date cannot be in the past"
                          );
                        },
                      })}
                    />
                    {errors.start_date && (
                      <p className="text-[0.8rem] font-medium text-destructive">
                        {errors.start_date.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="end_date">End Date *</Label>
                    <Input
                      id="end_date"
                      type="date"
                      className={
                        errors.end_date
                          ? "border-destructive focus-visible:ring-destructive"
                          : ""
                      }
                      {...register("end_date", {
                        required: "End date is required",
                        validate: (value) => {
                          if(!value) return "End date is required"
                          if (!startDate) return true;
                          return (
                            new Date(value) >= new Date(startDate) ||
                            "Cannot be before start date"
                          );
                        },
                      })}
                    />
                    {errors.end_date && (
                      <p className="text-[0.8rem] font-medium text-destructive">
                        {errors.end_date.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Briefly describe the purpose of this trip..."
                    className="resize-none"
                    {...register("description", {
                      maxLength: {
                        value: 500,
                        message: "Description too long (max 500 chars)",
                      },
                    })}
                  />
                  {errors.description && (
                    <p className="text-[0.8rem] font-medium text-destructive">
                      {errors.description.message}
                    </p>
                  )}
                </div>
              </div>

              <DialogFooter className="gap-2 sm:gap-0">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setCreateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={createTravel.isPending}>
                  {createTravel.isPending ? "Saving..." : "Create Travel Plan"}
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
              <CardTitle>My Travels</CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {getMyTravelsQuery.isLoading && (
            <div className="flex justify-center py-6">
              <Spinner />
            </div>
          )}

          {getMyTravelsQuery.isError && (
            <p className="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
              {getErrorMessage(getMyTravelsQuery.error)}
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

      {permissions?.some((permission) => permission === "PER001") && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>All Travels</CardTitle>
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

            {Boolean(allItems?.length) && (
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
                    {allItems?.map((travel, id) => {
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
      )}
    </div>
  );
};
