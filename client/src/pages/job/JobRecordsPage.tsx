import { useGetJobSharingRecords, useGetReferrals } from "@/hooks/job/job.hooks";
import { useAuth } from "@/store";
import { hasPermission, PermissionCode } from "@/constants/permissions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";

export const JobRecordsPage = () => {
  const permissions = useAuth((state) => state.auth.user?.permission);
  const canReadJobRecords = hasPermission(permissions, PermissionCode.USER_MANAGE);

  const sharingRecordsQuery = useGetJobSharingRecords();
  const referralsQuery = useGetReferrals();

  if (!canReadJobRecords) {
    return (
      <div className="container mx-auto max-w-4xl py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive">Access Denied</h1>
          <p className="text-muted-foreground mt-2">You don't have permission to view job records.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-6xl py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Job Records</h1>
        <p className="text-muted-foreground mt-2">View job sharing records and referrals</p>
      </div>

      {/* Job Sharing Records */}
      <Card>
        <CardHeader>
          <CardTitle>Job Sharing Records</CardTitle>
        </CardHeader>
        <CardContent>
          {sharingRecordsQuery.isLoading ? (
            <p className="text-muted-foreground">Loading sharing records...</p>
          ) : sharingRecordsQuery.isError ? (
            <p className="text-destructive">Failed to load sharing records</p>
          ) : sharingRecordsQuery.data?.length === 0 ? (
            <p className="text-muted-foreground">No sharing records found</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Job Title</TableHead>
                  <TableHead>Shared By</TableHead>
                  <TableHead>Shared With Email</TableHead>
                  <TableHead>Created At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sharingRecordsQuery.data?.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium">{record.jobTitle}</TableCell>
                    <TableCell>{record.sharedBy}</TableCell>
                    <TableCell>{record.email}</TableCell>
                    <TableCell>{record.createdAt ? format(new Date(record.createdAt), "PPP p") : "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Referrals */}
      <Card>
        <CardHeader>
          <CardTitle>Referrals</CardTitle>
        </CardHeader>
        <CardContent>
          {referralsQuery.isLoading ? (
            <p className="text-muted-foreground">Loading referrals...</p>
          ) : referralsQuery.isError ? (
            <p className="text-destructive">Failed to load referrals</p>
          ) : referralsQuery.data?.length === 0 ? (
            <p className="text-muted-foreground">No referrals found</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Job Title</TableHead>
                  <TableHead>Referred By</TableHead>
                  <TableHead>Candidate Name</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>Document</TableHead>
                  <TableHead>Created At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {referralsQuery.data?.map((referral) => (
                  <TableRow key={referral.id}>
                    <TableCell className="font-medium">{referral.jobTitle}</TableCell>
                    <TableCell>{referral.referredBy}</TableCell>
                    <TableCell>{referral.name}</TableCell>
                    <TableCell className="max-w-xs wrap-break-words whitespace-normal">{referral.details}</TableCell>
                    <TableCell>
                      {referral.docUrl ? (
                        <a href={referral.docUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          View Document
                        </a>
                      ) : "—"}
                    </TableCell>
                    <TableCell>{referral.createdAt ? format(new Date(referral.createdAt), "PPP p") : "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};