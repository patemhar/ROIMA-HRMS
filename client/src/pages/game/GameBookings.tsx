import { SkeletonTable } from "@/components/SkeletonTable";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGetAllGameBookingRequests } from "@/hooks/game/game.hooks";
import { useGetBookings } from "@/hooks/travel/travel.hooks";
import { useDebounce } from "@/hooks/useDebounce";
import { getErrorMessage } from "@/utils/error";
import { Badge } from "@/components/ui/badge"; 
import React, { use, useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableHead,
  TableCell,
  TableRow,
  TableHeader,
} from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { DateTimeDisplay, TimeDisplay } from "@/utils/dateUtils";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Spinner } from "@/components/ui/spinner";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, User2 } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { set } from "date-fns";
import { Confetti } from "@/components/ui/confetti";

//'"link" | "destructive" | "default" | "outline" | "secondary" | "ghost" | null | undefined'.
const getBadgeVarient = (status: string) => {
  switch (status) {
    case "PENDING": return "secondary";
    case "CONFIRMED": return "success";
    case "CANCELLED": return "warning";
    case "EXPIRED": return "secondary";
    default: return "ghost";
  }
}

const filterOptions = [
  { label: "All", value: "ALL" },
  { label: "Pending", value: "PENDING" },
  { label: "Confirmed", value: "CONFIRMED" },
  { label: "Cancelled", value: "CANCELLED" },
  { label: "Expired", value: "EXPIRED" },
];

export const GameBookings = () => {

  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);

  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("ALL");
  const [filteredItems, setFilteredItems] = useState<typeof items>([]);

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const bookingsQuery = useGetAllGameBookingRequests(
    pageNumber,
    pageSize,
    debouncedSearchTerm,
  );

  const items = bookingsQuery.data?.content || [];

  useEffect(() => {
      if (bookingsQuery.data) {

        const filtered = items.filter((item) => {
          if (selectedFilter === "ALL") return true;
          return item.status === selectedFilter;
        });

        setFilteredItems(filtered);
      }
  }, [items, selectedFilter]);

  useEffect(() => {
    setPageNumber(1);
  }, [debouncedSearchTerm]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex flex-col">
            <h1 className="text-2xl font-bold">Game Bookings</h1>
            <p className="text-muted-foreground mt-1">
            All game bookings that you were part of.
            </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => {
              bookingsQuery.refetch();
            }}
          >
            {bookingsQuery.isFetching ? <Spinner /> : "Refresh"}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>My Game Bookings</CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between flex-wrap items-center gap-4">
            <Input
              placeholder="Search travels..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-3xl"
            />

            <div className="flex gap-3">
              <Select value={selectedFilter} onValueChange={(value) => setSelectedFilter(value)}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent className="bg-emerald-50">
                  {filterOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="flex items-center gap-2">
                <Label
                  htmlFor="myPageSize"
                  className="text-xs text-muted-foreground"
                >
                  Per page:
                </Label>
                <Select
                  value={String(pageSize)}
                  onValueChange={(value) => {
                    setPageSize(Number(value));
                    setPageNumber(1);
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
          </div>

            <div className="rounded-lg border border-slate-200">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Booking Id</TableHead>
                    <TableHead>Game Name</TableHead>
                    <TableHead>Slot Date</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>RequestedBy</TableHead>
                    <TableHead>RequestedAt</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Priority Score</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookingsQuery.isLoading && (
                    <TableRow>
                      <TableCell colSpan={9}>
                        <SkeletonTable />
                      </TableCell>
                    </TableRow>
                  )}

                  {bookingsQuery.isError && (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">
                        <p className="text-destructive">
                          {getErrorMessage(bookingsQuery.error) ||
                            "Failed to load bookings"}
                        </p>
                      </TableCell>
                    </TableRow>
                  )}

                  {!bookingsQuery.isLoading &&
                    !bookingsQuery.isError &&
                    filteredItems.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8">
                          <p className="text-muted-foreground">
                            No game booking records found
                          </p>
                        </TableCell>
                      </TableRow>
                    )}

                  {filteredItems.map((booking) => {
                    return (
                      <TableRow
                        key={ booking?.bookingId }
                        className="transition-colors hover:bg-muted/40"
                      >
                        <TableCell>{booking?.bookingId ?? "—"}</TableCell>
                        <TableCell className="font-medium">
                            <HoverCard>
                                <HoverCardTrigger className="cursor-pointer">
                                    {booking?.gameName ?? "Unknown"}
                                </HoverCardTrigger>
                                <HoverCardContent align="start">
                                    <div className="space-y-2">
                                        <div>
                                            <p className="text-sm text-muted-foreground">Booking ID</p>
                                            <p className="text-xs font-semibold">{booking?.bookingId ?? "—"}</p>
                                        </div>
                                        <div>
                                        </div>
                                    </div>
                                </HoverCardContent>
                            </HoverCard>
                        </TableCell>
                        <TableCell>{booking?.slotDate ?? "—"}</TableCell>
                        <TableCell>{TimeDisplay(booking?.startTime)} - {TimeDisplay(booking?.endTime)}</TableCell>
                        <TableCell>{booking?.requestedBy ?? "—"}</TableCell>
                        <TableCell>{booking?.requestedAt ? DateTimeDisplay(booking?.requestedAt) : "—"}</TableCell>
                        <TableCell>
                          <Badge variant={getBadgeVarient(booking.status!)}>
                            {booking.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">{booking?.priorityScore ?? "—"}</TableCell>
                        <TableCell>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm">
                                        <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="min-w-30">
                                    <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        className="w-full"
                                        onClick={() => {
                                          setSelectedBookingId(booking?.bookingId ?? null);
                                          setDetailsOpen(true);
                                        }}
                                    >
                                        View Details
                                    </Button>
                                    
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </TableCell>
                       
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
        </CardContent>
        {bookingsQuery.data && (
          <CardContent className="pt-0">
            <div className="flex items-center justify-between border-t pt-4">
              <div className="text-sm text-muted-foreground">
                Showing {filteredItems.length} of {bookingsQuery.data.totalElements}{" "}
                game booking items
                {bookingsQuery.data.totalPages! > 1 && (
                  <span className="ml-2">
                    (Page {bookingsQuery.data.pageable?.pageNumber! + 1} of{" "}
                    {bookingsQuery.data.totalPages})
                  </span>
                )}
              </div>
              {bookingsQuery.data.totalPages! > 1 && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPageNumber(pageNumber - 1)}
                    disabled={bookingsQuery.data?.first}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPageNumber(pageNumber + 1)}
                    disabled={bookingsQuery.data?.last}
                  >
                    Next
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        )}
      </Card>

      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent>
            {selectedBookingId && items.find(item => item.bookingId === selectedBookingId)?.participants?.length ? (
                <>
                    <h2 className="text-lg font-bold">Booking Details : {selectedBookingId}</h2>
                    <div className="rounded-lg bg-gray-100 flex flex-col p-4">
                        <Label htmlFor="booking-members">Booking Participants</Label>
                        <div id="booking-members" className="mt-4 space-y-2">
                            {items.find(item => item.bookingId === selectedBookingId)?.participants?.map((participant, userId) => (
                                <div className="flex gap-3 items-center" key={userId}>
                                    <User2 className="h-4 w-4" />
                                    <div className="flex flex-col justify-start items-start">
                                        <p className="text-sm font-medium">{participant.name}</p>
                                        <p className="text-xs text-muted-foreground">{participant.email}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            ) : (
                <div className="flex flex-col items-center justify-center py-10 gap-4">
                    <p className="text-muted-foreground">No participant details available for this booking.</p>
                </div>
            )}
            
        </DialogContent>
      </Dialog>
    </div>
  );
};
