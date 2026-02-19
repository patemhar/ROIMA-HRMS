import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Briefcase,
  CalendarDays,
  MapPin,
  Plus,
  Search,
  Share,
  User,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { DateTimeDisplay } from "@/utils/dateUtils";
import { getErrorMessage } from "@/utils/error";
import {
  useCreateJob,
  useGetAllActiveJobs,
  useRefferFriend,
  useShareJob,
} from "@/hooks/job/job.hooks";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

export const JobListPage = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [shareJobOpen, setShareJobOpen] = useState(false);
  const [shareJobId, setShareJobId] = useState<string>();
  const [recipientMails, setRecipienMails] = useState<string[]>([]);

  const [referFriendOpen, setReferFriendOpen] = useState<boolean>(false);

  const [createForm, setCreateForm] = useState({
    title: "",
    description: "",
    department: "",
    location: "",
    employmentType: "",
    experienceLevel: "",
    salaryMin: "",
    salaryMax: "",
    jobResponsibilities: "",
    requiredQualifications: "",
    applicationDeadline: "",
    defaultReviewerId: "",
  });

  const [refferForm, setRefferForm] = useState({
    jobId: "",
    friendName: "",
    friendEmail: "",
    note: "",
  });

  const [cvFile, setCvFile] = useState<File | null>();

  const jobQuery = useGetAllActiveJobs();
  const jobs = jobQuery.data || [];

  const createMutation = useCreateJob();

  const shareJobMutation = useShareJob();

  const refferMutation = useRefferFriend();

  const handleShareJobPosition = async () => {
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      if (!shareJobId || recipientMails.length == 0) {
        setErrorMessage("Missing data");
        return;
      }

      const response = await shareJobMutation.mutateAsync({
        jobId: shareJobId,
        recipientEmail: recipientMails,
      });

      setSuccessMessage(response.message || "Job position shared successfully");
      setShareJobOpen(false);
      setShareJobId("");
      setRecipienMails([]);
    } catch (error) {
      setErrorMessage(
        getErrorMessage(error) || "Failed to create job position",
      );
    }
  };

  const handleCreatePosition = async () => {
    setSuccessMessage(null);
    setErrorMessage(null);
    try {
      const response = await createMutation.mutateAsync({
        title: createForm.title,
        description: createForm.description,
        department_id: createForm.department,
        location: createForm.location,
        employment_type: createForm.employmentType,
        min_experience: createForm.experienceLevel,
        salary_range:
          createForm.salaryMin && createForm.salaryMax
            ? `${createForm.salaryMin}-${createForm.salaryMax}`
            : undefined,
        status: "OPEN",
        application_deadline: createForm.applicationDeadline
          ? createForm.applicationDeadline
          : undefined,
        job_responsibilities: createForm.jobResponsibilities,
        required_qualification: createForm.requiredQualifications,
        default_reviewer_id: createForm.defaultReviewerId,
      });

      setSuccessMessage(
        response.message || "Job position created successfully",
      );

      setIsCreateDialogOpen(false);
      setCreateForm({
        title: "",
        description: "",
        department: "",
        location: "",
        employmentType: "",
        experienceLevel: "",
        salaryMin: "",
        salaryMax: "",
        jobResponsibilities: "",
        requiredQualifications: "",
        applicationDeadline: "",
        defaultReviewerId: "",
      });
    } catch (error) {
      setErrorMessage(
        getErrorMessage(error) || "Failed to create job position",
      );
    }
  };

  const handleRefferFriend = async () => {
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      const data = new FormData();
      data.append("jobId", refferForm.jobId);
      data.append("friendName", refferForm.friendName);
      data.append("friendEmail", refferForm.friendEmail);
      data.append("note", refferForm.note);

      if (cvFile) {
        data.append("cvFile", cvFile);
      }

      const response = await refferMutation.mutateAsync(data);

      setSuccessMessage(response.message || "Friend Reffered successfully");
      setReferFriendOpen(false);
      setRefferForm({
        jobId: "",
        friendName: "",
        friendEmail: "",
        note: "",
      });
    } catch (error) {
        setReferFriendOpen(false)
      setErrorMessage(
        getErrorMessage(error) || "Failed to create job position",
      );
    }
  };

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setRefferForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="space-y-6">
      {successMessage && (
        <div className="bg-green-50 text-green-800 p-3 rounded-md text-sm">
          {successMessage}
        </div>
      )}
      {errorMessage && (
        <div className="bg-red-50 text-red-800 p-3 rounded-md text-sm">
          {errorMessage}
        </div>
      )}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Explore roles</h1>
          <p className="text-muted-foreground">
            Find openings that org currently have.
          </p>
        </div>
      </div>

      <div className="flex justify-between">
        {/* Create Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Position
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Job Position</DialogTitle>
              <DialogDescription>
                Fill in the details to create a new job position.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="create-title">Title *</Label>
                  <Input
                    id="create-title"
                    value={createForm.title}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, title: e.target.value })
                    }
                    placeholder="e.g. Senior Software Engineer"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="create-department">Department *</Label>
                  <Input
                    id="create-department"
                    value={createForm.department}
                    onChange={(e) =>
                      setCreateForm({
                        ...createForm,
                        department: e.target.value,
                      })
                    }
                    placeholder="e.g. Engineering"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="default-reviewer">Default Reviewer *</Label>
                  <Input
                    id="default-reviewer"
                    value={createForm.defaultReviewerId}
                    onChange={(e) =>
                      setCreateForm({
                        ...createForm,
                        defaultReviewerId: e.target.value,
                      })
                    }
                    placeholder="revierer id"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="create-location">Location</Label>
                  <Input
                    id="create-location"
                    value={createForm.location}
                    onChange={(e) =>
                      setCreateForm({
                        ...createForm,
                        location: e.target.value,
                      })
                    }
                    placeholder="e.g. New York, NY"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="create-employment-type">
                    Employment Type
                  </Label>
                  <Select
                    value={createForm.employmentType}
                    onValueChange={(value) =>
                      setCreateForm({ ...createForm, employmentType: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent className="bg-emerald-50">
                      <SelectItem value="Full-time">Full-time</SelectItem>
                      <SelectItem value="Part-time">Part-time</SelectItem>
                      <SelectItem value="Contract">Contract</SelectItem>
                      <SelectItem value="Internship">Internship</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="create-experience-level">
                    Experience Level
                  </Label>
                  <Select
                    value={createForm.experienceLevel}
                    onValueChange={(value) =>
                      setCreateForm({ ...createForm, experienceLevel: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent className="bg-emerald-50">
                      <SelectItem value="Entry">Entry Level</SelectItem>
                      <SelectItem value="Mid">Mid Level</SelectItem>
                      <SelectItem value="Senior">Senior Level</SelectItem>
                      <SelectItem value="Lead">Lead/Principal</SelectItem>
                      <SelectItem value="Executive">Executive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="create-salary-min">Salary Min</Label>
                  <Input
                    id="create-salary-min"
                    type="number"
                    value={createForm.salaryMin}
                    onChange={(e) =>
                      setCreateForm({
                        ...createForm,
                        salaryMin: e.target.value,
                      })
                    }
                    placeholder="e.g. 80000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="create-salary-max">Salary Max</Label>
                  <Input
                    id="create-salary-max"
                    type="number"
                    value={createForm.salaryMax}
                    onChange={(e) =>
                      setCreateForm({
                        ...createForm,
                        salaryMax: e.target.value,
                      })
                    }
                    placeholder="e.g. 120000"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-application-deadline">
                  Application Deadline
                </Label>
                <Input
                  id="create-application-deadline"
                  type="date"
                  value={createForm.applicationDeadline}
                  onChange={(e) =>
                    setCreateForm({
                      ...createForm,
                      applicationDeadline: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-description">Description</Label>
                <textarea
                  id="create-description"
                  value={createForm.description}
                  onChange={(e) =>
                    setCreateForm({
                      ...createForm,
                      description: e.target.value,
                    })
                  }
                  placeholder="Job description..."
                  rows={4}
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-job-responsibilities">
                  Job Responsibilities
                </Label>
                <textarea
                  id="create-job-responsibilities"
                  value={createForm.jobResponsibilities}
                  onChange={(e) =>
                    setCreateForm({
                      ...createForm,
                      jobResponsibilities: e.target.value,
                    })
                  }
                  placeholder="Job responsibilities..."
                  rows={4}
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-required-qualifications">
                  Required Qualifications
                </Label>
                <textarea
                  id="create-required-qualifications"
                  value={createForm.requiredQualifications}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setCreateForm({
                      ...createForm,
                      requiredQualifications: e.target.value,
                    })
                  }
                  placeholder="Required qualifications..."
                  rows={4}
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsCreateDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreatePosition}
                disabled={
                  createMutation.isPending ||
                  !createForm.title ||
                  !createForm.department
                }
              >
                {createMutation.isPending ? "Creating..." : "Create Position"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <div className="gap-2 flex">
          <Dialog open={shareJobOpen} onOpenChange={setShareJobOpen}>
            <DialogTrigger>
              <Button>
                <Share className="mr-2 h-4 w-4" />
                Share any job
              </Button>
            </DialogTrigger>

            <DialogContent>
              <DialogHeader>
                <DialogTitle>Share Job Position</DialogTitle>
                <DialogDescription>
                  Fill in the details to share job position via mail.
                </DialogDescription>
              </DialogHeader>

              <Label htmlFor="jobId">Job Id *</Label>
              <Input
                id="jobId"
                value={shareJobId}
                onChange={(e) => setShareJobId(e.target.value)}
                placeholder="e.g. Job Id"
              />
              <Label htmlFor="recipientMails">Recipient Mails *</Label>
              <Input
                id="recipientMails"
                value={recipientMails}
                onChange={(e) => setRecipienMails([e.target.value])}
                placeholder="e.g. comma spaerated recipient mails"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleShareJobPosition()}
              >
                {shareJobMutation.isPending ? "Sharing..." : "Share Position"}
              </Button>
            </DialogContent>
          </Dialog>

          <Dialog open={referFriendOpen} onOpenChange={setReferFriendOpen}>
            <DialogTrigger>
              <Button>
                <User className="mr-2 h-4 w-4" />
                Reffer Friend
              </Button>
            </DialogTrigger>

            <DialogContent>
              <DialogHeader>
                <DialogTitle>Reffer Friend</DialogTitle>
                <DialogDescription>
                  Fill in the details to reffer your friend.
                </DialogDescription>
              </DialogHeader>

              <Label htmlFor="jobId">Job Id *</Label>
              <Input
                id="jobId"
                value={refferForm.jobId}
                onChange={(e) => setRefferForm((prev) => ({
                    ...prev, jobId: e.target.value
                }))}
                placeholder="e.g. Job Id"
                required
              />
              <Label htmlFor="friendName">Friend Name: </Label>
              <Input
                id="friendName"
                value={refferForm.friendName}
                onChange={(e) => setRefferForm((prev) => ({
                    ...prev, friendName: e.target.value
                }))}
                placeholder="e.g. Kartik Patel"
              />
              <Label htmlFor="friendEmail">Friend Email: </Label>
              <Input
                id="friendEmail"
                value={refferForm.friendEmail}
                onChange={(e) => setRefferForm((prev) => ({
                    ...prev, friendEmail: e.target.value
                }))}
                placeholder="e.g. abc@gmail.com"
              />
              <Label htmlFor="note">Note: </Label>
              <Input
                id="note"
                value={refferForm.note}
                onChange={(e) => setRefferForm((prev) => ({
                    ...prev, note: e.target.value
                }))}
                placeholder="e.g. About Your Friend"
                type="textarea"
              />
              <Label htmlFor="cv">CV: </Label>
              <Input
                id="cv"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  setCvFile(file)
                }}
                placeholder="e.g. Cv of Your Friend"
                type="file"
                required
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleRefferFriend()}
              >
                {refferMutation.isPending ? "Sharing..." : "Share Position"}
              </Button>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {jobQuery.isLoading ? (
        <div className="flex justify-center py-10">
          <Spinner />
        </div>
      ) : jobQuery.isError ? (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="py-6 text-destructive">
            {getErrorMessage(jobQuery.error)}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="grid gap-4">
            {jobs.map((job) => (
              <Card
                key={job.id ?? job.title}
                className="shadow-sm hover:shadow-md transition-shadow duration-300 border-l-3 border-l-primary/20 hover:border-l-primary"
              >
                <CardHeader className="gap-2 pb-3">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg leading-tight truncate">
                        {job.title ?? "Untitled role"} - {job.id}
                      </CardTitle>
                      <CardDescription className="text-sm">
                        {job.departmentName || "General"}
                      </CardDescription>
                    </div>
                    {job.application_deadline && (
                      <Badge variant="secondary" className="shrink-0">
                        <CalendarDays className="h-3 w-3 mr-1" />
                        Apply by {DateTimeDisplay(job.application_deadline)}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground/70" />
                      <span className="truncate">
                        {job.location || "Remote"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-muted-foreground/70" />
                      <span className="truncate">
                        {job.employment_type || "Flexible"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CalendarDays className="h-4 w-4 text-muted-foreground/70" />
                      <span className="truncate">
                        {job.min_experience || "Any level"}
                      </span>
                    </div>
                    {job.salary_range && (
                      <div className="flex items-center gap-2 col-span-full sm:col-span-1">
                        <span className="font-medium text-green-600 dark:text-green-400">
                          {job.salary_range}
                        </span>
                      </div>
                    )}
                  </div>

                  <Collapsible>
                    <div className="flex flex-wrap gap-3 pt-2">
                      <CollapsibleTrigger className="text-sm font-semibold bg-black rounded-md text-white px-3 py-1">
                        View Details
                      </CollapsibleTrigger>
                    </div>

                    <CollapsibleContent>
                      <div className="mt-5 gap-5 flex flex-col">
                        <div className="flex flex-col gap-2">
                          <Label>• Description</Label>
                          {job.description || "Not Provided"}
                        </div>
                        <div className="flex flex-col gap-2">
                          <Label>• Job Responsibilities</Label>
                          <span>
                            {job.job_responsibilities || "Not Provided"}
                          </span>
                        </div>
                        <div className="flex flex-col gap-2">
                          <Label>• Required Qualification</Label>
                          {job.required_qualification || "Any"}
                        </div>
                        <div className="flex flex-col gap-2">
                          <Label>• Created By</Label>
                          {job.createdBy || "Not Specified"}
                        </div>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
