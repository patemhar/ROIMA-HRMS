import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  Users,
  Phone,
  User,
  Plus,
  Wallet,
  Receipt,
} from "lucide-react";
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
import { toast } from "react-toastify";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { DateTimeDisplay } from "@/utils/dateUtils";

export const TravelDetail = () => {
  const { id: travelId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [itineraryDialogOpen, setItineraryDialogOpen] =
    useState<boolean>(false);
  const [expenseDialogOpen, setExpenseDialogOpen] = useState<boolean>(false);

  const [approveMessage, setApproveMessage] = useState("");
  const [rejectMessage, setRejectMessage] = useState("");

  // Mutations
  const approveExpense = useApproveExpense();
  const rejectExpense = useRejectExpense();
  const addExpense = useAddExpense();
  const addItinerary = useAddItinerary();
  const travelDetailQuery = useTravelById(travelId!);

  // itinerary
  const {
    register: itineraryRegister,
    handleSubmit: itinerarySubmit,
    reset: resetItinerary,
    watch: watchItinerary,
    formState: { errors: itineraryErrors },
  } = useForm({
    mode: "onChange",
    defaultValues: {
      title: "",
      description: "",
      startDateTime: "",
      endDateTime: "",
      location: "",
    },
  });

  // expense 
  const {
    register: expenseRegister,
    handleSubmit: expenseSubmit,
    reset: resetExpense,
    formState: { errors: expenseErrors },
  } = useForm({
    mode: "onChange",
    defaultValues: {
      title: "",
      paid_by: "",
      expense_type: "",
      amount: 0,
      currency: "INR",
      expenseDate: "",
    },
  });

  const startDateTime = watchItinerary("startDateTime");

  // itinerary handler
  const onItinerarySubmit = async (data: any) => {
    try {
      if (!travelId) {
        toast.error("TravelId missing");
        return;
      }

      const response = await addItinerary.mutateAsync({ id: travelId, data });

      setSuccessMessage(response.message || "Itenerary added successfully");
      toast.success("Itinerary added!");

      setItineraryDialogOpen(false);

      resetItinerary();
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
      toast.error(getErrorMessage(error));
    }
  };

  // Handler for Expense
  const onExpenseSubmit = async (data: any) => {
    try {
      if (!travelId) {
        toast.error("TravelId missing");
        return;
      }

      const response = await addExpense.mutateAsync({ id: travelId, data });

      setSuccessMessage(response.message || "Expense recorded successfully!");
      toast.success(response.message || "Expense recorded successfully!");

      setExpenseDialogOpen(false);
      resetExpense();
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
      toast.error(getErrorMessage(error));
    }
  };

  // expense approval handler
  const handleApproveExpense = async (expenseId: string) => {
    try {
      const response = await approveExpense.mutateAsync({
        expenseId,
        data: approveMessage,
      });

      toast.success(response.message || "Expense approved successfully.");
      setSuccessMessage(response.message || "Expense Approved Successfully");
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  // reject expense handler
  const handleRejectExpense = async (expenseId: string) => {
    try {
      const response = await rejectExpense.mutateAsync({
        expenseId,
        data: rejectMessage,
      });

      toast.success(response.message || "Expense Rejected successfully.");
      setSuccessMessage(response.message || "Expense Rejected Successfully");
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  if (travelDetailQuery.isLoading) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold mb-2">
          Loading Travel Details for you!
          <Spinner />
        </h2>
      </div>
    );
  }

  if (travelDetailQuery.isError || !travelDetailQuery.data) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-destructive mb-2">
          Error Loading Travel
        </h2>
        <p className="text-muted-foreground mb-4">
          {travelDetailQuery.error
            ? getErrorMessage(travelDetailQuery.error)
            : "Travel not found or access denied."}
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
                onOpenChange={(open) => {
                  setItineraryDialogOpen(open);
                  if (!open) resetItinerary();
                }}
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

                  <form
                    onSubmit={itinerarySubmit(onItinerarySubmit)}
                    className="space-y-4 py-4"
                  >
                    <div className="grid gap-4">
                      <div className="grid grid-cols-2 gap-4">

                        <div className="space-y-2">
                          <Label htmlFor="title">Title *</Label>
                          <Input
                            id="title"
                            placeholder="Itinerary Title"
                            {...itineraryRegister("title", {
                              required: "Title is required",
                            })}
                          />
                          {itineraryErrors.title && (
                            <p className="text-sm text-destructive">
                              {itineraryErrors.title.message as string}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="description">Description *</Label>
                          <Input
                            id="description"
                            placeholder="Short description"
                            {...itineraryRegister("description", {
                              required: "Description is required",
                            })}
                          />
                          {itineraryErrors.description && (
                            <p className="text-sm text-destructive">
                              {itineraryErrors.description.message as string}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="startDateTime">Start Date Time *</Label>
                        <Input
                          id="startDateTime"
                          type="datetime-local"
                          {...itineraryRegister("startDateTime", {
                            required: "Start time is required",
                          })}
                        />
                        {itineraryErrors.startDateTime && (
                          <p className="text-sm text-destructive">
                            {itineraryErrors.startDateTime.message as string}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="endDateTime">End Date Time *</Label>
                        <Input
                          id="endDateTime"
                          type="datetime-local"
                          {...itineraryRegister("endDateTime", {
                            required: "End time is required",
                            validate: (value) => {
                              if (!startDateTime) return true;
                              return (
                                new Date(value) > new Date(startDateTime) ||
                                "End time must be after start time"
                              );
                            },
                          })}
                        />
                        {itineraryErrors.endDateTime && (
                          <p className="text-sm text-destructive">
                            {itineraryErrors.endDateTime.message as string}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="location">Location *</Label>
                        <Input
                          id="location"
                          placeholder="Meeting point or address"
                          {...itineraryRegister("location", {
                            required: "Location is required",
                          })}
                        />
                        {itineraryErrors.location && (
                          <p className="text-sm text-destructive">
                            {itineraryErrors.location.message as string}
                          </p>
                        )}
                      </div>
                    </div>

                    <DialogFooter className="mt-6">
                      <Button
                        variant="outline"
                        type="button"
                        onClick={() => setItineraryDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" disabled={addItinerary.isPending}>
                        {addItinerary.isPending
                          ? "Creating..."
                          : "Create Itinerary"}
                      </Button>
                    </DialogFooter>
                  </form>
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
                      {DateTimeDisplay(entry.startDateTime || "")} →{" "}
                      {DateTimeDisplay(entry.endDateTime || "")}
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

          <Dialog
            open={expenseDialogOpen}
            onOpenChange={(open) => {
              setExpenseDialogOpen(open);
              if (!open) resetExpense();
            }}
          >
            <DialogTrigger asChild>
              <Button variant="outline" className="bg-black text-white">
                Add Expense
              </Button>
            </DialogTrigger>

            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add Expense</DialogTitle>
                <DialogDescription>
                  Enter expense details for this travel.
                </DialogDescription>
              </DialogHeader>

              {/* Use expenseSubmit wrapper here */}
              <form
                onSubmit={expenseSubmit(onExpenseSubmit)}
                className="space-y-5 py-4"
              >
                <div className="grid gap-4">
                  {/* Title */}
                  <div className="space-y-2">
                    <Label htmlFor="expense-title">Title *</Label>
                    <Input
                      id="expense-title"
                      placeholder="e.g., Dinner with client"
                      className={
                        expenseErrors.title ? "border-destructive" : ""
                      }
                      {...expenseRegister("title", {
                        required: "Title is required",
                      })}
                    />
                    {expenseErrors.title && (
                      <p className="text-sm text-destructive">
                        {expenseErrors.title.message as string}
                      </p>
                    )}
                  </div>

                  {/* Paid By */}
                  <div className="space-y-2">
                    <Label htmlFor="paid_by">Paid By *</Label>
                    <Input
                      id="paid_by"
                      placeholder="Name of employee"
                      {...expenseRegister("paid_by", {
                        required: "Who paid for this?",
                      })}
                    />
                    {expenseErrors.paid_by && (
                      <p className="text-sm text-destructive">
                        {expenseErrors.paid_by.message as string}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Expense Type *</Label>
                    <select
                      className={`w-full border rounded-md h-10 px-2 bg-background ${expenseErrors.expense_type ? "border-destructive" : ""}`}
                      {...expenseRegister("expense_type", {
                        required: "Please select a type",
                      })}
                    >
                      <option value="">Select type</option>
                      <option value="TRANSPORTATION">Transportation</option>
                      <option value="ACCOMMODATION">Accommodation</option>
                      <option value="MEALS">Meals</option>
                      <option value="ENTERTAINMENT">Entertainment</option>
                    </select>
                    {expenseErrors.expense_type && (
                      <p className="text-sm text-destructive">
                        {expenseErrors.expense_type.message as string}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Amount *</Label>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        {...expenseRegister("amount", {
                          valueAsNumber: true,
                          required: "Amount is required",
                          min: {
                            value: 0.01,
                            message: "Amount must be greater than 0",
                          },
                        })}
                      />
                      {expenseErrors.amount && (
                        <p className="text-sm text-destructive">
                          {expenseErrors.amount.message as string}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Currency *</Label>
                      <Input
                        placeholder="INR, USD, etc."
                        {...expenseRegister("currency", {
                          required: "Currency is required",
                        })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Expense Date *</Label>
                    <Input
                      type="date"
                      {...expenseRegister("expenseDate", {
                        required: "Date is required",
                      })}
                    />
                    {expenseErrors.expenseDate && (
                      <p className="text-sm text-destructive">
                        {expenseErrors.expenseDate.message as string}
                      </p>
                    )}
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
                  <Button type="submit" disabled={addExpense.isPending}>
                    {addExpense.isPending ? "Adding..." : "Add Expense"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5" />
                Expenses ({travel.expenses?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {travel.expenses && travel.expenses.length > 0 ? (
                <div className="space-y-4">
                  {travel.expenses.map((expense) => (
                    <div
                      key={expense.id}
                      className="flex flex-col md:flex-row md:items-center justify-between p-4 border rounded-xl bg-card hover:shadow-sm transition-shadow gap-4"
                    >
                      <div className="flex items-start gap-4">
                        <div className="mt-1 bg-primary/10 p-2 rounded-lg">
                          <Wallet className="h-5 w-5 text-primary" />
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-lg">
                              {expense.title}
                            </p>
                            <Badge
                              variant="secondary"
                              className="text-[10px] uppercase"
                            >
                              {expense.expense_type}
                            </Badge>
                            <Badge
                              variant={
                                expense.status === "APPROVED"
                                  ? "default"
                                  : expense.status === "REJECTED"
                                    ? "destructive"
                                    : "outline"
                              }
                              className="text-[10px]"
                            >
                              {expense.status || "PENDING"}
                            </Badge>
                          </div>

                          {expense.description && (
                            <p className="text-sm text-muted-foreground">
                              {expense.description}
                            </p>
                          )}

                          <div className="grid grid-cols-2 gap-x-4 gap-y-1 pt-2 text-xs">
                            <p>
                              <span className="text-muted-foreground">
                                Amount:
                              </span>{" "}
                              <span className="font-medium text-foreground">
                                {expense.amount} {expense.currency}
                              </span>
                            </p>
                            <p>
                              <span className="text-muted-foreground">
                                Date:
                              </span>{" "}
                              <span className="font-medium text-foreground">
                                {expense.expenseDate}
                              </span>
                            </p>
                            <p>
                              <span className="text-muted-foreground">
                                Paid By:
                              </span>{" "}
                              <span className="font-medium text-foreground">
                                {expense.paid_by}
                              </span>
                            </p>
                            <p>
                              <span className="text-muted-foreground">
                                Action taken By:
                              </span>{" "}
                              <span
                                className={
                                  expense.approved_by
                                    ? "font-medium text-foreground"
                                    : "text-orange-500 italic"
                                }
                              >
                                {expense.approved_by || "Pending Approval"}
                              </span>
                            </p>
                          </div>

                          {expense.remark && (
                            <p className="text-xs bg-muted/50 p-2 rounded mt-2 border-l-2 border-primary/30">
                              <span className="font-semibold">Remark:</span>{" "}
                              {expense.remark}
                            </p>
                          )}
                        </div>
                      </div>

                      {expense.status == "SUBMITTED" && (
                        <div className="flex items-center gap-2 self-end md:self-center">
                          {/* Approvee */}
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-green-600 hover:bg-green-50"
                              >
                                Approve
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Approve Expense?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Add a message or remark for this approval.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <div className="space-y-2 py-2">
                                <Label htmlFor="approveMessage">
                                  Approval Message
                                </Label>
                                <Input
                                  id="approveMessage"
                                  placeholder="e.g., Valid travel expense"
                                  onChange={(e) =>
                                    setApproveMessage(e.target.value)
                                  }
                                />
                              </div>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() =>
                                    handleApproveExpense(expense.id || "")
                                  }
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  Confirm
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>

                          {/* Reject */}
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-destructive border-destructive/20 hover:bg-destructive/5"
                              >
                                Reject
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Reject Expense?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Please provide a reason for rejection.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <div className="space-y-2 py-2">
                                <Label htmlFor="rejectMessage">
                                  Reason for Rejection
                                </Label>
                                <Input
                                  id="rejectMessage"
                                  placeholder="e.g., Missing receipt"
                                  onChange={(e) =>
                                    setRejectMessage(e.target.value)
                                  }
                                />
                              </div>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() =>
                                    handleRejectExpense(expense.id || "")
                                  }
                                  className="bg-destructive hover:bg-destructive/90"
                                >
                                  Reject
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 border-2 border-dashed rounded-lg">
                  <p className="text-muted-foreground">
                    No expenses recorded for this trip.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
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

        </div>
      </div>
    </div>
  );
};
