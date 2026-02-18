import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, Users, Phone, User, Plus } from "lucide-react";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { getErrorMessage } from "@/utils/error";

type Schemas = components["schemas"];
type ApiResult<T> = Promise<ApiResponse<T>>;

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

import {
  useAddExpense,
  useAddItinerary,
  useApproveExpense,
  useRejectExpense,
  useTravelById,
} from "@/hooks/travel/travel.hooks";
import { useForm } from "react-hook-form";
import type { components } from "@/types/api";
import type { ApiResponse } from "@/types/http";
import { toast } from "react-toastify";

export const TravelDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [itineraryDialogOpen, setItineraryDialogOpen] =
    useState<boolean>(false);
  const [expenseDialogOpen, setExpenseDialogOpen] = useState<boolean>(false);

  // Mutations
  const approveExpense = useApproveExpense();
  const rejectExpense = useRejectExpense();
  const addExpense = useAddExpense();
  const addItinerary = useAddItinerary();
  const travelDetailQuery = useTravelById(id!);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    mode: "onBlur",
    defaultValues: {
      title: "",
      description: "",
      startDateTime: "",
      endDateTime: "",
      location: "",
    },
  });

  const {
    register: expenseRegister,
    handleSubmit: expenseSubmit,
    reset: resetExpense,
    formState: { errors: expenseErrors },
  } = useForm({
    mode: "onBlur",
    defaultValues: {
      title: "",
      paid_by: "",
      expense_type: undefined,
      amount: 0,
      currency: "",
      expenseDate: "",
    },
  });

  const handleAddItinerary = handleSubmit((data) => {
    if (!id) return;

    addItinerary.mutate(
      { id, data },
      {
        onSuccess: (response) => {
          resetExpense();
          toast.success(response.message);
          setItineraryDialogOpen(false);
        },
        onError: (err: any) => {
          toast.error(err.message);
        },
      }
    );
  });

  const handleAddExpense = expenseSubmit((data) => {
    if (!id) return;

    addExpense.mutate(
      { id, data },
      {
        onSuccess: (response) => {
          resetExpense();
          toast.success(response.message);
          setExpenseDialogOpen(false);
        },
        onError: (err: any) => {
          toast.error(err.message);
        },
      }
    );
  });

  const handleApproveExpense = (expenseId: string, data: string) => {
    approveExpense.mutate(
      { expenseId,  data},
      {
        onSuccess: () => {
          toast.success("Expense approved successfully.");
        },
        onError: (err: any) => {
          toast.error(err.message);
        },
      }
    );
  };

  const handleRejectExpense = (expenseId: string, data: string) => {
    rejectExpense.mutate(
      { expenseId, data },
      {
        onSuccess: () => {
          toast.success("Expense rejected successfully.");
        },
        onError: (err: any) => {
          toast.error(err.message);
        },
      }
    );
  };

  if (travelDetailQuery.isError || !travelDetailQuery.data) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-destructive mb-2">Error Loading Travel</h2>
        <p className="text-muted-foreground mb-4">
          {travelDetailQuery.error ? getErrorMessage(travelDetailQuery.error) : "Travel not found or access denied."}
        </p>
        <Button onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Go Back
        </Button>
      </div>
    );
  }

  const travel = travelDetailQuery.data;

  return (
    <div className="space-y-6">
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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-semibold">{travel.title}</h1>
            <p className="text-muted-foreground">Travel Details</p>
          </div>
        </div>
        <Badge variant="outline">{travel.status}</Badge>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Travel Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Travel Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    Title
                  </p>
                  <p className="text-lg font-semibold">{travel.title}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    Description
                  </p>
                  <p className="text-lg font-semibold">{travel.description}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    Destination
                  </p>
                  <p className="font-semibold">{travel.destination}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    Travel scheduled date
                  </p>
                  <div className="flex items-center gap-2">
                    {travel.start_date} - {travel.end_date}
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground  font-semibold">
                    Travel Status
                  </p>
                  <div className="flex items-center  font-semibold gap-2">
                    {travel.status}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Travel Itinerary */}
          <div className="space-y-3">
            <div className="flex justify-between">
              <p className="text-sm font-medium">Travel Itinerary</p>
              <Dialog
                open={itineraryDialogOpen}
                onOpenChange={setItineraryDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Itinerary
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Create Itinerary</DialogTitle>
                    <DialogDescription>
                      Fill in the details to create a new job Itinerary.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="title">Title</Label>  
                        <Input
                          id="title"
                          autoComplete="given-name"
                          aria-invalid={Boolean(errors.title)}
                          {...register("title", {
                            required: "Title name is required",
                          })}
                        />
                        {errors.title && (
                          <p className="text-sm text-destructive">
                            {errors.title.message}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Input
                          id="description"
                          aria-invalid={Boolean(errors.description)}
                          {...register("description", {
                            required: "description is required",
                          })}
                        />
                        {errors.description && (
                          <p className="text-sm text-destructive">
                            {errors.description.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="startDate">Start Date Time</Label>
                      <Input
                        id="startDate"
                        type="datetime-local"
                        autoComplete="email"
                        aria-invalid={Boolean(errors.startDateTime)}
                        {...register("startDateTime", {
                          required: "StartDateTime is required",
                        })}
                      />
                      {errors.startDateTime && (
                        <p className="text-sm text-destructive">
                          {errors.startDateTime.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="endDateTime">End Date Time </Label>
                      <Input
                        id="endDateTime"
                        type="datetime-local"
                        autoComplete="email"
                        aria-invalid={Boolean(errors.startDateTime)}
                        {...register("endDateTime", {
                          required: "EndDateTime is required",
                        })}
                      />
                      {errors.startDateTime && (
                        <p className="text-sm text-destructive">
                          {errors.endDateTime?.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="location">Location</Label>
                        <Input
                          id="location"
                          aria-invalid={Boolean(errors.location)}
                          {...register("location", {
                            required: "location is required",
                          })}
                        />
                        {errors.description && (
                          <p className="text-sm text-destructive">
                            {errors.location?.message}
                          </p>
                        )}
                      </div>
                  </div>

                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setItineraryDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={
                        addItinerary.isPending
                      }
                    >
                      {addItinerary.isPending
                        ? "Creating..."
                        : "Create Position"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            {travel.itineraries?.length === 0 && (
              <p className="text-muted-foreground text-sm">
                No itinerary added yet.
              </p>
            )}
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {travel.itineraries?.map((entry) => (
                <div
                  key={entry?.itineraryId}
                  className="rounded-lg border border-slate-200 bg-white/80 px-4 py-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="text-sm font-bold">{entry.title}</div>
                    <div className="text-muted-foreground">
                      {entry.description}
                    </div>
                    <div className="font-medium text-sm">
                      {entry.startDateTime} →{entry.endDateTime}
                    </div>
                    <span className="text-xs text-medium">
                      {entry.location}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Bookings ({travel.travel_bookings?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {travel.travel_bookings && travel.travel_bookings.length > 0 ? (
                <div className="space-y-3">
                  {travel.travel_bookings.map((booking) => (
                    <div
                      key={booking.booking_id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <User className="h-8 w-8 text-muted-foreground" />
                        <div>
                          <p className="font-medium">
                            ID: {booking.booking_id}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Type: {booking.bookingType}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Amount: {booking.amount} - {booking.currency}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Time: {booking.start_dateTime} -{" "}
                            {booking.end_dateTime}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Provider: {booking.provider_name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Booking Refrence: {booking.booking_reference}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No Bookings</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <Collapsible>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Travel Documents ({travel.travelDocument?.length || 0})
                  </div>

                  <CollapsibleTrigger>Show documents</CollapsibleTrigger>
                </CardTitle>
              </CardHeader>
              <CollapsibleContent>
                <CardContent>
                  {travel.travelDocument && travel.travelDocument.length > 0 ? (
                    <div className="space-y-3 mt-5 grid lg:grid-cols-2 gap-3">
                      {travel.travelDocument.map((travelDoc) => (
                        <Card
                          className="relative mx-auto w-full max-w-sm pt-0"
                          key={travelDoc.id}
                        >
                          <a
                            href={travelDoc.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <div className="absolute inset-0 z-30 object-cover" />
                            <img
                              src={travelDoc.fileUrl}
                              alt="document cover"
                              className="relative aspect-video w-full object-cover brightness-95 rounded-t-xl"
                            />
                          </a>
                          <CardHeader>
                            <CardContent>
                              <div className="flex flex-col gap-2">
                                <div>
                                  <Label
                                    htmlFor="createdBy"
                                    className="text-muted-foreground text-sm"
                                  >
                                    Uploaded By:
                                  </Label>
                                  <p
                                    id="createdBy"
                                    className="text-black font-semibold"
                                  >
                                    {travelDoc.uploadedBy}
                                  </p>
                                </div>
                                <div>
                                  <Label
                                    htmlFor="createdAt"
                                    className="text-muted-foreground text-sm"
                                  >
                                    Uploaded At:
                                  </Label>
                                  <p
                                    id="createdBy"
                                    className="text-black font-semibold"
                                  >
                                    {travelDoc.uploadedAt}
                                  </p>
                                </div>
                              </div>
                            </CardContent>
                          </CardHeader>
                        </Card>

                        // <div
                        //   key={travelDoc.id}
                        //   className="flex items-center justify-between p-3 border rounded-lg gap-6"
                        // >
                        //   <img src={travelDoc.fileUrl} className="max-w-50 max-h-30"/>

                        //   <div className="flex flex-col gap-5">
                        //     <div>
                        //       <Label htmlFor="uploadedBy">Uploaded By</Label>
                        //       <p id="uploadedBy">{travelDoc.uploadedBy}</p>
                        //     </div>
                        //     <div>
                        //       <Label htmlFor="uploadedAt">Uploaded At</Label>
                        //       <p id="uploadedAt">{travelDoc.uploadedAt}</p>
                        //     </div>
                        //   </div>
                        // </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No Bookings</p>
                  )}
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>

          <Dialog open={expenseDialogOpen} onOpenChange={setExpenseDialogOpen}>
            <DialogTrigger asChild>
              <Button>Add Expense</Button>
            </DialogTrigger>

            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add Expense</DialogTitle>
                <DialogDescription>
                  Enter expense details for this travel.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={() => handleAddExpense()}>
                <div className="grid gap-4 py-4">

                  {/* Title */}
                  <div className="space-y-2">
                    <Label>Title</Label>
                    <Input {...register("title", { required: true })} />
                    {errors.title && (
                      <p className="text-sm text-destructive">
                        Title is required
                      </p>
                    )}
                  </div>

                  {/* Paid By */}
                  <div className="space-y-2">
                    <Label>Paid By</Label>
                    <Input {...expenseRegister("paid_by")} />
                  </div>

                  {/* Expense Type */}
                  <div className="space-y-2">
                    <Label>Expense Type</Label>
                    <select
                      className="w-full border rounded-md h-10 px-2"
                      {...expenseRegister("expense_type", { required: true })}
                    >
                      <option value="">Select type</option>
                      <option value="TRANSPORTATION">Transportation</option>
                      <option value="ACCOMMODATION">Accommodation</option>
                      <option value="MEALS">Meals</option>
                      <option value="ENTERTAINMENT">Entertainment</option>
                    </select>
                  </div>

                  {/* Amount + Currency */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Amount</Label>
                      <Input
                        type="number"
                        step="0.01"
                        {...expenseRegister("amount", {
                          valueAsNumber: true,
                          required: true
                        })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Currency</Label>
                      <Input {...expenseRegister("currency")} />
                    </div>
                  </div>

                  {/* Expense Date */}
                  <div className="space-y-2">
                    <Label>Expense Date</Label>
                    <Input
                      type="date"
                      {...expenseRegister("expenseDate", { required: true })}
                    />
                  </div>

                </div>

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setExpenseDialogOpen(false)}
                  >
                    Cancel
                  </Button>

                  <Button
                    type="submit"
                    disabled={addExpense.isPending}
                  >
                    {addExpense.isPending ? "Adding..." : "Add Expense"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Expenses ({travel.expenses?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {travel.expenses && travel.expenses.length > 0 ? (
                <div className="space-y-3">
                  {travel.expenses.map((expense) => (
                    <div
                      key={expense.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <User className="h-8 w-8 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{expense.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {expense.description}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {expense.amount} - {expense.currency}
                          </p>
                          <p className="font-medium">{expense.expense_type}</p>
                          <p className="text-sm text-muted-foreground">
                            {expense.expenseDate}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {expense.paid_by}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {expense.approved_by}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No Members</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Scheduled By */}
          <Card>
            <CardHeader>
              <CardTitle>Created By</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-medium text-muted-foreground">
                {travel.created_by} - {travel.created_by_name}
              </p>
            </CardContent>
          </Card>

          {/* Travel Members */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Travel Members ({travel.travelMembers?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {travel.travelMembers && travel.travelMembers.length > 0 ? (
                <div className="space-y-3">
                  {travel.travelMembers.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <User className="h-8 w-8 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{member.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {member.role}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {member.email}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No Members</p>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
        </div>
      </div>
    </div>
  );
};
