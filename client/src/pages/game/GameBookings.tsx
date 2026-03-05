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
import { useDebounce } from "@/hooks/useDebounce";
import { getErrorMessage } from "@/utils/error";
import { Badge } from "@/components/ui/badge"; 
import { useEffect, useState } from "react";
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
import { MoreHorizontal, User2, Filter, Calendar } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useAuth } from "@/store";
import { hasPermission, PermissionCode } from "@/constants/permissions";
import { Checkbox } from "@/components/ui/checkbox";
import type { components } from "@/types/api";
type Schemas = components["schemas"];

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

const statusOptions = [
  { label: "All Statuses", value: "ALL" },
  { label: "Pending", value: "PENDING" },
  { label: "Confirmed", value: "CONFIRMED" },
  { label: "Cancelled", value: "CANCELLED" },
  { label: "Expired", value: "EXPIRED" },
];

const sortOptions = [
  { value: "u.first_name", label: "User Name" },
  { value: "sbr.requestedAt", label: "Requested At" },
  { value: "s.slotDate", label: "Slot Date" },
  { value: "sbr.priorityScore", label: "Priority Score" },
]

export const GameBookings = () => {

  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);

  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [status, setStatus] = useState("ALL");
  const [sortBy, setSortBy] = useState<string>(sortOptions[1].value);
  const [sortDir, setSortDir] = useState<string>("desc");
  const [myRequestsOnly, setMyRequestsOnly] = useState(true);

  const permissions = useAuth((state) => state.auth.user?.permission);
  const isAdmin = hasPermission(permissions, PermissionCode.ADMIN_VIEW);
  
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const debouncedStartDate = useDebounce(startDate, 800);
  const debouncedEndDate = useDebounce(endDate, 800);

  const bookingsQuery = useGetAllGameBookingRequests(
    pageNumber,
    pageSize,
    debouncedSearchTerm,
    debouncedStartDate || undefined,
    debouncedEndDate || undefined,
    status === "ALL" ? undefined : status,
    sortBy,
    sortDir,
    myRequestsOnly
  );

  const items = bookingsQuery.data?.content || [];

  useEffect(() => {
    setPageNumber(1);
  }, [debouncedSearchTerm, debouncedStartDate, debouncedEndDate, status, sortBy, sortDir, myRequestsOnly]);

  const handleClearFilters = () => {
    setSearchTerm("");
    setStartDate("");
    setEndDate("");
    setStatus("ALL");
    setSortBy(sortOptions[1].value);
    setSortDir("desc");
    setPageNumber(1);
  };

  const hasActiveFilters = searchTerm || startDate || endDate || status === "ALL" ? false : true;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex flex-col">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Calendar className="h-6 w-6" />
              Game Bookings
            </h1>
            <p className="text-muted-foreground mt-1">
            View and manage all game booking requests
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
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              <CardTitle>Filters & Options</CardTitle>
            </div>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={handleClearFilters}>
                Clear Filters
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search Input */}
            <div className="space-y-2">
              <Label htmlFor="search-input" className="text-sm font-medium">
                Search
              </Label>
              <Input
                id="search-input"
                placeholder="Search by user name or booking details..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Status Filter */}
            <div className="space-y-2">
              <Label htmlFor="status-filter" className="text-sm font-medium">
                Status
              </Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger id="status-filter">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent className="bg-emerald-50">
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Start Date */}
            <div className="space-y-2">
              <Label htmlFor="start-date" className="text-sm font-medium">
                Start Date
              </Label>
              <Input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            {/* End Date */}
            <div className="space-y-2">
              <Label htmlFor="end-date" className="text-sm font-medium">
                End Date
              </Label>
              <Input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate}
              />
            </div>

            {/* My Requests Only Checkbox */}
            { isAdmin && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">View Options</Label>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="my-requests-only"
                    checked={myRequestsOnly}
                    onCheckedChange={(checked) => setMyRequestsOnly(checked as boolean)}
                  />
                  <Label htmlFor="my-requests-only" className="text-sm cursor-pointer font-normal">
                    My Requests Only
                  </Label>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-between flex-wrap items-center gap-4 pt-4 border-t">
            {/* Sort Options */}
            <div className="flex gap-3 items-center flex-wrap">
              <Label className="text-xs text-muted-foreground">Sort by:</Label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-emerald-50">
                  {sortOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortDir} onValueChange={setSortDir}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-emerald-50">
                  <SelectItem value="asc">Ascending</SelectItem>
                  <SelectItem value="desc">Descending</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Page Size */}
            <div className="flex items-center gap-2">
              <Label htmlFor="pageSize" className="text-xs text-muted-foreground">
                Per page:
              </Label>
              <Select
                value={String(pageSize)}
                onValueChange={(value) => {
                  setPageSize(Number(value));
                  setPageNumber(1);
                }}
              >
                <SelectTrigger id="pageSize" className="w-20">
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Booking Requests</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
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
                      <TableCell colSpan={9} className="text-center py-8">
                        <p className="text-destructive">
                          {getErrorMessage(bookingsQuery.error) ||
                            "Failed to load bookings"}
                        </p>
                      </TableCell>
                    </TableRow>
                  )}

                  {!bookingsQuery.isLoading &&
                    !bookingsQuery.isError &&
                    items.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-8">
                          <p className="text-muted-foreground">
                            No game booking records found
                          </p>
                        </TableCell>
                      </TableRow>
                    )}

                  {items.map((booking) => {
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
                Showing {items.length} of {bookingsQuery.data.totalElements}{" "}
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
