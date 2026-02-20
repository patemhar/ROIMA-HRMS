import React, { useState } from "react";
import { useMyProfile, useUpdateMyProfile } from "@/hooks/user/user.hooks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Spinner } from "../ui/spinner";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { User, Edit2, Save, X } from "lucide-react";
import { getErrorMessage } from "@/utils/error";

export function ProfileInfoCard() {
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    phone: "",
    bio: "",
    location: "",
  });

  // Fetch profile data
  const {
    data: profile,
    isLoading: profileLoading,
    error: profileError,
  } = useMyProfile();

  // Update profile mutation
  const updateProfile = useUpdateMyProfile();

  // Initialize form data when profile loads
  React.useEffect(() => {
    if (profile) {
      setFormData({
        phone: profile?.phone || "",
        bio: profile?.bio || "",
        location: profile?.location || "",
      });
    }
  }, [profile]);

  const handleInputChange =
    (field: keyof typeof formData) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({
        ...prev,
        [field]: e.target.value,
      }));
    };

  const handleSave = async () => {
    try {
      await updateProfile.mutateAsync({
        phone: formData.phone.trim(),
        bio: formData.bio.trim(),
        location: formData.location.trim(),
      });
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update profile:", error);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setFormData({
        phone: profile.phone || "",
        bio: profile.bio || "",
        location: profile.location || "",
      });
    }
    setIsEditing(false);
  };

  if (profileLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Spinner />
        </CardContent>
      </Card>
    );
  }

  if (profileError) {
    return (
      <Card>
        <CardContent className="py-8">
          <Alert variant="destructive">
            <AlertDescription>
              Failed to load profile information. Please try again later.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (!profile) {
    return (
      <Card>
        <CardContent className="py-8">
          <Alert>
            <AlertDescription>
              No profile information available.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <CardTitle>User Profile</CardTitle>
          </div>
          {!isEditing && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="flex items-center space-x-1"
            >
              <Edit2 className="h-4 w-4" />
              <span>Edit</span>
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Display Mode */}
        {!isEditing && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  Profile Id
                </Label>
                <p className="text-sm font-medium">
                  {profile.id || "Not provided"}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  User Id
                </Label>
                <p className="text-sm font-medium">
                  {profile.userId || "Not provided"}
                </p>
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium text-muted-foreground">
                Emp Number
              </Label>
              <p className="text-sm font-medium">{profile.empNumber}</p>
            </div>

            <div>
              <Label className="text-sm font-medium text-muted-foreground">
                Phone Number
              </Label>
              <p className="text-sm font-medium">
                {profile.phone || "Not provided"}
              </p>
            </div>

            <div>
              <Label className="text-sm font-medium text-muted-foreground">
                Bio
              </Label>
              <div className="flex flex-wrap gap-1 mt-1">{profile.bio}</div>
            </div>

            <div>
              <Label className="text-sm font-medium text-muted-foreground">
                Location
              </Label>
              <div className="flex flex-wrap gap-1 mt-1">
                {profile.location}
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium text-muted-foreground">
                Joined Date
              </Label>
              <div className="flex flex-wrap gap-1 mt-1">
                {profile.joinedDate}
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium text-muted-foreground">
                Department
              </Label>
              <div className="flex flex-wrap gap-1 mt-1">
                {profile.departmentId} - {profile.departmentName}
              </div>
            </div>
          </div>
        )}

        {/* Edit Mode */}
        {isEditing && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">First Name</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={handleInputChange("phone")}
                  placeholder="Enter your phone"
                  type="tel"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Bio</Label>
                <Input
                  id="lastName"
                  value={formData.bio}
                  onChange={handleInputChange("bio")}
                  placeholder="Enter your bio"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Location</Label>
              <Input
                id="phoneNumber"
                value={formData.location}
                onChange={handleInputChange("location")}
                placeholder="Enter your location"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-2 pt-4">
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={updateProfile.isPending}
                className="flex items-center space-x-1"
              >
                <X className="h-4 w-4" />
                <span>Cancel</span>
              </Button>
              <Button
                onClick={handleSave}
                disabled={updateProfile.isPending}
                className="flex items-center space-x-1"
              >
                {updateProfile.isPending ? (
                  <Spinner />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                <span>
                  {updateProfile.isPending ? "Saving..." : "Save Changes"}
                </span>
              </Button>
            </div>
          </div>
        )}

        {/* Error Display */}
        {updateProfile.error && (
          <Alert variant="destructive">
            <AlertDescription>
              {getErrorMessage(updateProfile.error) ||
                "Failed to update profile. Please try again."}
            </AlertDescription>
          </Alert>
        )}

        {/* Success Message */}
        {updateProfile.isSuccess && !isEditing && (
          <Alert>
            <AlertDescription>
              {updateProfile.data?.message || "Profile updated successfully!"}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
