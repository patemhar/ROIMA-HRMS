import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  useDeleteTravel,
  useGetAllTravels,
  useGetMyTravels,
} from "@/hooks/travel/travel.hooks";
import { getErrorMessage } from "@/utils/error";
import { use, useEffect, useState } from "react";
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
import { hasPermission, PermissionCode } from "@/constants/permissions";
import { SkeletonTable } from "@/components/SkeletonTable";
import { useDebounce } from "@/hooks/useDebounce";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Schemas = components["schemas"];

const getBadgeVarient = ( s?: string )=> {
  switch (s) {
    case "ONGOING":
      return "warning";
    case "PLANNED":
      return "primary";
    case "COMPLETED":
      return "success";
    case "CANCELLED":
      return "destructive";
    default:
      return "outline";
  }
};

export const Travel = () => {
  const [myPageNumber, setMyPageNumber] = useState<number>(1);
  const [myPageSize, setMyPageSize] = useState<number>(10);
  const [mySearchTerm, setMySearchTerm] = useState<string>("");

  const [allPageNumber, setAllPageNumber] = useState<number>(1);
  const [allPageSize, setAllPageSize] = useState<number>(10);
  const [allSearchTerm, setAllSearchTerm] = useState<string>("");

  const { user } = useAuth((state) => state.auth);
  const permissions = user?.permission;
  const userRole = user?.role;

  const canReadTravel = hasPermission(
    permissions,
    PermissionCode.READ_ALL_TRAVELS,
  );
  const canCreateTravel = hasPermission(
    permissions,
    PermissionCode.TRAVEL_MANAGE,
  );

  const isAdmin = canReadTravel;
  const isHR = userRole === "HR";

  const mysearchTermDebounced = useDebounce(mySearchTerm, 500);
  const allsearchTermDebounced = useDebounce(allSearchTerm, 500);

  const getAllTravelsquery = useGetAllTravels(
    allPageNumber,
    allPageSize,
    allsearchTermDebounced,
    !!isAdmin,
  );

  const getMyTravelsQuery = useGetMyTravels(
    myPageNumber,
    myPageSize,
    mysearchTermDebounced,
  );

  useEffect(() => {
    setMyPageNumber(1);
  }, [mySearchTerm]);

  useEffect(() => {
    setAllPageNumber(1);
  }, [allSearchTerm]);

  const allItems = getAllTravelsquery.data?.content ?? [];

  const navigate = useNavigate();

  const [createDialogOpen, setCreateDialogOpen] = useState<boolean>(false);

  const createTravel = useCreateTravel();
  const deleteTravel = useDeleteTravel();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
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

  const handleDelete = (id?: string) => {
    if (!id) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete this travel plan?",
    );

    try {
      if (confirmed) {
        deleteTravel.mutate(id);

        toast.success("Travel plan deleted successfully.");
      } else {
        toast.info("Deletion cancelled.");
      }
    } catch (error) {
      toast.error(getErrorMessage(error));
      console.error("Failed to delete travel plan", error);
    }
  };

  const items = getMyTravelsQuery.data?.content ?? [];

  const handleRowClick = (id?: string) => {
    if (!id) return;
    navigate(`${id}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between flex-wrap items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Travel Plans</h1>
          <p className="text-muted-foreground mt-1">
            View and manage your travel plans
          </p>
        </div>
        <div className="flex justify-end gap-2 items-center">
          {canCreateTravel && (
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

              <DialogContent className="sm:max-w-131.25 max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create Travel Plan</DialogTitle>
                  <DialogDescription>
                    Enter the details of your upcoming trip. All fields marked
                    with * are required.
                  </DialogDescription>
                </DialogHeader>

                <form
                  onSubmit={handleSubmit(onSubmit)}
                  className="space-y-6 pt-4"
                >
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
                        placeholder="e.g. Client Visit"
                        className={
                          errors.title
                            ? "border-destructive focus-visible:ring-destructive"
                            : ""
                        }
                        {...register("title", {
                          required: "A catchy title is required",
                          minLength: {
                            value: 5,
                            message: "Title must be at least 5 characters",
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
                              if (!value) return "Start date is required";

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
                              if (!value) return "End date is required";
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
                        placeholder="Briefly describe the purpoose of this trip..."
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
                      {createTravel.isPending
                        ? "Saving..."
                        : "Create Travel Plan"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          )}

          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  getAllTravelsquery.refetch();
                  getMyTravelsQuery.refetch();
                }}
              >
                Refresh
              </Button>
            </div>
          </div>
        </div>
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
          <div className="flex justify-between flex-wrap items-center gap-4">
            <Input
              placeholder="Search travels..."
              value={mySearchTerm}
              onChange={(e) => setMySearchTerm(e.target.value)}
              className="max-w-4xl"
            />

            <div className="flex items-center gap-2">
              <Label
                htmlFor="myPageSize"
                className="text-xs text-muted-foreground"
              >
                Per page:
              </Label>
              <Select
                value={String(myPageSize)}
                onValueChange={(value) => {
                  setMyPageSize(Number(value));
                  setMyPageNumber(1);
                }}
              >
                <SelectTrigger id="myPageSize" className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-emerald-50">
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200">
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
                {getMyTravelsQuery.isLoading && (
                  <TableRow>
                    <TableCell colSpan={8}>
                      <SkeletonTable />
                    </TableCell>
                  </TableRow>
                )}

                {getMyTravelsQuery.isError && (
                  <TableRow>
                    <TableCell colSpan={8}>
                      <p className="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
                        {getErrorMessage(getMyTravelsQuery.error)}
                      </p>
                    </TableCell>
                  </TableRow>
                )}

                {!getMyTravelsQuery.isLoading &&
                  !getMyTravelsQuery.isError &&
                  items.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">
                        <p className="text-muted-foreground">
                          No travel records found
                        </p>
                      </TableCell>
                    </TableRow>
                  )}

                {items.map((travel, id) => {
                  return (
                    <TableRow
                      key={travel?.id ?? `${travel.title ?? "candidate"}-${id}`}
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
                        <Badge variant={getBadgeVarient(travel.status)}>
                          {travel.status}
                        </Badge>
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
                        {isHR && (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(travel?.id)}
                            className="cursor-pointer"
                          >
                            Delete
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>

        {getMyTravelsQuery.data && (
          <CardContent className="pt-0">
            <div className="flex items-center justify-between border-t pt-4">
              <div className="text-sm text-muted-foreground">
                Showing {items.length} of {getMyTravelsQuery.data.totalElements}{" "}
                travel items
                {getMyTravelsQuery.data.totalPages! > 1 && (
                  <span className="ml-2">
                    (Page {getMyTravelsQuery.data.pageable?.pageNumber! + 1} of{" "}
                    {getMyTravelsQuery.data.totalPages})
                  </span>
                )}
              </div>
              {getMyTravelsQuery.data.totalPages! > 1 && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setMyPageNumber(myPageNumber - 1)}
                    disabled={getMyTravelsQuery.data?.first}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setMyPageNumber(myPageNumber + 1)}
                    disabled={getMyTravelsQuery.data?.last}
                  >
                    Next
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        )}
      </Card>

      {canReadTravel && userRole !== "EMPLOYEE" && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>All Travels</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between flex-wrap items-center gap-4">
              <Input
                placeholder="Search travels..."
                value={allSearchTerm}
                onChange={(e) => setAllSearchTerm(e.target.value)}
                className="max-w-4xl"
              />

              <div className="flex items-center gap-2">
                <Label
                  htmlFor="allPageSize"
                  className="text-xs text-muted-foreground"
                >
                  Per page:
                </Label>
                <Select
                  value={String(allPageSize)}
                  onValueChange={(value) => {
                    setAllPageSize(Number(value));
                    setAllPageNumber(1);
                  }}
                >
                  <SelectTrigger id="allPageSize" className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-emerald-50">
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="rounded-lg border border-slate-200">
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
                  {getAllTravelsquery.isLoading && (
                    <TableRow>
                      <TableCell colSpan={8}>
                        <SkeletonTable />
                      </TableCell>
                    </TableRow>
                  )}

                  {getAllTravelsquery.isError && (
                    <TableRow>
                      <TableCell colSpan={8}>
                        <p className="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
                          {getErrorMessage(getAllTravelsquery.error)}
                        </p>
                      </TableCell>
                    </TableRow>
                  )}

                  {!getAllTravelsquery.isLoading &&
                    !getAllTravelsquery.isError &&
                    allItems.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8">
                          <p className="text-muted-foreground">
                            No travel records found
                          </p>
                        </TableCell>
                      </TableRow>
                    )}

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
                          <Badge variant={getBadgeVarient(travel.status)}>
                            {travel.status}
                          </Badge>
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
                          {isHR && (
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDelete(travel?.id)}
                              className="cursor-pointer"
                            >
                              Delete
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>

          {getAllTravelsquery.data && (
            <CardContent className="pt-0">
              <div className="flex items-center justify-between border-t pt-4">
                <div className="text-sm text-muted-foreground">
                  Showing {allItems.length} of{" "}
                  {getAllTravelsquery.data.totalElements} travel items
                  {getAllTravelsquery.data.totalPages! > 1 && (
                    <span className="ml-2">
                      (Page {getAllTravelsquery.data.pageable?.pageNumber! + 1}{" "}
                      of {getAllTravelsquery.data.totalPages})
                    </span>
                  )}
                </div>
                {getAllTravelsquery.data.totalPages! > 1 && (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setAllPageNumber(allPageNumber - 1)}
                      disabled={getAllTravelsquery.data?.first}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setAllPageNumber(allPageNumber + 1)}
                      disabled={getAllTravelsquery.data?.last}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          )}
        </Card>
      )}
    </div>
  );
};
