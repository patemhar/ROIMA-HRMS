import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Wallet, Upload, Trash2, X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { useAuth } from "@/store";
import { hasPermission, PermissionCode } from "@/constants/permissions";
import { useGetExpenses, useApproveExpense, useRejectExpense, useDeleteExpense, useDeleteExpenseDocument, useUploadExpenseDocs, useAddExpense } from "@/hooks/travel/travel.hooks";
import { toast } from "sonner";
import { getErrorMessage } from "@/utils/error";
import { travelService } from "@/services/travelService";
import { useForm, Controller } from "react-hook-form";
import { useQueries } from "@tanstack/react-query";
import { useTravelById } from "@/hooks/travel/travel.hooks";
import { useGetAllUsers } from "@/hooks/util/util.hooks";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const ExpenseManagement = () => {
  const { id: travelId } = useParams<{ id: string }>();
  
  const navigate = useNavigate();
  const user = useAuth((state) => state.auth.user);

  const permissions = user?.permission;
  const canApproveExpenses = hasPermission(
    permissions,
    PermissionCode.TRAVEL_APPROVE,
  );

  const expenseQuery = useGetExpenses(travelId!);
  const expenses = expenseQuery.data;

  const travelQuery = useTravelById(travelId!);
  const travel = travelQuery.data;

  const usersQuery = useGetAllUsers();
  const users = usersQuery.data;

  const isHR = user?.role === "HR";
  const isTravelMember = travel?.travelMembers?.some(member => member.member_id === user?.id);

  const [approveMessages, setApproveMessages] = useState(new Map<string, string>());
  const [rejectMessages, setRejectMessages] = useState(new Map<string, string>());
  const [uploadFilesMap, setUploadFilesMap] = useState(new Map<string, File[]>());
  const [uploadInputKeys, setUploadInputKeys] = useState(new Map<string, number>());

  const approveExpense = useApproveExpense();
  const rejectExpense = useRejectExpense();
  const deleteExpense = useDeleteExpense();
  const deleteExpenseDocument = useDeleteExpenseDocument();
  const uploadExpenseDocs = useUploadExpenseDocs();

  const documentsQueries = useQueries({
    queries: (expenses ?? []).map(expense => ({
      queryKey: ['expense-docs', expense.id],
      queryFn: async () => {
        const res = await travelService.getExpenseDocs(expense.id!);
        if (!res.success) throw new Error(res.errors || "Failed");
        return res.data ?? [];
      },
      enabled: !!expense.id,
    })),
  });

  const handleApproveExpense = async (expenseId: string) => {
    const message = approveMessages.get(expenseId) || "";
    try {
      const response = await approveExpense.mutateAsync({ expenseId, travelId: travelId!, data: message });
      toast.success(response.message || "Expense approved successfully.");
      setApproveMessages(prev => { const m = new Map(prev); m.delete(expenseId); return m; });
      expenseQuery.refetch();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleRejectExpense = async (expenseId: string) => {
    const message = rejectMessages.get(expenseId) || "";
    try {
      const response = await rejectExpense.mutateAsync({ expenseId, travelId: travelId!, data: message });
      toast.success(response.message || "Expense rejected successfully.");
      setRejectMessages(prev => { const m = new Map(prev); m.delete(expenseId); return m; });
      expenseQuery.refetch();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleDeleteExpense = async (expenseId: string) => {
    try {
      await deleteExpense.mutateAsync({ expenseId, travelId: travelId! });
      toast.success("Expense deleted successfully");
      expenseQuery.refetch();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleDeleteDocument = async (docId: string, expenseId: string) => {
    try {
      await deleteExpenseDocument.mutateAsync({ docId, expenseId });
      toast.success("Document deleted successfully");
      documentsQueries.forEach(q => q.refetch());
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleFileSelect = (expenseId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const valid = Array.from(files).filter(f => {
      if (f.size > 10 * 1024 * 1024) { toast.error(`${f.name} is too large (max 10MB)`); return false; }
      return true;
    });
    setUploadFilesMap(prev => new Map(prev).set(expenseId, [...(prev.get(expenseId) ?? []), ...valid]));
  };

  const handleRemoveFile = (expenseId: string, index: number) => {
    setUploadFilesMap(prev => new Map(prev).set(expenseId, (prev.get(expenseId) ?? []).filter((_, i) => i !== index)));
  };

  const handleDocumentUpload = async (expenseId: string) => {
    const files = uploadFilesMap.get(expenseId) ?? [];
    if (files.length === 0) { toast.error("Please select at least one file."); return; }
    try {
      const response = await uploadExpenseDocs.mutateAsync({ expenseId, files });
      toast.success(response.message || "Documents uploaded successfully.");
      setUploadFilesMap(prev => new Map(prev).set(expenseId, []));
      setUploadInputKeys(prev => new Map(prev).set(expenseId, (prev.get(expenseId) ?? 0) + 1));
      documentsQueries.forEach(q => q.refetch());
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const [addExpenseDialogOpen, setAddExpenseDialogOpen] = useState<boolean>(false);

  const addExpense = useAddExpense();

  const {
    register: expenseRegister,
    handleSubmit: expenseSubmit,
    reset: resetExpense,
    control: expenseControl,
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

  const onExpenseSubmit = async (data: any) => {

    try {
      if (!travelId) {
        toast.error("TravelId missing");
        return;
      }

      const response = await addExpense.mutateAsync({ id: travelId, data });

      toast.success(response.message || "Expense recorded successfully!");

      setAddExpenseDialogOpen(false);
      resetExpense();
      expenseQuery.refetch();
    } catch (error) {
    }
  };

  if (expenseQuery.isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner />
      </div>
    );
  }

  if (expenseQuery.error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-destructive">Error loading expenses: {getErrorMessage(expenseQuery.error)}</p>
      </div>
    );
  }

  const groupByCurrencyAndStatus = () => {
    const groups: Record<string, Record<string, any[]>> = {};
    expenses?.forEach(expense => {
      const currency = expense.currency || 'INR';
      const status = expense.status || 'DRAFT';
      if (!groups[currency]) groups[currency] = {};
      if (!groups[currency][status]) groups[currency][status] = [];
      groups[currency][status].push(expense);
    });
    return groups;
  };

  const groupedExpenses = groupByCurrencyAndStatus();

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4 justify-center">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-semibold">Expense Management</h1>
          </div>
        </div>
      </div>

      <div className="flex justify-end mb-4">
        {(isHR || isTravelMember) && (
          <Dialog
            open={addExpenseDialogOpen}
            onOpenChange={(open) => {
              setAddExpenseDialogOpen(open);
              if (!open) resetExpense();
            }}
          >
            <DialogTrigger asChild>
              <Button className="bg-black text-white">
                <Plus className="h-4 w-4 mr-2" />
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

            <form
              onSubmit={expenseSubmit(onExpenseSubmit)}
              className="space-y-5 py-4"
            >
              <div className="grid gap-4">
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

                <div className="space-y-2">
                  <Label>Paid By *</Label>
                  <Controller
                    name="paid_by"
                    control={expenseControl}
                    rules={{ required: "Please select an employee" }}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger className={expenseErrors.paid_by ? "border-destructive" : ""}>
                          <SelectValue placeholder="Select employee" />
                        </SelectTrigger>
                        <SelectContent>
                          {users?.map(user => (
                            <SelectItem key={user.userId} value={user.userId!}>
                              {user.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
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
                  onClick={() => setAddExpenseDialogOpen(false)}
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
        )}
      </div>

      {expenses && expenses.length > 0 && (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-muted-foreground font-medium">Total Expenses by Currency</p>
              <div className="bg-primary/10 p-4 rounded-full">
                <Wallet className="h-8 w-8 text-primary" />
              </div>
            </div>
            <div className="space-y-4">
              {Object.entries(groupedExpenses).map(([currency, statusGroups]) => {
                const getTotal = (statuses: string[]) => {
                  return statuses.reduce((sum, status) => {
                    const expenses = statusGroups[status] || [];
                    return sum + expenses.reduce((s, e) => s + (e.amount || 0), 0);
                  }, 0);
                };

                const total = getTotal(['APPROVED', 'SUBMITTED', 'REJECTED']);
                const approved = getTotal(['APPROVED']);
                const pending = getTotal(['SUBMITTED']);
                const rejected = getTotal(['REJECTED']);
                
                return (
                  <div key={currency} className="border-b pb-4 last:border-0 last:pb-0">
                    <p className="text-2xl font-bold text-primary mb-2">
                      {total.toFixed(2)} <span className="text-lg text-muted-foreground">{currency}</span>
                    </p>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Approved</p>
                        <p className="font-semibold text-green-600">{approved.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Pending</p>
                        <p className="font-semibold text-yellow-600">{pending.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Rejected</p>
                        <p className="font-semibold text-red-600">{rejected.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Expenses ({expenses?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {expenses && expenses.length > 0 ? (
            <div className="space-y-4">
              {expenses.map((expense, idx) => {
                const expenseId = expense.id;
                const approveMessage = approveMessages.get(expenseId!) || "";
                const rejectMessage = rejectMessages.get(expenseId!) || "";
                const uploadFiles = uploadFilesMap.get(expenseId!) || [];
                const uploadInputKey = uploadInputKeys.get(expenseId!) || 0;
                const docsQuery = documentsQueries[idx];
                const documents = docsQuery?.data;
                const isDocsLoading = docsQuery?.isLoading;

                return (
                  <div key={expense.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 border rounded-xl bg-card hover:shadow-sm transition-shadow gap-4">
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
                              {expense.paid_by?.substring(39) || "Unknown Employee"}
                            </span>
                          </p>
                          { expense.status != "SUBMITTED" && (
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
                                {expense.approved_by?.substring(39) || "Pending Approval"}
                              </span>
                            </p>
                          )}
                        </div>

                        {expense.remark && (
                          <p className="text-xs bg-muted/50 p-2 rounded mt-2 border-l-2 border-primary/30">
                            <span className="font-semibold">Remark:</span>{" "}
                            {expense.remark}
                          </p>
                        )}

                        {(isHR || isTravelMember) && expenseId && (
                          <div className="mt-4 space-y-4">
                            <div className="flex items-center gap-2">
                              <Input
                                key={uploadInputKey}
                                id={`doc-upload-${expenseId}`}
                                type="file"
                                multiple
                                accept="image/*,application/pdf"
                                onChange={(e) => handleFileSelect(expenseId, e)}
                                className="hidden"
                              />
                              <label htmlFor={`doc-upload-${expenseId}`} className="cursor-pointer">
                                <Button variant="outline" size="sm" asChild>
                                  <span>
                                    <Upload className="h-4 w-4 mr-2" />
                                    Upload Documents
                                  </span>
                                </Button>
                              </label>
                            </div>
                            {uploadFiles.length > 0 && (
                              <div className="space-y-2">
                                <p className="text-sm font-medium">Selected files ({uploadFiles.length}):</p>
                                <div className="space-y-2 max-h-24 overflow-y-auto">
                                  {uploadFiles.map((file, index) => (
                                    <div key={index} className="flex items-center justify-between p-2 bg-muted rounded text-sm">
                                      <span className="truncate">{file.name}</span>
                                      <Button type="button" variant="ghost" size="sm" onClick={() => handleRemoveFile(expenseId, index)}>
                                        <X className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  ))}
                                </div>
                                <Button
                                  onClick={() => handleDocumentUpload(expenseId)}
                                  size="sm"
                                  disabled={uploadExpenseDocs.isPending || uploadFiles.length === 0}
                                >
                                  {uploadExpenseDocs.isPending ? "Uploading..." : "Upload Documents"}
                                </Button>
                              </div>
                            )}
                          </div>
                        )}

                        {expenseId && (
                          <div className="space-y-2 mt-2">
                            {isDocsLoading ? (
                              <p className="text-sm text-muted-foreground">Loading documents...</p>
                            ) : documents && documents.length > 0 ? (
                              <>
                                <p className="text-sm font-medium">Attached Documents ({documents.length}):</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                  {documents.map((doc) => (
                                    <div key={doc.id} className="flex items-center justify-between p-2 border rounded text-sm">
                                      <div className="flex items-center gap-2 flex-1 min-w-0">
                                        <a href={doc.docUrl || "#"} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline truncate">
                                          {doc.docUrl || "Document"}
                                        </a>
                                      </div>
                                      {(isHR || doc.uploadedBy === user?.id) && (
                                        <Button
                                          type="button"
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => doc.id && handleDeleteDocument(doc.id, expenseId)}
                                          disabled={!doc.id || deleteExpenseDocument.isPending}
                                          className="text-red-600 hover:bg-red-50 shrink-0"
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </>
                            ) : null}
                          </div>
                        )}
                      </div>
                    </div>

                    {expense.status === "SUBMITTED" && canApproveExpenses && (expense.paid_by?.substring(0, 36) != user?.id) && (
                      <div className="flex items-center gap-2 self-end md:self-center">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="outline" className="text-red-600 hover:bg-red-50">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Expense?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the expense and all associated documents.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteExpense(expenseId || "")} className="bg-red-600 hover:bg-red-700">
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="outline" className="text-green-600 hover:bg-green-50">
                              Approve
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Approve Expense?</AlertDialogTitle>
                              <AlertDialogDescription>Add a message or remark for this approval.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <div className="space-y-2 py-2">
                              <Label htmlFor={`approveMsg-${expenseId}`}>Approval Message</Label>
                              <Input
                                id={`approveMsg-${expenseId}`}
                                placeholder="e.g., Valid travel expense"
                                value={approveMessage}
                                onChange={(e) => setApproveMessages(prev => new Map(prev).set(expenseId!, e.target.value))}
                              />
                            </div>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleApproveExpense(expenseId || "")} className="bg-green-600 hover:bg-green-700">
                                Confirm
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="outline" className="text-destructive border-destructive/20 hover:bg-destructive/5">
                              Reject
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Reject Expense?</AlertDialogTitle>
                              <AlertDialogDescription>Please provide a reason for rejection.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <div className="space-y-2 py-2">
                              <Label htmlFor={`rejectMsg-${expenseId}`}>Reason for Rejection</Label>
                              <Input
                                id={`rejectMsg-${expenseId}`}
                                placeholder="e.g., Missing receipt"
                                value={rejectMessage}
                                onChange={(e) => setRejectMessages(prev => new Map(prev).set(expenseId!, e.target.value))}
                              />
                            </div>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleRejectExpense(expenseId || "")} className="bg-destructive hover:bg-destructive/90">
                                Reject
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    )}
                  </div>
                );
              })}
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
  );
}


