import React, { useState } from "react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
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
} from "../ui/alert-dialog";
import { ExpenseDocumentUploadDialog } from "./ExpenseDocumentUploadDialog";
import { useApproveExpense, useRejectExpense, useGetExpenseDocs, useDeleteExpense, useDeleteExpenseDocument } from "../../hooks/travel/travel.hooks";
import { toast } from "sonner";
import { getErrorMessage } from "../../utils/error";
import type { components } from "@/types/api";
import { FileText, Trash2, Upload, Wallet } from "lucide-react";

type Schemas = components["schemas"];
type TravelExpenseResponse = Schemas["TravelExpenseResponse"];

interface ExpenseCardProps {
  travelId: string;
  expenses: TravelExpenseResponse[];
  canApproveExpenses: boolean;
}

export const ExpenseCard: React.FC<ExpenseCardProps> = ({
  travelId,
  expenses,
  canApproveExpenses,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Expenses ({expenses?.length || 0})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {expenses && expenses.length > 0 ? (
          <div className="space-y-4">
            {expenses.map((expense) => (
              <ExpenseItem
                key={expense.id}
                expense={expense}
                canApproveExpenses={canApproveExpenses}
                travelId={travelId}
              />
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
  );
};

// Component for individual expense item
export const ExpenseItem: React.FC<{
  expense: TravelExpenseResponse;
  canApproveExpenses: boolean;
  travelId: string;
}> = ({
  expense,
  canApproveExpenses,
  travelId,
}) => {
  const expenseId = expense.id;
  const [approveMessage, setApproveMessage] = useState("");
  const [rejectMessage, setRejectMessage] = useState("");

  const approveExpense = useApproveExpense();
  const rejectExpense = useRejectExpense();
  const deleteExpense = useDeleteExpense();

  const handleApproveExpense = async () => {
    if (!expenseId) {
      toast.error("Expense ID is missing.");
      return;
    }

    try {
      const response = await approveExpense.mutateAsync({
        expenseId,
        travelId,
        data: approveMessage,
      });

      toast.success(response.message || "Expense approved successfully.");
      setApproveMessage("");
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleRejectExpense = async () => {
    if (!expenseId) {
      toast.error("Expense ID is missing.");
      return;
    }

    try {
      const response = await rejectExpense.mutateAsync({
        expenseId,
        travelId,
        data: rejectMessage,
      });

      toast.success(response.message || "Expense Rejected successfully.");
      setRejectMessage("");
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleDeleteExpense = async () => {
    if (!expenseId) {
      toast.error("Expense ID is missing.");
      return;
    }

    try {
      await deleteExpense.mutateAsync({
        expenseId,
        travelId,
      });
      toast.success("Expense deleted successfully");
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between p-4 border rounded-xl bg-card hover:shadow-sm transition-shadow gap-4">
      <div className="flex items-start gap-4">
        <div className="mt-1 bg-primary/10 p-2 rounded-lg">
          <Wallet className="h-5 w-5 text-primary" />
        </div>
        <div className="space-y-1 flex-1">
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

          {/* Document Upload Section */}
          <div className="mt-4 space-y-2">
            <ExpenseDocumentUploadDialog expenseId={expenseId ?? ""}>
              <Button variant="outline" size="sm">
                <Upload className="h-4 w-4 mr-2" />
                Upload Documents
              </Button>
            </ExpenseDocumentUploadDialog>

            {/* Display existing documents */}
            {expenseId && <ExpenseDocuments expenseId={expenseId} />}
          </div>
        </div>
      </div>

      {expense.status == "SUBMITTED" && canApproveExpenses && (
        <div className="flex items-center gap-2 self-end md:self-center">
          {/* Delete Expense */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                size="sm"
                variant="outline"
                className="text-red-600 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  Delete Expense?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the expense and all associated documents.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteExpense}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Approve */}
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
                  value={approveMessage}
                  onChange={(e) => setApproveMessage(e.target.value)}
                />
              </div>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleApproveExpense}
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
                  value={rejectMessage}
                  onChange={(e) => setRejectMessage(e.target.value)}
                />
              </div>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleRejectExpense}
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
  );
};

// Component to display expense documents
const ExpenseDocuments: React.FC<{ expenseId: string }> = ({ expenseId }) => {
  const { data: documents, isLoading } = useGetExpenseDocs(expenseId);
  const deleteExpenseDocument = useDeleteExpenseDocument();

  const handleDeleteDocument = async (docId: string) => {
    try {
      await deleteExpenseDocument.mutateAsync({
        docId,
        expenseId,
      });
      toast.success("Document deleted successfully");
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading documents...</p>;
  }

  if (!documents || documents.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">Attached Documents ({documents.length}):</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {documents.map((doc) => (
          <div
            key={doc.id}
            className="flex items-center justify-between p-2 border rounded text-sm"
          >
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <Upload className="h-4 w-4 text-muted-foreground shrink-0" />
              <a
                href={doc.docUrl || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline truncate"
              >
                {doc.docUrl?.split('/').pop() || "Document"}
              </a>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => doc.id && handleDeleteDocument(doc.id)}
              disabled={!doc.id || deleteExpenseDocument.isPending}
              className="text-red-600 hover:bg-red-50 shrink-0"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};