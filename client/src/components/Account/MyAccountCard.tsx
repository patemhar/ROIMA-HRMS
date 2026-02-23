import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User, Edit2, Save, X } from "lucide-react";
import { useAccountDetails, useUpdateMyUser } from "@/hooks/user/user.hooks";
import { toast } from "sonner";
import { getErrorMessage } from "@/utils/error";
import { DateTimeDisplay } from "@/utils/dateUtils";

export function MyAccountCard() {
  const [isEditingAccount, setIsEditingAccount] = useState(false);
  const [accountForm, setAccountForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
  });

  // Queries
  const accountQuery = useAccountDetails();
  const accountDetails = accountQuery.data;

  // Mutations
  const updateMyUserMutation = useUpdateMyUser();

  useEffect(() => {
    if (!accountDetails) return;
    setAccountForm({
      firstName: accountDetails.first_name ?? "",
      lastName: accountDetails.last_name ?? "",
      email: accountDetails.email ?? "",
    });
  }, [accountDetails]);

  const handleSaveAccount = async () => {
    try {
      await updateMyUserMutation.mutateAsync({
        firstName: accountForm.firstName,
        lastName: accountForm.lastName,
        email: accountForm.email,
      });
      toast.success("Account updated successfully");
      setIsEditingAccount(false);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="h-5 w-5" />
            <CardTitle>My Account</CardTitle>
          </div>
          {!isEditingAccount && (
            <button
              onClick={() => setIsEditingAccount(true)}
              className="p-2 hover:bg-accent rounded-md transition-colors"
              title="Edit account"
            >
              <Edit2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isEditingAccount ? (
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={accountForm.firstName}
                  onChange={(e) =>
                    setAccountForm((p) => ({
                      ...p,
                      firstName: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={accountForm.lastName}
                  onChange={(e) =>
                    setAccountForm((p) => ({
                      ...p,
                      lastName: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={accountForm.email}
                onChange={(e) =>
                  setAccountForm((p) => ({ ...p, email: e.target.value }))
                }
              />
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditingAccount(false);
                  setAccountForm({
                    firstName: accountDetails?.first_name ?? "",
                    lastName: accountDetails?.last_name ?? "",
                    email: accountDetails?.email ?? "",
                  });
                }}
                disabled={updateMyUserMutation.isPending}
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button
                onClick={handleSaveAccount}
                disabled={updateMyUserMutation.isPending}
              >
                <Save className="h-4 w-4 mr-2" />
                {updateMyUserMutation.isPending ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Name</Label>
              <p className="text-sm font-medium">
                {accountDetails?.first_name} {accountDetails?.last_name}
              </p>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Email</Label>
              <p className="text-sm font-medium">{accountDetails?.email}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Role</Label>
              <p className="text-sm font-medium">{accountDetails?.role}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">
                Last Login
              </Label>
              <p className="text-sm font-medium">
                {accountDetails?.last_login ? DateTimeDisplay(accountDetails?.last_login) : "—"}
              </p>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Reports To</Label>
              <p className="text-sm font-medium">{accountDetails?.reports_to || "None"}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}