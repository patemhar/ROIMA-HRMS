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
  DateTimeWSDisplay,
  TimeDisplay,
  getDatesBetween,
} from "@/utils/dateUtils";
import { ArrowLeft, Calendar, Plus, Trash2, AlertCircle } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import dayjs from "dayjs";
import { getErrorMessage } from "@/utils/error";
import { useAuth } from "@/store";

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

const isTimePast = (timeObj: any): boolean => {
  if (!timeObj) return false;

  const now = new Date();
  let hours = 0;
  let minutes = 0;
  let seconds = 0;

  if (typeof timeObj === "string") {
    const parts = timeObj.split(":");
    hours = parseInt(parts[0], 10);
    minutes = parseInt(parts[1], 10);
    seconds = parseInt(parts[2], 10);
  } else {
    hours = timeObj.hour ?? 0;
    minutes = timeObj.minute ?? 0;
    seconds = timeObj.second ?? 0;
  }

  const slotTime = new Date();
  slotTime.setHours(hours, minutes, seconds, 0);

  return slotTime <= now;
};

const isDateBeforeToday = (dateString: string): boolean => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const checkDate = new Date(dateString);
  checkDate.setHours(0, 0, 0, 0);

  return checkDate < today;
};

const isToday = (dateString: string): boolean => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const checkDate = new Date(dateString);
  checkDate.setHours(0, 0, 0, 0);

  return checkDate.getTime() === today.getTime();
};

const isSlotSelectable = (slot: any, dateString: string): boolean => {
  if (isDateBeforeToday(dateString)) {
    return false;
  }

  if (isToday(dateString)) {
    return !isTimePast(slot.startTime);
  }

  return true;
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

  const makeBookingMutation = useMakeBookingRequest();
  const cancelBookingMutation = useCancelBooking();

  const gameStats = useMemo(() => {
    if (!game || !cycleData || !allStats || allStats.length === 0) return null;

    const stats = allStats.find((stat: any) => {
      const gameNameMatch =
        stat.gameName?.trim().toLowerCase() === game.name?.trim().toLowerCase();

      let cycleMatch = false;
      if (
        stat.cycleStart &&
        stat.cycleEnd &&
        cycleData.cycle_start &&
        cycleData.cycle_end
      ) {
        const statCycleStart = dayjs(stat.cycleStart).startOf("day").valueOf();
        const statCycleEnd = dayjs(stat.cycleEnd).startOf("day").valueOf();
        const dataCycleStart = dayjs(cycleData.cycle_start)
          .startOf("day")
          .valueOf();
        const dataCycleEnd = dayjs(cycleData.cycle_end)
          .startOf("day")
          .valueOf();
        cycleMatch =
          statCycleStart === dataCycleStart && statCycleEnd === dataCycleEnd;
      }

      return gameNameMatch && cycleMatch;
    });

    return stats || null;
  }, [game, cycleData, allStats]);

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
    members: [],
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

  const slots = useMemo(() => {
    if (!slotsQuery.data) return [];

    return slotsQuery.data;
  }, [slotsQuery.data]);

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
      members: [],
    });
    setSelectedMemberId("");
  }, []);

  const handleAddMember = useCallback(() => {
    if (!selectedMemberId) return;

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
    if (!slotFormData.slotId || slotFormData.members.length === 0) {
      toast.error("Please select a slot and add members");
      return;
    }

    try {
      const memberIds = slotFormData.members.map((m) => m.id);

      console.log("Submitting booking with data:", {
        gameId,
        slotId: slotFormData.slotId,
        participants: memberIds,
      });

      await makeBookingMutation.mutateAsync({
        slotId: slotFormData.slotId,
        participants: memberIds,
      });

      toast.success("Booking request submitted successfully");
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
      setErrorMessage(getErrorMessage(error));
      console.error("Booking error:", getErrorMessage(error));
    }
  }, [gameId, selectedDate, slotFormData, makeBookingMutation]);

  // Handle cancel booking
  const handleCancelBooking = useCallback(async () => {
    if (!activeBooking?.bookingId) return;

    try {
      await cancelBookingMutation.mutateAsync(activeBooking.bookingId);
      toast.success("Booking cancelled successfully");
    } catch (error) {
      console.error("Cancel error:", getErrorMessage(error));
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

  return (
    <div className="space-y-6">
      {/* Success/Error Messages */}
      {errorMessage && (
        <div className="bg-red-50 text-red-800 p-3 rounded-md text-sm">
          {errorMessage}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => gameQuery.refetch()}
          disabled={gameQuery.isLoading}
        >
          Refresh
        </Button>
      </div>

      {/* User Stats Card */}
      {gameStats && (
        <Card className="bg-linear-to-r from-blue-50 to-cyan-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-lg">Your Stats</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
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
                {gameStats.cycleStart
                  ? DateDisplay(gameStats.cycleStart)
                  : "N/A"}
              </p>
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">Cycle End</Label>
              <p className="text-sm font-medium">
                {gameStats.cycleEnd ? DateDisplay(gameStats.cycleEnd) : "N/A"}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* if user doesnt have latest cycle stats meana he may not have set interest or set it after cycle start */}
      {!gameStats && !statsQuery.isLoading && (
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
            <p className="text-sm text-orange-800">
              You are not eligible to book slots for this game in the current
              cycle. You can book from the next cycle once it becomes available.
            </p>
            <p className="text-sm text-orange-700">
              To express interest in playing this game in future cycles, please
              visit your Account page.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Active Booking Card */}
      {activeBooking && (
        <Card className="border-amber-200 bg-amber-50">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <CardTitle className="text-lg text-amber-900">
                  Your Active Booking
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
                <Label className="text-sm text-muted-foreground">Time</Label>
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

            <p className="text-sm text-orange-700">
              Booking can only cancelled by the user who requested it.
            </p>

            <p className="text-sm text-orange-700">
              Booking cancellation under 30 minutes of slot start time will result in a penalty.
            </p>

            {activeBooking.requestedBy?.substring(0, 36) == currentUserId && (
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
        <CardContent className="grid gap-4 md:grid-cols-2">
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
        </CardContent>
      </Card>

      {/* Cycle Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Game Cycle</CardTitle>
        </CardHeader>
        <CardContent>
          {cycleData ? (
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <Label className="text-sm text-muted-foreground">
                  Cycle Start
                </Label>
                <p className="text-sm font-medium">
                  {cycleData.cycle_start
                    ? `${DateDisplay(cycleData.cycle_start)} ${TimeDisplay(cycleData.cycle_start)}`
                    : "N/A"}
                </p>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">
                  Cycle End
                </Label>
                <p className="text-sm font-medium">
                  {cycleData.cycle_end
                    ? `${DateDisplay(cycleData.cycle_end)} ${TimeDisplay(cycleData.cycle_end)}`
                    : "N/A"}
                </p>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">
                  Total Slots
                </Label>
                <p className="text-sm font-medium">
                  {cycleData.total_slots || "N/A"}
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground">
                {cycleResponse?.message || "No active game cycle"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Date Selection Strip */}
      {!activeBooking && gameStats && (
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
      {!activeBooking && gameStats && selectedDate && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Available Slots</CardTitle>
            <CardDescription>
              {new Date(selectedDate).toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
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
                  <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                    {slots.map((slot: any) => {
                      const selectable = isSlotSelectable(slot, selectedDate);
                      return (
                        <Card
                          key={slot.id}
                          className={`transition-all ${
                            selectedSlotId === slot.id
                              ? "border-primary bg-primary/5"
                              : selectable
                                ? "cursor-pointer hover:border-primary/50"
                                : "opacity-50 cursor-not-allowed"
                          }`}
                          onClick={
                            selectable
                              ? () => handleSlotSelect(slot)
                              : undefined
                          }
                        >
                          <CardContent className="pt-6">
                            <div className="space-y-2">
                              <div>
                                <p className="text-sm font-medium text-muted-foreground">
                                  Time
                                </p>
                                <p className="text-sm font-semibold">
                                  {TimeDisplay(slot.startTime)} -{" "}
                                  {TimeDisplay(slot.endTime)}
                                </p>
                              </div>
                              <div className="border-t pt-2">
                                <p className="text-sm font-medium text-muted-foreground">
                                  Queue Count
                                </p>
                                <Badge variant="secondary" className="mt-1">
                                  {slot.queueCount || 0} in queue
                                </Badge>
                              </div>
                              {!selectable && (
                                <div className="border-t pt-2">
                                  <Badge
                                    variant="outline"
                                    className="text-xs text-muted-foreground"
                                  >
                                    Not Available
                                  </Badge>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
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
                  <Select
                    value={selectedMemberId}
                    onValueChange={setSelectedMemberId}
                  >
                    <SelectTrigger id="user-select" className="flex-1">
                      <SelectValue placeholder="Choose a member..." />
                    </SelectTrigger>
                    <SelectContent>
                      {allUsers
                        .filter((user) => user.userId && user.name)
                        .map((user) => (
                          <SelectItem key={user.userId} value={user.userId!}>
                            {user.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
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
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveMember(member.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
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
