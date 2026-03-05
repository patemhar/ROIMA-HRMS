import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import {
  useGetGame,
  useGetGameCycle,
  useGetGameSlots,
  useGetUserGameStats,
  useGetUserActiveBooking,
  useMakeBookingRequest,
  useCancelBooking,
} from "@/hooks/game/game.hooks";
import { useGetAllUsers } from "@/hooks/util/util.hooks";
import {
  DateDisplay,
  DateTimeDisplay,
  DateTimeWSDisplay,
  TimeDisplay,
  getDatesBetween,
} from "@/utils/dateUtils";
import { ArrowLeft, Calendar, Plus, Trash2, AlertCircle, Info, Car } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { getErrorMessage } from "@/utils/error";
import { useAuth } from "@/store";
import Countdown from 'react-countdown';
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import CountUp from "@/components/ui/CountUp";
import type { components } from "@/types/api";
import { SearchableSelect } from "@/components/ui/searchable-select";

type Schemas = components["schemas"];

interface SelectedMember {
  id: string;
  name: string;
}

interface SlotFormData {
  slotId: string;
  startTime: any;
  endTime: any;
  queueCount: number;
  members: SelectedMember[];
}

const isDateBeforeToday = (dateString: string): boolean => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const checkDate = new Date(dateString);
  checkDate.setHours(0, 0, 0, 0);

  return checkDate < today;
};

const isSlotSelectable = (slot: any, dateString: string): boolean => {
 
  const now = new Date();

  const slotStartTime = new Date(`${dateString}T${slot.startTime}`);

  return slotStartTime > now;
};

const GameDetail = () => {
  const { id: gameId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Queries
  const gameQuery = useGetGame(gameId!);
  const game = gameQuery.data;

  const cycleQuery = useGetGameCycle(gameId || "");
  const cycleResponse = cycleQuery.data;
  const cycleData = cycleResponse?.data;

  const usersQuery = useGetAllUsers();
  const allUsers = usersQuery.data || [];

  const statsQuery = useGetUserGameStats();
  const allStats = statsQuery.data || [];

  const activeBookingQuery = useGetUserActiveBooking(gameId || "");
  const activeBooking = activeBookingQuery.data;

  const bookingOngoingInfo = useMemo(() => {
   
    if (!activeBooking || activeBooking.status !== 'CONFIRMED' || !activeBooking.startTime || !activeBooking.endTime) return null;

    const combinedStart = `${activeBooking.slotDate}T${activeBooking.startTime}`;
    const slotStart = new Date(combinedStart);
    
    const combinedEnd = `${activeBooking.slotDate}T${activeBooking.endTime}`;
    const slotEnd = new Date(combinedEnd);
    
    const now = new Date();
    if (now > slotStart && now < slotEnd) {
      return { ongoing: true, endDateTime: slotEnd };
    }

    return null;
  }, [activeBooking]);

  const makeBookingMutation = useMakeBookingRequest();
  const cancelBookingMutation = useCancelBooking();

  const gameStats = allStats.find((stat) => stat.gameId === gameId);

  // State

  const currentUserId = useAuth().auth.user?.id;

  const [errorMessage, setErrorMessage] = useState<string>("");

  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedSlotId, setSelectedSlotId] = useState<string>("");
  const [slotFormData, setSlotFormData] = useState<SlotFormData>({
    slotId: "",
    startTime: null,
    endTime: null,
    queueCount: 0,
    members: [{ id: currentUserId!, name: "You" }],
  });
  const [selectedMemberId, setSelectedMemberId] = useState<string>("");

  const cycleDates = useMemo(() => {
    if (cycleData?.cycle_start && cycleData?.cycle_end) {
      const allDates = getDatesBetween(
        cycleData.cycle_start,
        cycleData.cycle_end,
      );
      return allDates.filter((date) => !isDateBeforeToday(date));
    }
    return [];
  }, [cycleData]);

  const slotsQuery = useGetGameSlots({
    gameId: gameId || "",
    date: selectedDate,
  });

  const slots = slotsQuery.data || [];

  // Handle date selection
  const handleDateSelect = useCallback((date: string) => {
    setSelectedDate(date);
    setSelectedSlotId("");
    setSlotFormData({
      slotId: "",
      startTime: null,
      endTime: null,
      queueCount: 0,
      members: [],
    });
  }, []);

  // Handle slot selection
  const handleSlotSelect = useCallback((slot: any) => {
    setSelectedSlotId(slot.id);
    setSlotFormData({
      slotId: slot.id,
      startTime: slot.startTime,
      endTime: slot.endTime,
      queueCount: slot.queueCount || 0,
      members: [{ id: currentUserId!, name: "You" }],
    });
    setSelectedMemberId("");
  }, []);

  const handleAddMember = useCallback(() => {
    if (!selectedMemberId) return;

    if(slotFormData.members.length >= (game?.maxPlayersPerSlot!)) {
      toast.error(`Cannot add more than ${game?.maxPlayersPerSlot} members to a slot`);
      return;
    }

    const member = allUsers.find((u: any) => u.userId === selectedMemberId);

    if (!member || !member.userId || !member.name) {
      toast.error("Invalid member selected");
      return;
    }

    if (slotFormData.members.some((m) => m.id === selectedMemberId)) {
      toast.error("Member already added to this slot");
      return;
    }

    const newMember: SelectedMember = {
      id: member.userId,
      name: member.name,
    };

    setSlotFormData((prev) => ({
      ...prev,
      members: [...prev.members, newMember],
    }));
    setSelectedMemberId("");
  }, [selectedMemberId, allUsers, slotFormData.members]);

  const handleRemoveMember = useCallback((memberId: string) => {
    setSlotFormData((prev) => ({
      ...prev,
      members: prev.members.filter((m) => m.id !== memberId),
    }));
  }, []);

  const handleSubmitBooking = useCallback(async () => {

    if (makeBookingMutation.isPending) return;

    if (!slotFormData.slotId || slotFormData.members.length === 0) {
      toast.error("Please select a slot and add members");
      return;
    }

    try {
      const memberIds = slotFormData.members.map((m) => m.id);

      await makeBookingMutation.mutateAsync({
        slotId: slotFormData.slotId,
        participants: memberIds,
      });

      setSelectedSlotId("");
      setSlotFormData({
        slotId: "",
        startTime: null,
        endTime: null,
        queueCount: 0,
        members: [],
      });
      setSelectedMemberId("");
    } catch (error) {
      toast.error(getErrorMessage(error));
      setErrorMessage(getErrorMessage(error));
    }
  }, [gameId, selectedDate, slotFormData, makeBookingMutation]);

  // Handle cancel booking
  const handleCancelBooking = useCallback(async () => {

    if(cancelBookingMutation.isPending) return;

    if (!activeBooking?.bookingId) {
      toast.error("No active booking to cancel");
      return;
    }

    try {
      await cancelBookingMutation.mutateAsync({ bookingId: activeBooking.bookingId, gameId: gameId! });
      toast.success("Booking cancelled successfully");
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }, [activeBooking?.bookingId, cancelBookingMutation]);

  // Loading state
  if (gameQuery.isLoading || cycleQuery.isLoading || statsQuery.isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner />
      </div>
    );
  }

  // Error state
  if (!gameId || !game) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-semibold text-destructive">
            Error fetching game!
          </h1>
          <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
      </div>
    );
  }

  if(!game.active) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4 justify-center flex-col h-110">
          <h1 className="text-xl font-semibold text-destructive">
            Sorry, This game is currently unavailable!
          </h1>
          <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
      </div>
    );
  }
  
  
  return (
    <div className="space-y-6" >
      {/* Success/Error Messages */}
      {errorMessage && (
        <div className="bg-red-50 text-red-800 p-3 rounded-md text-sm">
          {errorMessage}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">  
        <div>
          <h1 className="text-2xl font-bold">{game?.name}</h1>
          <p className="text-muted-foreground mt-1">
            View details and manage your bookings for this game
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            gameQuery.refetch();
            cycleQuery.refetch();
            statsQuery.refetch();
            activeBookingQuery.refetch();
            slotsQuery.refetch();
          }}
          disabled={gameQuery.isLoading}
        >
          Refresh
        </Button>
      </div>

      {/* if user doesnt have latest cycle stats meana he may not have set interest or set it after cycle start */}
      {!gameStats && !statsQuery.isLoading && cycleData && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-600" />
              <CardTitle className="text-lg text-orange-900">
                Not Eligible for Current Cycle
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-orange-700">
              You are not eligible to book slots for this game in the current
              cycle. You can book from the next cycle once you express interest in this game or if already then wait for the next cycle to start.
            </p>
          </CardContent>
        </Card>
      )}

      {/* User Stats & Cycle Info Card */}
      {gameStats && cycleData && (
        <Card className="bg-linear-to-r from-blue-50 to-cyan-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-lg">Your Stats & Cycle Info</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <Label className="text-sm text-muted-foreground">
                Times Played
              </Label>
              <p className="text-3xl font-bold text-blue-600">
                {gameStats.playCount || 0}
              </p>
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">
                Cycle Start
              </Label>
              <p className="text-sm font-medium">
                {cycleData.cycle_start
                  ? DateTimeDisplay(cycleData.cycle_start)
                  : "N/A"}
              </p>
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">Cycle End</Label>
              <p className="text-sm font-medium">
                {cycleData.cycle_end ? DateTimeDisplay(cycleData.cycle_end) : "N/A"}
              </p>
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">
                Total Slots
              </Label>
              <p className="text-2xl font-bold text-cyan-600">
                {cycleData.total_slots || 0}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Booking Card */}
      {activeBooking && (
        <Card className="border-emerald-200 bg-emerald-50">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <CardTitle className="text-lg text-emerald-900 flex items-center justify-center">
                  Your Active Booking
                  <HoverCard openDelay={10} closeDelay={100}>
                    <HoverCardTrigger asChild>
                      <Button variant="link"><Info className="h-4 w-4 ml-1"/></Button>
                    </HoverCardTrigger>
                    <HoverCardContent className="flex w-lg flex-col gap-0.5 bg-amber-50 border-amber-200" side="right">
                      <div className="font-semibold">Important Info</div>
                      <div className="text-muted-foreground mt-1 text-sm">• Booking can only cancelled by the user who requested it.</div>
                      <div className="text-muted-foreground mt-1 text-sm">
                        • Cancellation of a confimed request under 30 minutes of slot start time will result in a penalty.
                      </div>
                    </HoverCardContent>
                  </HoverCard>
                </CardTitle>
              </div>
              <Badge
                variant="outline"
                className={`${
                  activeBooking.status === "CONFIRMED"
                  ? "border-green-200 bg-green-50 text-green-700"
                  : activeBooking.status === "PENDING"
                  ? "border-blue-200 bg-blue-50 text-blue-700"
                  : "border-gray-200 bg-gray-50"
                }`}
                >
                {activeBooking.status}
              </Badge>
            </div>
            <CardDescription>
              You have an active booking for this game. Please find the details below.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label className="text-sm text-muted-foreground">Date</Label>
                <p className="text-sm font-medium">
                  {activeBooking.slotDate
                    ? DateDisplay(activeBooking.slotDate)
                    : "N/A"}
                </p>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Slot Time</Label>
                <p className="text-sm font-medium">
                  {TimeDisplay(activeBooking.startTime)} - {TimeDisplay(activeBooking.endTime)}
                </p>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">
                  Participants
                </Label>
                <div className="space-y-1 mt-1">
                  {activeBooking.participants!.map(
                    (participant: string, index: number) => (
                      <p key={index} className="text-sm font-medium">
                        • {participant}
                      </p>
                    ),
                  )}
                </div>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">
                  Requested By
                </Label>
                <p className="text-sm font-medium">
                  {activeBooking.requestedBy?.substring(39) || "N/A"}
                </p>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">
                  Requested
                </Label>
                <p className="text-sm font-medium">
                  {activeBooking.requestedAt
                    ? DateTimeWSDisplay(activeBooking.requestedAt)
                    : "N/A"}
                </p>
              </div>
            </div>

            {bookingOngoingInfo?.ongoing && (
              <div className="border-t pt-4">
                <Label className="text-sm text-muted-foreground">Time Remaining</Label>
                <Countdown date={bookingOngoingInfo.endDateTime} renderer={({ hours, minutes, seconds, completed }) => {
                  if (completed) {
                    return <p className="text-lg font-bold text-green-600">Slot Ended</p>;
                  }
                  return <p className="text-lg font-bold text-amber-400">{String(hours).padStart(2,'0')}:{String(minutes).padStart(2,'0')}:{String(seconds).padStart(2,'0')}</p>;
                }} />
              </div>
            )}

            {/* cancellation button */}
            {activeBooking.requestedBy?.substring(0, 36) == currentUserId && !bookingOngoingInfo?.ongoing && (
              <Button
              onClick={handleCancelBooking}
              disabled={cancelBookingMutation.isPending}
              className=" hover:bg-red-500"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {cancelBookingMutation.isPending
                  ? "Cancelling..."
                  : "Cancel Booking"}
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Game Details Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl">{game.name}</CardTitle>
              <CardDescription className="mt-2">
                {game.description}
              </CardDescription>
            </div>
            <Badge variant="outline">Active</Badge>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div>
            <Label className="text-sm text-muted-foreground">
              Operating Start Time
            </Label>
            <p className="text-sm font-medium">
              {game.startTime ? TimeDisplay(game.startTime) : "N/A"}
            </p>
          </div>
          <div>
            <Label className="text-sm text-muted-foreground">
              Operating End Time
            </Label>
            <p className="text-sm font-medium">
              {game.endTime ? TimeDisplay(game.endTime) : "N/A"}
            </p>
          </div>
          <div>
            <Label className="text-sm text-muted-foreground">
              Max Players Per Slot
            </Label>
            <p className="text-sm font-medium">
              {game.maxPlayersPerSlot || "N/A"}
            </p>
          </div>
          <div>
            <Label className="text-sm text-muted-foreground">
              Slot Duration (Minutes)
            </Label>
            <p className="text-sm font-medium">
              {game.slotDurationMinutes || "N/A"}
            </p>
          </div>
          <div>
            <Label className="text-sm text-muted-foreground">
              Interested Players
            </Label>
            <p className="text-sm font-medium">
              <CountUp to={game.interestedCount || 0} className="text-blue-600" />
            </p>
          </div>
          <div>
            <Label className="text-sm text-muted-foreground">
              Active On Weekends
            </Label>
            <p className="text-sm font-medium">
              {game.activeOnWeekends ? "Yes" : "No"}
            </p>
          </div>
        </CardContent>
      </Card>

      { !cycleData && !cycleQuery.isLoading && (
        <Card className="border-gray-200 bg-gray-50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Info className="h-5 w-5 text-gray-600" />
              <CardTitle className="text-md font-semibold text-gray-900">
                {cycleResponse?.message || "No Cycle Data"}
              </CardTitle>
            </div>
          </CardHeader>
        </Card>
      )}

      {/* Date Selection Strip */}
      {gameStats && !bookingOngoingInfo?.ongoing && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Select Date
            </CardTitle>            
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {cycleDates.length > 0 ? (
                cycleDates.map((date) => (
                  <Button
                  key={date}
                  variant={selectedDate === date ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleDateSelect(date)}
                  className="shrink-0"
                  >
                    {new Date(date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </Button>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  No upcoming dates available
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Slots Display */}
      {gameStats && selectedDate && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Available Slots</CardTitle>
            <CardDescription>
              {DateDisplay(selectedDate)}.
              {activeBooking && (
                <span className="text-amber-700 ml-2">• View-only</span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {(() => {
              if (slotsQuery.isLoading) {
                return (
                  <div className="flex items-center justify-center py-8">
                    <Spinner />
                  </div>
                );
              }
              
              if (slots.length > 0) {
                return (
                  <ScrollArea className="w-full">
                    <div className="flex w-full gap-4 p-3">
                      {slots.map((slot: Schemas["SlotResponseDto"]) => {
                        const selectable = isSlotSelectable(slot, selectedDate);
                        
                        const slotState = slot.booked 
                          ? 'booked' 
                          : selectable 
                          ? 'available' 
                          : 'unavailable';
                        
                        const cardStyles = {
                          booked: "border-amber-200 bg-amber-50 hover:border-amber-500",
                          available: "cursor-pointer hover:border-primary/50",
                          unavailable: "opacity-50 cursor-not-allowed"
                        };
                        
                        const statusBadge = {
                          booked: { label: "Booked", className: "bg-amber-100 text-amber-700 border-amber-300" },
                          available: { label: "Available", className: "bg-green-100 text-green-700 border-green-300" },
                          unavailable: { label: "Unavailable", className: "bg-gray-100 text-gray-600" }
                        };

                        const queueBadgeStyle = (slot.queueCount || 0) === 0 
                          ? "bg-gray-100" 
                          : (slot.queueCount || 0) < 3
                          ? "bg-blue-100 text-blue-700"
                          : "bg-orange-100 text-orange-700";

                        const priorityBadgeStyle = slot.bookingPriority != null && slot.bookingPriority <= 2
                          ? "bg-red-100 text-red-700 border-red-300"
                          : slot.bookingPriority != null && slot.bookingPriority <= 5
                          ? "bg-yellow-100 text-yellow-700 border-yellow-300"
                          : "bg-blue-100 text-blue-700 border-blue-300";
                        
                        return (
                          <Card
                            key={slot.id}
                            className={`relative transition-all w-50 ${
                              selectable ? selectedSlotId === slot.id ? "border-primary bg-primary/5" : cardStyles[slotState] : "opacity-50 cursor-not-allowed"
                            }`}
                            onClick={selectable ? () => handleSlotSelect(slot) : undefined}
                          >
                            <div className="absolute top-2 right-2">
                              <Badge variant="outline" className={selectable ? statusBadge[slotState].className : "opacity-50"}>
                                {selectable ? statusBadge[slotState].label : "Unavailable"}
                              </Badge>
                            </div>

                            <CardContent className="p-4 pt-8 pb-3">
                              <div className="space-y-2">
                                {/* Time */}
                                <div>
                                  <p className="text-sm font-medium text-muted-foreground">Time</p>
                                  <p className="text-sm font-semibold">
                                    {TimeDisplay(slot.startTime)} - {TimeDisplay(slot.endTime)}
                                  </p>
                                </div>

                                {slot.booked && selectable && slot.bookingPriority != null ? (
                                  <div className="border-t pt-2">
                                    <p className="text-xs font-medium text-muted-foreground mb-1">
                                      Booking Priority
                                    </p>
                                    <HoverCard openDelay={100} closeDelay={100}>
                                      <HoverCardTrigger asChild>
                                        <Badge variant="secondary" className={`cursor-help ${priorityBadgeStyle}`}>
                                          Priority: {slot.bookingPriority}
                                        </Badge>
                                      </HoverCardTrigger>
                                      <HoverCardContent className="w-64 text-sm" side="top">
                                        <div className="space-y-2">
                                          <p className="font-semibold">Lower number = Higher priority</p>
                                          <p className="text-muted-foreground">
                                            This slot is booked by a team with priority {slot.bookingPriority}.
                                          </p>
                                          <p className="text-muted-foreground text-xs">
                                            Priority is based on the maximum play count among team members. 
                                            Teams with fewer plays get lower priority numbers (higher priority).
                                          </p>
                                        </div>
                                      </HoverCardContent>
                                    </HoverCard>
                                  </div>
                                ) : (
                                  <div className="border-t pt-2">
                                    <p className="text-xs font-medium text-muted-foreground mb-1">Status</p>
                                    <Badge variant="secondary" className={
                                      selectable 
                                        ? "bg-emerald-100 text-emerald-700 border-emerald-300" 
                                        : "bg-gray-100 text-gray-600"
                                    }>
                                      {selectable ? "Ready to Book" : "Can't Book"}
                                    </Badge>
                                  </div>
                                )}

                                <div className="border-t pt-2">
                                  <div className="flex items-center justify-between">
                                    <p className="text-xs font-medium text-muted-foreground">
                                      Requests in Queue
                                    </p>
                                    <Badge variant="secondary" className={queueBadgeStyle}>
                                      {slot.queueCount || 0}
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                    <ScrollBar orientation="horizontal" />
                  </ScrollArea>
                );
              }
              
              return (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No available slots for this date
                </p>
              );
            })()}
          </CardContent>
        </Card>
      )}

      {/* Slot Form - Add Members */}
      {!activeBooking &&
        gameStats &&
        selectedSlotId &&
        slotFormData.startTime &&
        slotFormData.endTime && (
          <Card>
            <CardHeader>
              <CardTitle>Add Members to Slot</CardTitle>
              <CardDescription className="text-base font-semibold text-foreground">
                {TimeDisplay(slotFormData.startTime)} -{" "}
                {TimeDisplay(slotFormData.endTime)} on{" "}
                {selectedDate ? DateDisplay(selectedDate) : "N/A"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Member Selection */}
              <div className="space-y-3">
                <Label htmlFor="user-select">Select Member</Label>
                <div className="flex gap-2">
                  <SearchableSelect
                    id="user-select"
                    options={allUsers
                      .filter((user) => !slotFormData.members.some((m) => m.id === user.userId))
                      .map((user) => ({
                        value: user.userId!,
                        label: user.name || "Unnamed User",
                      }))}
                    value={selectedMemberId}
                    onValueChange={(value: string) => setSelectedMemberId(value)}
                    placeholder="Choose a member..."
                    className="flex-1"
                  />
                  <Button
                    onClick={handleAddMember}
                    disabled={!selectedMemberId}
                    >
                    <Plus className="h-4 w-4 mr-2" />
                    Add
                  </Button>
                </div>
              </div>

              {/* Selected Members List */}
              <div className="space-y-2">
                <Label>Members Added ({slotFormData.members.length})</Label>
                {slotFormData.members.length > 0 ? (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {slotFormData.members.map((member) => (
                      <div
                      key={member.id}
                      className="flex items-center justify-between rounded-md border p-3 bg-muted/50"
                      >
                        <span className="text-sm font-medium">
                          {member.name}
                        </span>
                        { member.id === currentUserId ? (
                          <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">
                            You
                          </Badge>
                          ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveMember(member.id)}
                            >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                          )
                        }
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No members added yet
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedSlotId("");
                    setSlotFormData({
                      slotId: "",
                      startTime: null,
                      endTime: null,
                      queueCount: 0,
                      members: [],
                    });
                  }}
                  disabled={makeBookingMutation.isPending}
                  >
                  Clear
                </Button>
                <Button
                  disabled={
                    slotFormData.members.length === 0 ||
                    makeBookingMutation.isPending
                  }
                  onClick={handleSubmitBooking}
                  >
                  {makeBookingMutation.isPending ? (
                    <>
                      <Spinner className="mr-2 h-4 w-4" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Booking"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
    </div>
    
  );
};

export default GameDetail;
