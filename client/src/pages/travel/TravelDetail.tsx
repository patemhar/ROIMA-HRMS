import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  Users,
  User,
  Plus,
  Upload,
  Trash2,
  Pen,
  MoreHorizontal,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  useAddBooking,
  useAddItinerary,
  useAddMember,
  useDeleteMember,
  useTravelById,
  useUpdateItinerary,
  useUpdateTravel,
  useUploadTravelDocs,
  useDeleteTravelDocument,
  useUpdateBooking,
  useDeleteBooking,
  useCancelTravel,
} from "@/hooks/travel/travel.hooks";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
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
import { useAuth } from "@/store";
import { hasPermission, PermissionCode } from "@/constants/permissions";
import { useGetAllUsers } from "@/hooks/util/util.hooks";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { components } from "@/types/api"; 
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

type Schemas = components["schemas"];
type bookingResponse = Schemas["TravelBookingResponse"]

export const TravelDetail = () => {
  const permissions = useAuth((state) => state.auth.user?.permission);
  const user = useAuth((state) => state.auth.user);
  const isHR = user?.role === "HR";

  const canUpdateTravel = hasPermission(
    permissions,
    PermissionCode.TRAVEL_MANAGE,
  );

  const { id: travelId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [itineraryDialogOpen, setItineraryDialogOpen] =
    useState<boolean>(false);
  const [bookingDialogOpen, setBookingDialogOpen] = useState<boolean>(false);
  const [updateBookingDialogOpen, setUpdateBookingDialogOpen] = useState<boolean>(false);
  const [documentUploadOpen, setDocumentUploadOpen] = useState<boolean>(false);
  const [updateTravelDialogOpen, setUpdateTravelDialogOpen] =
    useState<boolean>(false);
  const [addMemberDialogOpen, setAddMemberDialogOpen] =
    useState<boolean>(false);
  const [updateItineraryDialogOpen, setUpdateItineraryDialogOpen] =
    useState<boolean>(false);
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);

  const [selectedItinerary, setSelectedItinerary] = useState<any>(null);

  // Mutations
  const addItinerary = useAddItinerary();
  const addBooking = useAddBooking();
  const addMember = useAddMember();
  const deleteMember = useDeleteMember();
  const updateTravel = useUpdateTravel();
  const updateItinerary = useUpdateItinerary();
  const updateBooking = useUpdateBooking();
  const deleteBooking = useDeleteBooking();
  const cancelTravel = useCancelTravel();

  const travelDetailQuery = useTravelById(travelId!);
  const uploadTravelDocs = useUploadTravelDocs(travelId!);
  const deleteTravelDocument = useDeleteTravelDocument();

  const users = useGetAllUsers().data || [];

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

  //booking
  const {
    register: bookingRegister,
    handleSubmit: bookingSubmit,
    reset: bookingReset,
    control: bookingControl,
    formState: { errors: bookingErrors },
  } = useForm({
    mode: "onChange",
    defaultValues: {
      bookingType: "OTHER",
      provider_name: "",
      booking_reference: "",
      amount: 0,
      currency: "",
      start_dateTime: "",
      end_dateTime: "",
    },
  });

  // update booking
  const {
    register: updateBookingRegister,
    handleSubmit: updateBookingSubmit,
    reset: resetUpdateBooking,
    setValue: setUpdateBookingValue,
    control: updateControl,
    formState: { errors: updateBookingErrors },
  } = useForm({
    mode: "onChange",
    defaultValues: {
      bookingType: "OTHER",
      provider_name: "",
      booking_reference: "",
      amount: 0,
      currency: "",
      start_dateTime: "",
      end_dateTime: "",
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

  // booking handler
  const onBookingSubmit = async (data: any) => {
    try {
      if (!travelId) {
        toast.error("TravelId missing");
        return;
      }

      const response = await addBooking.mutateAsync({ id: travelId, data: { ...data, travel_id: travelId } });

      setSuccessMessage(response.message || "Booking added successfully!");
      toast.success(response.message || "Booking added successfully!");

      setBookingDialogOpen(false);
      bookingReset();
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
      toast.error(getErrorMessage(error));
    }
  };

  const handleBookingUpdateDialogOpen = (booking: bookingResponse) => {
    setUpdateBookingDialogOpen(true);
    resetUpdateBooking();
    setUpdateBookingValue("bookingType", booking.bookingType!);
    setUpdateBookingValue("provider_name", booking.provider_name!);
    setUpdateBookingValue("booking_reference", booking.booking_reference!);
    setUpdateBookingValue("amount", booking.amount!);
    setUpdateBookingValue("currency", booking.currency!);
    setUpdateBookingValue("start_dateTime", booking.start_dateTime!);
    setUpdateBookingValue("end_dateTime", booking.end_dateTime!);
  };

  const onUpdateBookingSubmit = async (data: any, bookingId: string) => {
    try {
      if (!travelId) {
        toast.error("TravelId missing");
        return;
      }

      const response = await updateBooking.mutateAsync({ 
        travelId: travelId!, bookingId, 
        data: { 
          travel_id: travelId!,
          bookingType: data.bookingType || null,
          provider_name: data.provider_name || null,
          booking_reference: data.booking_reference || null,
          amount: data.amount || null,
          currency: data.currency || null,
          start_dateTime: data.start_dateTime || null,
          end_dateTime: data.end_dateTime || null,
        } 
      });

      setSuccessMessage(response.message || "Booking updated successfully!");
      toast.success(response.message || "Booking updated successfully!");

      setUpdateBookingDialogOpen(false);
      resetUpdateBooking();
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
      toast.error(getErrorMessage(error));
    }
  };

  const handleDeleteBooking = async (bookingId: string) => {

    const confirmed = window.confirm("Are you sure you want to delete this booking? This action cannot be undone.");
    if (!confirmed) return;

    try {

      if (!travelId) {
        toast.error("TravelId missing");
        return;
      }

      const response = await deleteBooking.mutateAsync({ travelId, bookingId });

      setSuccessMessage(response.message || "Booking deleted successfully!");
      toast.success(response.message || "Booking deleted successfully!");
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
      toast.error(getErrorMessage(error));
    }
  };

  // document upload handler
  const handleDocumentUpload = async () => {
    if (uploadFiles.length === 0) {
      toast.error("Please select at least one file");
      return;
    }

    try {
      await uploadTravelDocs.mutateAsync(uploadFiles);
      toast.success("Documents uploaded successfully");
      setSuccessMessage("Documents uploaded successfully");
      setDocumentUploadOpen(false);
      setUploadFiles([]);
      travelDetailQuery.refetch();
    } catch (error) {
      const errorMsg = getErrorMessage(error);
      toast.error(errorMsg);
      setErrorMessage(errorMsg);
    }
  };

  // update travel form
  const {
    register: updateTravelRegister,
    handleSubmit: updateTravelSubmit,
    reset: resetUpdateTravel,
    setValue: setUpdateTravelValue,
    formState: { errors: updateTravelErrors },
  } = useForm({
    mode: "onChange",
    defaultValues: {
      title: "",
      description: "",
      destination: "",
      start_date: "",
      end_date: "",
      allowance: 0,
    },
  });

  // add member form
  const {
    register: addMemberRegister,
    handleSubmit: addMemberSubmit,
    reset: resetAddMember,
    formState: { errors: addMemberErrors },
  } = useForm({
    mode: "onChange",
    defaultValues: {
      userId: "",
    },
  });

  // update itinerary form
  const {
    register: updateItineraryRegister,
    handleSubmit: updateItinerarySubmit,
    reset: resetUpdateItinerary,
    setValue: setUpdateItineraryValue,
    formState: { errors: updateItineraryErrors },
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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const fileArray = Array.from(files);
      const validFiles = fileArray.filter((file) => {
        if (file.size > 10 * 1024 * 1024) {
          toast.error(`${file.name} is too large (max 10MB)`);
          return false;
        }
        return true;
      });

      setUploadFiles((prev) => [...prev, ...validFiles]);
    }
  };

  const removeFile = (index: number) => {
    setUploadFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // update travel handler
  const onUpdateTravelSubmit = async (data: any) => {
    try {
      if (!travelId) {
        toast.error("TravelId missing");
        return;
      }

      await updateTravel.mutateAsync({ id: travelId, data });
      toast.success("Travel updated successfully");
      setUpdateTravelDialogOpen(false);
      resetUpdateTravel();
      travelDetailQuery.refetch();
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
      toast.error(getErrorMessage(error));
    }
  };

  const handleCancelTravel = async () => {  
    const confirmed = window.confirm("Are you sure you want to cancel this travel? This action cannot be undone.");
    if (!confirmed) return;

    try {
      if (!travelId) {
        toast.error("TravelId missing");
        return;
      }
      await cancelTravel.mutateAsync(travelId);
      toast.success("Travel cancelled successfully");
      setSuccessMessage("Travel cancelled successfully");
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
      toast.error(getErrorMessage(error));
    }
  };

  // add member handler
  const onAddMemberSubmit = async (data: any) => {
    try {
      if (!travelId) {
        toast.error("TravelId missing");
        return;
      }

      await addMember.mutateAsync({ travelId, userId: data.userId });
      toast.success("Member added successfully");
      setAddMemberDialogOpen(false);
      resetAddMember();
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
      toast.error(getErrorMessage(error));
    }
  };

  // update itinerary handler
  const onUpdateItinerarySubmit = async (data: any) => {
    try {
      if (!selectedItinerary) {
        toast.error("No itinerary selected");
        return;
      }

      await updateItinerary.mutateAsync({
        id: selectedItinerary.itineraryId,
        data,
      });
      toast.success("Itinerary updated successfully");
      setUpdateItineraryDialogOpen(false);
      resetUpdateItinerary();
      setSelectedItinerary(null);
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
      toast.error(getErrorMessage(error));
    }
  };

  // delete member handler
  const handleDeleteMember = async (memberId: string) => {
    try {
      await deleteMember.mutateAsync({ memberId, travelId: travelId! });
      toast.success("Member removed successfully");
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  // delete document handler
  const handleDeleteDocument = async (docId: string) => {
    try {
      await deleteTravelDocument.mutateAsync({ docId, travelId: travelId! });
      toast.success("Document deleted successfully");
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  // open update itinerary dialog
  const openUpdateItineraryDialog = (itinerary: any) => {
    setSelectedItinerary(itinerary);
    setUpdateItineraryValue("title", itinerary.title);
    setUpdateItineraryValue("description", itinerary.description);
    setUpdateItineraryValue("startDateTime", itinerary.startDateTime);
    setUpdateItineraryValue("endDateTime", itinerary.endDateTime);
    setUpdateItineraryValue("location", itinerary.location);
    setUpdateItineraryDialogOpen(true);
  };

  const getBadgeVarient = (s?: string): "default" | "secondary" | "outline" | "destructive" => {
    switch (s) {
      case "ONGOING":   return "default";
      case "PLANNED":   return "secondary";
      case "COMPLETED": return "outline";
      case "CANCELLED": return "destructive";
      default:          return "outline";
    }
  };

  if (travelDetailQuery.isLoading) {
    return (
      <div className="flex justify-center items-center gap-4 flex-col text-center">
        <h2 className="text-2xl font-semibold mb-2">
          Loading Travel Details for you!
        </h2>
        <Spinner />
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

  const travel = travelDetailQuery.data!;

  const isTravelMember = travel.travelMembers?.some(
    (member) => member.member_id === user?.id,
  );

  const isTravelPlanned = travel.status === "PLANNED";
  const canModifyTravel = canUpdateTravel && isTravelPlanned;
  const canModifyItinerary = isHR && isTravelPlanned;

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
            <h1 className="text-2xl font-semibold">{travel.title}</h1>
            <p className="text-muted-foreground text-base">Travel Details</p>
          </div>
        </div>
        <Badge variant={getBadgeVarient(travel.status)}>{travel.status}</Badge>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Travel Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-lg">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Travel Information
                </div>
                {canModifyTravel && (
                  <div className="flex items-center gap-2">
                    <Dialog
                      open={updateTravelDialogOpen}
                      onOpenChange={(open) => {
                        setUpdateTravelDialogOpen(open);
                        if (!open) resetUpdateTravel();
                        if (open) {
                          setUpdateTravelValue("title", travel?.title || "");
                          setUpdateTravelValue(
                            "description",
                            travel?.description || "",
                          );
                          setUpdateTravelValue(
                            "destination",
                            travel?.destination || "",
                          );
                          setUpdateTravelValue(
                            "start_date",
                            travel?.start_date || "",
                          );
                          setUpdateTravelValue(
                            "end_date",
                            travel?.end_date || "",
                          );
                        }
                      }}
                    >
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          Update Travel
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Update Travel</DialogTitle>
                          <DialogDescription>
                            Update travel details.
                          </DialogDescription>
                        </DialogHeader>

                        <form
                          onSubmit={updateTravelSubmit(onUpdateTravelSubmit)}
                          className="space-y-4 py-4"
                        >
                          <div className="grid gap-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="travel-title">Title</Label>
                                <Input
                                  id="travel-title"
                                  placeholder="Travel Title"
                                  {...updateTravelRegister("title")}
                                />
                                {updateTravelErrors.title && (
                                  <p className="text-sm text-destructive">
                                    {updateTravelErrors.title.message as string}
                                  </p>
                                )}
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="travel-destination">
                                  Destination
                                </Label>
                                <Input
                                  id="travel-destination"
                                  placeholder="Destination"
                                  {...updateTravelRegister("destination")}
                                />
                                {updateTravelErrors.destination && (
                                  <p className="text-sm text-destructive">
                                    {
                                      updateTravelErrors.destination
                                        .message as string
                                    }
                                  </p>
                                )}
                              </div>
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="travel-description">
                                Description
                              </Label>
                              <Input
                                id="travel-description"
                                placeholder="Travel description"
                                {...updateTravelRegister("description")}
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="travel-allowance">
                                Allowance per day
                              </Label>
                              <Input
                                id="travel-allowance"
                                placeholder="Allowance per day"
                                {...updateTravelRegister("allowance")}
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label>Start Date</Label>
                                <Input
                                  type="date"
                                  {...updateTravelRegister("start_date")}
                                />
                                {updateTravelErrors.start_date && (
                                  <p className="text-sm text-destructive">
                                    {
                                      updateTravelErrors.start_date
                                        .message as string
                                    }
                                  </p>
                                )}
                              </div>

                              <div className="space-y-2">
                                <Label>End Date</Label>
                                <Input
                                  type="date"
                                  {...updateTravelRegister("end_date")}
                                />
                                {updateTravelErrors.end_date && (
                                  <p className="text-sm text-destructive">
                                    {
                                      updateTravelErrors.end_date
                                        .message as string
                                    }
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>

                          <DialogFooter className="mt-6">
                            <Button 
                              variant="outline"
                              type="button"
                              onClick={() => resetUpdateTravel()}
                            >
                              Reset
                            </Button>
                            <Button
                              variant="outline"
                              type="button"
                              onClick={() => setUpdateTravelDialogOpen(false)}
                            >
                              Cancel
                            </Button>
                            <Button
                              type="submit"
                              disabled={updateTravel.isPending}
                            >
                              {updateTravel.isPending
                                ? "Updating..."
                                : "Update Travel"}
                            </Button>
                          </DialogFooter>
                        </form>
                      </DialogContent>
                    </Dialog>
                    {isTravelPlanned && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCancelTravel}
                      >
                        Cancel Travel
                      </Button>
                    )}
                  </div>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    Title
                  </p>
                  <p className="text-sm font-semibold">{travel.title}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    Description
                  </p>
                  <p className="text-sm font-semibold">{travel.description}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    Destination
                  </p>
                  <p className="text-sm font-semibold">{travel.destination}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    Travel scheduled date
                  </p>
                  <div className="text-sm font-semibold">
                    {travel.start_date} - {travel.end_date}
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    Travel Status
                  </p>
                  <div className="text-sm font-semibold">
                    {travel.status}
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    Max allowance per day
                  </p>
                  <div className="text-sm font-semibold">
                    {travel.allowance ? `${travel.allowance} INR` : "Not specified"}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Travel Itinerary */}
          <div className="space-y-3">
            <div className="flex justify-between">
              <p className="text-base font-medium">Travel Itinerary</p>
              {canModifyItinerary && (
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
                          <Label htmlFor="startDateTime">
                            Start Date Time *
                          </Label>
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
              )}

              {/* Update Itinerary Dialog */}
              {canModifyItinerary && (
                <Dialog
                  open={updateItineraryDialogOpen}
                  onOpenChange={(open) => {
                    setUpdateItineraryDialogOpen(open);
                    if (!open) {
                      resetUpdateItinerary();
                      setSelectedItinerary(null);
                    }
                  }}
                >
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Update Itinerary</DialogTitle>
                      <DialogDescription>
                        Update itinerary details.
                      </DialogDescription>
                    </DialogHeader>

                    <form
                      onSubmit={updateItinerarySubmit(onUpdateItinerarySubmit)}
                      className="space-y-4 py-4"
                    >
                      <div className="grid gap-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="update-title">Title *</Label>
                            <Input
                              id="update-title"
                              placeholder="Itinerary Title"
                              {...updateItineraryRegister("title", {
                                required: "Title is required",
                              })}
                            />
                            {updateItineraryErrors.title && (
                              <p className="text-sm text-destructive">
                                {updateItineraryErrors.title.message as string}
                              </p>
                            )}
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="update-description">
                              Description *
                            </Label>
                            <Input
                              id="update-description"
                              placeholder="Short description"
                              {...updateItineraryRegister("description", {
                                required: "Description is required",
                              })}
                            />
                            {updateItineraryErrors.description && (
                              <p className="text-sm text-destructive">
                                {
                                  updateItineraryErrors.description
                                    .message as string
                                }
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="update-startDateTime">
                            Start Date Time *
                          </Label>
                          <Input
                            id="update-startDateTime"
                            type="datetime-local"
                            {...updateItineraryRegister("startDateTime", {
                              required: "Start time is required",
                            })}
                          />
                          {updateItineraryErrors.startDateTime && (
                            <p className="text-sm text-destructive">
                              {
                                updateItineraryErrors.startDateTime
                                  .message as string
                              }
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="update-endDateTime">
                            End Date Time *
                          </Label>
                          <Input
                            id="update-endDateTime"
                            type="datetime-local"
                            {...updateItineraryRegister("endDateTime", {
                              required: "End time is required",
                            })}
                          />
                          {updateItineraryErrors.endDateTime && (
                            <p className="text-sm text-destructive">
                              {
                                updateItineraryErrors.endDateTime
                                  .message as string
                              }
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="update-location">Location *</Label>
                          <Input
                            id="update-location"
                            placeholder="Meeting point or address"
                            {...updateItineraryRegister("location", {
                              required: "Location is required",
                            })}
                          />
                          {updateItineraryErrors.location && (
                            <p className="text-sm text-destructive">
                              {updateItineraryErrors.location.message as string}
                            </p>
                          )}
                        </div>
                      </div>

                      <DialogFooter className="mt-6">
                        <Button
                          variant="outline"
                          type="button"
                          onClick={() => setUpdateItineraryDialogOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          disabled={updateItinerary.isPending}
                        >
                          {updateItinerary.isPending
                            ? "Updating..."
                            : "Update Itinerary"}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              )}
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
                    <div className="flex-1">
                      <div className="text-sm font-bold">{entry.title}</div>
                      <div className="text-muted-foreground text-sm">
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
                    {canModifyItinerary && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openUpdateItineraryDialog(entry)}
                      >
                        Update
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-lg">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Bookings ({travel.travel_bookings?.length || 0})
                </div>
                {canModifyTravel && (
                  // create booking dialog
                  <Dialog
                    open={bookingDialogOpen}
                    onOpenChange={(open) => {
                      setBookingDialogOpen(open);
                      if (!open) bookingReset();
                    }}
                  >
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Booking
                      </Button>
                    </DialogTrigger>

                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Add Booking</DialogTitle>
                        <DialogDescription>
                          Add booking details for this travel.
                        </DialogDescription>
                      </DialogHeader>

                      <form
                        onSubmit={bookingSubmit(onBookingSubmit)}
                        className="space-y-4 py-4"
                      >
                        <div className="grid gap-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Booking Type *</Label>

                              <Controller
                                name="bookingType"
                                control={bookingControl}
                                rules={{ required: "Please select a type" }}
                                render={({ field }) => (
                                  <Select value={field.value} onValueChange={field.onChange}>
                                    <SelectTrigger className={`w-full border rounded-md h-10 px-2 bg-background ${bookingErrors.bookingType ? "border-destructive" : ""}`}>
                                      <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="FLIGHT">Flight</SelectItem>
                                      <SelectItem value="HOTEL">Hotel</SelectItem>
                                      <SelectItem value="TRAIN">Train</SelectItem>
                                      <SelectItem value="BUS">Bus</SelectItem>
                                      <SelectItem value="CAB">Car Rental</SelectItem>
                                      <SelectItem value="OTHER">Other</SelectItem>
                                    </SelectContent>
                                  </Select>
                                )}
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="provider-name">
                                Provider Name *
                              </Label>
                              <Input
                                id="provider-name"
                                placeholder="e.g., Air India, Marriott"
                                {...bookingRegister("provider_name", {
                                  required: "Provider name is required",
                                })}
                              />
                              {bookingErrors.provider_name && (
                                <p className="text-sm text-destructive">
                                  {
                                    bookingErrors.provider_name
                                      .message as string
                                  }
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="booking-reference">
                              Booking Reference
                            </Label>
                            <Input
                              id="booking-reference"
                              placeholder="Booking confirmation number"
                              {...bookingRegister("booking_reference")}
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Amount *</Label>
                              <Input
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                {...bookingRegister("amount", {
                                  valueAsNumber: true,
                                  required: "Amount is required",
                                  min: {
                                    value: 0.01,
                                    message: "Amount must be greater than 0",
                                  },
                                })}
                              />
                              {bookingErrors.amount && (
                                <p className="text-sm text-destructive">
                                  {bookingErrors.amount.message as string}
                                </p>
                              )}
                            </div>

                            <div className="space-y-2">
                              <Label>Currency *</Label>
                              <Input
                                placeholder="INR, USD, etc."
                                {...bookingRegister("currency", {
                                  required: "Currency is required",
                                })}
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Start Date Time *</Label>
                              <Input
                                type="datetime-local"
                                {...bookingRegister("start_dateTime", {
                                  required: "Start time is required",
                                })}
                              />
                              {bookingErrors.start_dateTime && (
                                <p className="text-sm text-destructive">
                                  {
                                    bookingErrors.start_dateTime
                                      .message as string
                                  }
                                </p>
                              )}
                            </div>

                            <div className="space-y-2">
                              <Label>End Date Time *</Label>
                              <Input
                                type="datetime-local"
                                {...bookingRegister("end_dateTime", {
                                  required: "End time is required",
                                })}
                              />
                              {bookingErrors.end_dateTime && (
                                <p className="text-sm text-destructive">
                                  {bookingErrors.end_dateTime.message as string}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>

                        <DialogFooter className="mt-6">
                          <Button
                            variant="outline"
                            type="button"
                            onClick={() => setBookingDialogOpen(false)}
                          >
                            Cancel
                          </Button>
                          <Button type="submit" disabled={addBooking.isPending}>
                            {addBooking.isPending ? "Adding..." : "Add Booking"}
                          </Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {travel.travel_bookings && travel.travel_bookings.length > 0 ? (
                <div className="space-y-4">
                  {travel.travel_bookings.map((booking) => (
                    <Card key={booking.booking_id} className="border">
                      <CardHeader className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Users className="h-5 w-5 text-muted-foreground" />
                          <span className="font-semibold">
                            {booking.bookingType || "Unknown"}
                          </span>
                        </div>
                        
                        <div className="flex gap-2 items-center justify-center">
                          <span className="text-base font-medium">
                            {booking.amount} {booking.currency}
                          </span>

                          {/* Update and delete buttons */}
                          {canModifyTravel && (
                            <>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="bg-emerald-50">
                                  <DropdownMenuItem>
                                    <Button onClick={() => handleBookingUpdateDialogOpen(booking)}>
                                      Update Booking <Pen className="h-4 w-4"/>
                                    </Button>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Button 
                                      variant="outline"
                                      onClick={() => handleDeleteBooking(booking.booking_id!)}
                                      disabled={deleteBooking.isPending}
                                    >
                                      Delete Booking <Trash2 className="h-4 w-4"/>
                                    </Button>
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>       

                              <Dialog
                                open={updateBookingDialogOpen}
                                onOpenChange={(open) => {
                                  setUpdateBookingDialogOpen(open);
                                  if (!open) resetUpdateBooking();
                                }}
                              >

                                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                                  <DialogHeader>
                                    <DialogTitle>Update Booking</DialogTitle>
                                    <DialogDescription>
                                      Update booking details for this travel.
                                    </DialogDescription>
                                  </DialogHeader>

                                  <form
                                    onSubmit={(e) => {
                                      e.preventDefault();
                                      updateBookingSubmit((data) => onUpdateBookingSubmit(data, booking.booking_id!))();
                                    }}
                                    className="space-y-4 py-4"
                                    >
                                    <div className="grid gap-4">
                                      <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                          <Label>Booking Type *</Label>

                                          <Controller
                                            name="bookingType"
                                            control={updateControl}
                                            rules={{ required: "Please select a type" }}
                                            render={({ field }) => (
                                              <Select value={field.value} onValueChange={field.onChange}>
                                                <SelectTrigger className={`w-full border rounded-md h-10 px-2 bg-background ${bookingErrors.bookingType ? "border-destructive" : ""}`}>
                                                  <SelectValue placeholder="Select type" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                  <SelectItem value="FLIGHT">Flight</SelectItem>
                                                  <SelectItem value="HOTEL">Hotel</SelectItem>
                                                  <SelectItem value="TRAIN">Train</SelectItem>
                                                  <SelectItem value="BUS">Bus</SelectItem>
                                                  <SelectItem value="CAB">Car Rental</SelectItem>
                                                  <SelectItem value="OTHER">Other</SelectItem>
                                                </SelectContent>
                                              </Select>
                                            )}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                          <Label htmlFor="provider-name">
                                            Provider Name *
                                          </Label>
                                          <Input
                                            id="provider-name"
                                            placeholder="e.g., Air India, Marriott"
                                            {...updateBookingRegister("provider_name")}
                                            />
                                          {updateBookingErrors.provider_name && (
                                            <p className="text-sm text-destructive">
                                              {
                                                updateBookingErrors.provider_name
                                                .message as string
                                              }
                                            </p>
                                          )}
                                        </div>
                                      </div>

                                      <div className="space-y-2">
                                        <Label htmlFor="booking-reference">
                                          Booking Reference
                                        </Label>
                                        <Input
                                          id="booking-reference"
                                          placeholder="Booking confirmation number"
                                          {...updateBookingRegister("booking_reference")}
                                          />
                                      </div>

                                      <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                          <Label>Amount *</Label>
                                          <Input
                                            type="number"
                                            step="0.01"
                                            placeholder="0.00"
                                            {...updateBookingRegister("amount")}
                                            />
                                          {updateBookingErrors.amount && (
                                            <p className="text-sm text-destructive">
                                              {updateBookingErrors.amount.message as string}
                                            </p>
                                          )}
                                        </div>

                                        <div className="space-y-2">
                                          <Label>Currency *</Label>
                                          <Input
                                            placeholder="INR, USD, etc."
                                            {...updateBookingRegister("currency")}
                                            />
                                          {updateBookingErrors.currency && (
                                            <p className="text-sm text-destructive">
                                              {updateBookingErrors.currency.message as string}
                                            </p>
                                          )}
                                        </div>
                                      </div>

                                      <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                          <Label>Start Date Time *</Label>
                                          <Input
                                            type="datetime-local"
                                            {...updateBookingRegister("start_dateTime")}
                                            />
                                          {updateBookingErrors.start_dateTime && (
                                            <p className="text-sm text-destructive">
                                              {
                                                updateBookingErrors.start_dateTime
                                                .message as string
                                              }
                                            </p>
                                          )}
                                        </div>

                                        <div className="space-y-2">
                                          <Label>End Date Time *</Label>
                                          <Input
                                            type="datetime-local"
                                            {...updateBookingRegister("end_dateTime")}
                                            />
                                          {updateBookingErrors.end_dateTime && (
                                            <p className="text-sm text-destructive">
                                              {updateBookingErrors.end_dateTime.message as string}
                                            </p>
                                          )}
                                        </div>
                                      </div>
                                    </div>

                                    <DialogFooter className="mt-6">
                                      <Button variant="outline" type="button" onClick={() => {
                                        resetUpdateBooking();
                                      }}>
                                        Reset form
                                      </Button>
                                      <Button
                                        variant="outline"
                                        type="button"
                                        onClick={() => setUpdateBookingDialogOpen(false)}
                                        >
                                        Cancel
                                      </Button>
                                      <Button type="submit" disabled={updateBooking.isPending}>
                                        {updateBooking.isPending ? "Updating..." : "Update Booking"}
                                      </Button>
                                    </DialogFooter>
                                  </form>
                                </DialogContent>
                              </Dialog>
                            </>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-1">
                        <p className="text-sm text-muted-foreground">
                          Provider: {booking.provider_name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Ref: {booking.booking_reference}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {DateTimeDisplay(booking.start_dateTime || "")} → {DateTimeDisplay(booking.end_dateTime || "")}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          ID: {booking.booking_id}
                        </p>
                      </CardContent>
                    </Card>
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
                <CardTitle className="flex items-center gap-2 justify-between text-lg">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Travel Documents ({travel.travelDocument?.length || 0})
                  </div>

                  <div className="flex sm:flex-row flex-col gap-4 sm:gap-2 items-center justify-center">
                    {(isTravelMember || isHR) && (
                      <Dialog
                        open={documentUploadOpen}
                        onOpenChange={setDocumentUploadOpen}
                      >
                        <DialogTrigger asChild>
                          <Button size="sm" variant="outline">
                            <Upload className="h-4 w-4 mr-2" />
                            Upload Documents
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-lg">
                          <DialogHeader>
                            <DialogTitle>Upload Travel Documents</DialogTitle>
                            <DialogDescription>
                              Upload visual documentation for this travel
                              (receipts, tickets, etc.)
                            </DialogDescription>
                          </DialogHeader>

                          <div className="space-y-4 py-4">
                            <div className="border-2 border-dashed rounded-lg p-6 text-center">
                              <Input
                                id="doc-upload"
                                type="file"
                                multiple
                                accept="image/*,application/pdf"
                                onChange={handleFileSelect}
                                className="hidden"
                              />
                              <label
                                htmlFor="doc-upload"
                                className="cursor-pointer"
                              >
                                <div className="text-sm text-muted-foreground">
                                  <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                                  <p className="font-medium">
                                    Click to upload documents
                                  </p>
                                  <p className="text-xs">
                                    PNG, JPG, PDF (max. 10MB each)
                                  </p>
                                </div>
                              </label>
                            </div>

                            {uploadFiles.length > 0 && (
                              <div className="space-y-2">
                                <p className="text-sm font-medium">
                                  Selected files ({uploadFiles.length}):
                                </p>
                                <div className="space-y-2 max-h-48 overflow-y-auto">
                                  {uploadFiles.map((file, index) => (
                                    <div
                                      key={index}
                                      className="flex items-center justify-between p-2 bg-muted rounded text-sm"
                                    >
                                      <span className="truncate">
                                        {file.name}
                                      </span>
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeFile(index)}
                                      >
                                        ✕
                                      </Button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>

                          <DialogFooter>
                            <Button
                              variant="outline"
                              onClick={() => {
                                setDocumentUploadOpen(false);
                                setUploadFiles([]);
                              }}
                            >
                              Cancel
                            </Button>
                            <Button
                              onClick={handleDocumentUpload}
                              disabled={
                                uploadTravelDocs.isPending ||
                                uploadFiles.length === 0
                              }
                            >
                              {uploadTravelDocs.isPending
                                ? "Uploading..."
                                : "Upload Documents"}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    )}

                    <CollapsibleTrigger>Show documents</CollapsibleTrigger>
                  </div>
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
                            href={travelDoc.docUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block"
                          >
                            <img
                              src={travelDoc.docUrl}
                              alt="document cover"
                              className="aspect-video w-full object-cover brightness-95 rounded-t-xl"
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
                                    id="createdAt"
                                    className="text-black font-semibold"
                                  >
                                    {DateTimeDisplay(travelDoc.createdAt || "")}
                                  </p>
                                </div>
                                {isHR && (
                                  <div className="flex justify-end mt-2">
                                    <Button
                                      variant="destructive"
                                      size="sm"
                                      className="h-8 px-2"
                                      onClick={() =>
                                        handleDeleteDocument(travelDoc.id!)
                                      }
                                      disabled={deleteTravelDocument.isPending}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </CardContent>
                          </CardHeader>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No Travel Docs</p>
                  )}
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Created By</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-medium text-muted-foreground text-base">
                {travel.created_by} - {travel.created_by_name}
              </p>
            </CardContent>
          </Card>
          
          {/* Expenses Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Expenses</CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                className="w-full"
                onClick={() =>
                  navigate(`/employee/travels/${travelId}/expenses`)
                }
              >
                Manage Expenses
              </Button>
            </CardContent>
          </Card>

          {/* Travel Members Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-lg">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Travel Members ({travel.travelMembers?.length || 0})
                </div>
                {canModifyTravel && (
                  <Dialog
                    open={addMemberDialogOpen}
                    onOpenChange={(open) => {
                      setAddMemberDialogOpen(open);
                      if (!open) resetAddMember();
                    }}
                  >
                    <DialogTrigger asChild>
                      <Button size="sm">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>

                    <DialogContent className="max-w-lg">
                      <DialogHeader>
                        <DialogTitle>Add Travel Member</DialogTitle>
                        <DialogDescription>
                          Add a user as a member to this travel.
                        </DialogDescription>
                      </DialogHeader>

                      <form
                        onSubmit={addMemberSubmit(onAddMemberSubmit)}
                        className="space-y-4 py-4"
                      >
                        <div className="grid gap-4">
                          <div className="space-y-2">
                            <Label>User *</Label>
                            <select
                              className={`w-full border rounded-md h-10 px-2 bg-background ${addMemberErrors.userId ? "border-destructive" : ""}`}
                              {...addMemberRegister("userId", {
                                required: "Please select a user",
                              })}
                            >
                              <option value="">Select user</option>
                              {users
                                .filter(
                                  (user) =>
                                    !travel.travelMembers?.some(
                                      (member) =>
                                        member.member_id === user.userId,
                                    ),
                                )
                                .map((user) => (
                                  <option
                                    key={user.userId}
                                    value={user.userId!}
                                  >
                                    {user.name}
                                  </option>
                                ))}
                            </select>
                            {addMemberErrors.userId && (
                              <p className="text-sm text-destructive">
                                {addMemberErrors.userId.message as string}
                              </p>
                            )}
                          </div>
                        </div>

                        <DialogFooter className="mt-6">
                          <Button
                            variant="outline"
                            type="button"
                            onClick={() => setAddMemberDialogOpen(false)}
                          >
                            Cancel
                          </Button>
                          <Button type="submit" disabled={addMember.isPending}>
                            {addMember.isPending ? "Adding..." : "Add Member"}
                          </Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                )}
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
                        <div className="flex flex-col">
                          <p className="font-medium text-base">{member.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {member.role}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {member.email}
                          </p>
                        </div>
                      </div>
                      {canModifyTravel && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-destructive border-destructive/20 hover:bg-destructive/5"
                            >
                              Remove
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Remove Member?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to remove {member.name}{" "}
                                from this travel?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() =>
                                  handleDeleteMember(member.id || "")
                                }
                                className="bg-destructive hover:bg-destructive/90"
                              >
                                Remove
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
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
