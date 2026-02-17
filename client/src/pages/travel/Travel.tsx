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
import { useGetAllTravels } from "@/hooks/travel/travel.hooks";
import { getErrorMessage } from "@/utils/error";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

export const Travel = () => {
  const navigate = useNavigate();

  const getAllTravelsquery = useGetAllTravels();

  const items = getAllTravelsquery.data ?? [];

  const handleRowClick = (id?: string) => {
    if (!id) return;
    navigate(`${id}`);
  };

  return (
    <div className="space-y-6">
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
