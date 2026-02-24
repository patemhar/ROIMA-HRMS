import React, { useState } from "react";
import {
  Heart,
  MessageCircle,
  Plus,
  Edit,
  Trash2,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
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
import { Spinner } from "@/components/ui/spinner";
import { useAuth } from "@/store";
import {
  useGetAchievements,
  useCreateAchievement,
  useUpdateAchievement,
  useDeleteAchievement,
  useLikeAchievement,
  useUnlikeAchievement,
  useAddAchievementComment,
  useUpdateAchievementComment,
  useDeleteAchievementComment,
} from "@/hooks/achievement/achievement.hooks";
import { useGetAllRoles, useGetAllUsers } from "@/hooks/util/util.hooks";
import { toast } from "sonner";
import { getErrorMessage } from "@/utils/error";
import { useForm } from "react-hook-form";
import { achievementService } from "@/services/achievementService";

export const AchievementsPage = () => {
  const user = useAuth((state) => state.auth.user);
  const isHR = user?.role === "HR";

  // State for dialogs
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>(
    {},
  );
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});
  const [loadedComments, setLoadedComments] = useState<Record<string, any[]>>({});
  const [editingComment, setEditingComment] = useState<{ postId: string; commentId: string; text: string } | null>(null);
  const [myPostsOpen, setMyPostsOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string>(user?.id || "");

  // Queries
  const achievementsQuery = useGetAchievements();
  const achievements = achievementsQuery.data || [];
  const rolesQuery = useGetAllRoles();
  const roles = rolesQuery.data || [];
  const usersQuery = useGetAllUsers();
  const users = usersQuery.data || [];

  // User posts query
  const [userPosts, setUserPosts] = useState<any[]>([]);
  const [loadingUserPosts, setLoadingUserPosts] = useState(false);

  // Fetch user posts when selectedUserId changes or myPostsOpen changes
  const fetchUserPosts = async (userId: string) => {
    if (!userId) return;
    setLoadingUserPosts(true);
    try {
      const response = await achievementService.getPostsByUser(userId);
      if (response.success && response.data) {
        setUserPosts(response.data);
      }
    } catch (error) {
      console.error("Failed to load user posts:", error);
    } finally {
      setLoadingUserPosts(false);
    }
  };

  // Fetch posts when collapsible opens or user changes
  React.useEffect(() => {
    if (myPostsOpen && selectedUserId) {
      fetchUserPosts(selectedUserId);
    }
  }, [myPostsOpen, selectedUserId]);


  // Mutations
  const createAchievement = useCreateAchievement();
  const updateAchievement = useUpdateAchievement();
  const deleteAchievement = useDeleteAchievement();
  const likeAchievement = useLikeAchievement();
  const unlikeAchievement = useUnlikeAchievement();
  const addComment = useAddAchievementComment();
  const updateComment = useUpdateAchievementComment();
  const deleteComment = useDeleteAchievementComment();

  // Forms
  const createForm = useForm({
    defaultValues: {
      title: "",
      description: "",
      tags: "",
      visibility: roles.find(r => r.name === user?.role)?.id || "",
    },
  });
  const editForm = useForm({
    defaultValues: { title: "", description: "", tags: "", visibility: "" },
  });

  // Handlers
  const handleCreate = async (data: any) => {
    try {
      await createAchievement.mutateAsync({ data, files: selectedFiles });
      toast.success("Achievement posted successfully!");
      setCreateDialogOpen(false);
      createForm.reset();
      setSelectedFiles([]);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleEdit = async (data: any) => {
    if (!selectedPost) return;
    try {
      await updateAchievement.mutateAsync({ id: selectedPost.id, data });
      toast.success("Achievement updated successfully!");
      setEditDialogOpen(false);
      setSelectedPost(null);
      editForm.reset();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteAchievement.mutateAsync(id);
      toast.success("Achievement deleted successfully!");
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleLike = async (id: string, isLiked: boolean) => {
    try {
      if (isLiked) {
        await unlikeAchievement.mutateAsync(id);
      } else {
        await likeAchievement.mutateAsync(id);
      }
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleToggleComments = async (postId: string) => {
    const isExpanding = !expandedComments[postId];
    
    setExpandedComments((prev) => ({
      ...prev,
      [postId]: isExpanding,
    }));

    // Fetch comments if expanding and not already loaded
    if (isExpanding && !loadedComments[postId]) {
      try {
        const response = await achievementService.getCommentsByPost(postId);
        if (response.success && response.data) {
          setLoadedComments((prev) => ({
            ...prev,
            [postId]: response.data || [],
          }));
        }
      } catch (error) {
        console.error("Failed to load comments:", error);
      }
    }
  };

  const handleAddComment = async (postId: string) => {
    const text = commentInputs[postId]?.trim();
    if (!text) return;
    try {
      await addComment.mutateAsync({ id: postId, data: { text } });
      setCommentInputs((prev) => ({ ...prev, [postId]: "" }));
      
      // Refresh comments after adding
      const response = await achievementService.getCommentsByPost(postId);
      if (response.success && response.data) {
        setLoadedComments((prev) => ({
          ...prev,
          [postId]: response.data || [],
        }));
      }
      
      // Expand comments section to show the new comment
      setExpandedComments((prev) => ({ ...prev, [postId]: true }));
      toast.success("Comment added!");
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleUpdateComment = async () => {
    if (!editingComment) return;
    const text = editingComment.text.trim();
    if (!text) return;

    try {
      await updateComment.mutateAsync({ 
        commentId: editingComment.commentId, 
        data: { text } 
      });
      
      // Refresh comments after updating
      const response = await achievementService.getCommentsByPost(editingComment.postId);
      if (response.success && response.data) {
        setLoadedComments((prev) => ({
          ...prev,
          [editingComment.postId]: response.data || [],
        }));
      }
      
      setEditingComment(null);
      toast.success("Comment updated!");
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleDeleteComment = async (postId: string, commentId: string) => {
    try {
      await deleteComment.mutateAsync(commentId);
      
      // Refresh comments after deleting
      const response = await achievementService.getCommentsByPost(postId);
      if (response.success && response.data) {
        setLoadedComments((prev) => ({
          ...prev,
          [postId]: response.data || [],
        }));
      }
      
      toast.success("Comment deleted!");
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const openEditDialog = (post: any) => {
    setSelectedPost(post);
    editForm.setValue("title", post.title);
    editForm.setValue("description", post.description);
    editForm.setValue("tags", post.tags || "");
    const role = roles.find(r => r.name === post.visibility);
    editForm.setValue("visibility", role?.id || "");
    setEditDialogOpen(true);
  };

  if (achievementsQuery.isLoading) {
    return (
      <div className="flex justify-center items-center h-120">
        <Spinner className="h-8 w-8 text-primary" />
      </div>
    );
  }

  if(achievementsQuery.isError) {
    return (
      <div className="text-center text-destructive">
        {getErrorMessage(achievementsQuery.error) || "Failed to load achievements."}
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-semibold">Achievements & Celebrations</h1>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="md:mr-2 h-4 w-4" />
              <p className="md:block hidden">Share Achievement</p>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Share Your Achievement</DialogTitle>
              <DialogDescription>
                Celebrate your accomplishments with the team!
              </DialogDescription>
            </DialogHeader>
            <form
              onSubmit={createForm.handleSubmit(handleCreate)}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  {...createForm.register("title", { required: true })}
                  placeholder="Achievement title"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  {...createForm.register("description", { required: true })}
                  placeholder="Tell us about it..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tags">Tags (comma-separated)</Label>
                <Input
                  {...createForm.register("tags")}
                  placeholder="e.g., project, team, innovation"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="visibility">Visibility</Label>
                <Select
                  value={createForm.watch("visibility")}
                  onValueChange={(value) => createForm.setValue("visibility", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select visibility" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role.id} value={role.id!}>
                        {role.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="files">Attach Media (optional)</Label>
                <Input
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    setSelectedFiles(files);
                  }}
                />
                {selectedFiles.length > 0 && (
                  <div className="mt-2 text-sm text-gray-600">
                    {selectedFiles.length} file(s) selected
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button type="submit" disabled={createAchievement.isPending}>
                  {createAchievement.isPending
                    ? "Posting..."
                    : "Post Achievement"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* My Posts Collapsible Section */}
      <Collapsible open={myPostsOpen} onOpenChange={setMyPostsOpen}>
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl">My Posts</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    View and manage your achievement posts
                  </p>
                </div>
                <ChevronDown 
                  className={`h-5 w-5 transition-transform ${myPostsOpen ? "rotate-180" : ""}`}
                />
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-0">
              {isHR && (
                <div className="mb-4 flex items-center gap-2">
                  <Label htmlFor="user-select" className="whitespace-nowrap">
                    View posts by:
                  </Label>
                  <Select
                    value={selectedUserId}
                    onValueChange={setSelectedUserId}
                  >
                    <SelectTrigger id="user-select" className="max-w-xs">
                      <SelectValue placeholder="Select user" />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map((u) => (
                        <SelectItem key={u.userId} value={u.userId!}>
                          {u.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              {loadingUserPosts ? (
                <div className="flex justify-center py-8">
                  <Spinner className="h-6 w-6 text-primary" />
                </div>
              ) : userPosts.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No posts found for this user.
                </p>
              ) : (
                <div className="space-y-4">
                  {userPosts.map((post) => {
                    const isOwnPost = post.authorId === user?.id;
                    const isLiked = post.likedByCurrentUser === true;
                    
                    return (
                      <Card key={post.id} className="border-l-4 border-l-primary">
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle className="text-base">{post.title}</CardTitle>
                              <p className="text-xs text-muted-foreground">
                                {post.authorName} • {new Date(post.createdDate || "").toLocaleDateString()}
                              </p>
                            </div>
                            {(isOwnPost || isHR) && !post.systemGenerated && (
                              <div className="flex gap-1">
                                {isOwnPost && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => openEditDialog(post)}
                                  >
                                    <Edit className="h-3 w-3" />
                                  </Button>
                                )}
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="text-destructive"
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Delete Achievement?</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        This action cannot be undone.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => {
                                          handleDelete(post.id || "");
                                          fetchUserPosts(selectedUserId);
                                        }}
                                        className="bg-destructive"
                                      >
                                        Delete
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            )}
                          </div>
                          {post.tags && (
                            <div className="flex gap-1 mt-2">
                              {post.tags.split(",").map((tag: string) => (
                                <Badge key={tag.trim()} variant="outline" className="text-xs">
                                  {tag.trim()}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </CardHeader>
                        <CardContent className="pt-0">
                          <p className="text-sm mb-3">{post.description}</p>
                          <div className="flex items-center gap-3 text-sm">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleLike(post.id || "", isLiked)}
                              className={`h-8 ${isLiked ? "text-red-500" : ""}`}
                            >
                              <Heart className={`h-3 w-3 mr-1 ${isLiked ? "fill-current" : ""}`} />
                              {post.likeCount || 0}
                            </Button>
                            <span className="flex items-center gap-1">
                              <MessageCircle className="h-3 w-3" />
                              {post.commentCount || 0}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Posts Feed */}
      <div className="space-y-6">
        {achievements.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-muted-foreground">
                No achievements yet. Be the first to share!
              </p>
            </CardContent>
          </Card>
        ) : (
          achievements.map((achievement) => {
            const isOwnPost = achievement.authorId === user?.id;
            const isLiked = achievement.likedByCurrentUser === true;
            const isSystemPost = achievement.systemGenerated;

            return (
              <Card key={achievement.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{achievement.title}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {isSystemPost ? "System" : achievement.authorName} •{" "}
                        {new Date(achievement.createdDate || "").toLocaleDateString()}
                        {isSystemPost && (
                          <Badge variant="secondary" className="ml-2">
                            Celebration
                          </Badge>
                        )}
                      </p>
                    </div>
                    {(isOwnPost || isHR) && !isSystemPost && (
                      <div className="flex gap-2">
                        {isOwnPost && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditDialog(achievement)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Delete Achievement?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(achievement.id || "")}
                                className="bg-destructive"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    )}
                  </div>
                  {achievement.tags && (
                    <div className="flex gap-1 mt-2">
                      {achievement.tags.split(",").map((tag: string) => (
                        <Badge key={tag.trim()} variant="outline">
                          {tag.trim()}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardHeader>
                <CardContent>
                  <p className="mb-4">{achievement.description}</p>
                  {achievement.mediaUrls && achievement.mediaUrls.length > 0 && (
                    <div className="mb-4 grid grid-cols-1 gap-2">
                      {achievement.mediaUrls.map((url, index) => (
                        <div key={index} className="relative">
                          {url.includes('.mp4') || url.includes('.webm') || url.includes('.ogg') ? (
                            <video controls className="w-full max-h-96 rounded-lg">
                              <source src={url} />
                            </video>
                          ) : (
                            <img
                              src={url}
                              alt={`Media ${index + 1}`}
                              className="w-full max-h-96 object-cover rounded-lg"
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center gap-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleLike(achievement.id || "", isLiked!)}
                      className={isLiked ? "text-red-500" : ""}
                      disabled={likeAchievement.isPending || unlikeAchievement.isPending}
                    >
                      <Heart
                        className={`h-4 w-4 mr-1 ${isLiked ? "fill-current" : ""}`}
                      />
                      {achievement.likeCount || 0}
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleToggleComments(achievement.id || "")}
                    >
                      <MessageCircle className="h-4 w-4 mr-1" />
                      {achievement.commentCount || 0}
                    </Button>
                  </div>
                  {/* Comments Section */}
                  {expandedComments[achievement.id || ""] && (
                    <div className="mt-4 space-y-3 border-t pt-3">
                      {(() => {
                        const comments = loadedComments[achievement.id || ""] || achievement.comments || [];
                        return comments.length > 0 ? (
                          <div className="space-y-2">
                            {comments.map((comment: any) => {
                              const isOwnComment = comment.authorId === user?.id;
                              const canDeleteComment = isOwnComment || isHR;
                              
                              return (
                                <div
                                  key={comment.id}
                                  className="bg-muted/50 rounded-lg p-3"
                                >
                                  {editingComment?.commentId === comment.id ? (
                                    // Edit mode
                                    <div className="space-y-2">
                                      <Textarea
                                        value={editingComment?.text || ""}
                                        onChange={(e) => {
                                          if (editingComment) {
                                            setEditingComment({
                                              postId: editingComment.postId,
                                              commentId: editingComment.commentId,
                                              text: e.target.value,
                                            });
                                          }
                                        }}
                                        className="min-h-15"
                                      />
                                      <div className="flex gap-2">
                                        <Button
                                          size="sm"
                                          onClick={handleUpdateComment}
                                          disabled={!editingComment?.text.trim()}
                                        >
                                          Save
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => setEditingComment(null)}
                                        >
                                          Cancel
                                        </Button>
                                      </div>
                                    </div>
                                  ) : (
                                    // View mode
                                    <>
                                      <div className="flex justify-between items-start">
                                        <p className="text-sm flex-1">
                                          <strong className="font-semibold">{comment.authorName}:</strong>{" "}
                                          {comment.text}
                                        </p>
                                        {(isOwnComment || canDeleteComment) && (
                                          <div className="flex gap-1 ml-2">
                                            {isOwnComment && (
                                              <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-6 w-6 p-0"
                                                onClick={() =>
                                                  setEditingComment({
                                                    postId: achievement.id || "",
                                                    commentId: comment.id,
                                                    text: comment.text,
                                                  })
                                                }
                                              >
                                                <Edit className="h-3 w-3" />
                                              </Button>
                                            )}
                                            {canDeleteComment && (
                                              <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                  <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-6 w-6 p-0 text-destructive"
                                                  >
                                                    <Trash2 className="h-3 w-3" />
                                                  </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                  <AlertDialogHeader>
                                                    <AlertDialogTitle>
                                                      Delete Comment?
                                                    </AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                      This action cannot be undone.
                                                    </AlertDialogDescription>
                                                  </AlertDialogHeader>
                                                  <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction
                                                      onClick={() =>
                                                        handleDeleteComment(
                                                          achievement.id || "",
                                                          comment.id
                                                        )
                                                      }
                                                      className="bg-destructive"
                                                    >
                                                      Delete
                                                    </AlertDialogAction>
                                                  </AlertDialogFooter>
                                                </AlertDialogContent>
                                              </AlertDialog>
                                            )}
                                          </div>
                                        )}
                                      </div>
                                      <p className="text-xs text-muted-foreground mt-1">
                                        {new Date(comment.createdDate!).toLocaleDateString()} at{" "}
                                        {new Date(comment.createdDate!).toLocaleTimeString()}
                                      </p>
                                    </>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground italic">
                            No comments yet. Be the first to comment!
                          </p>
                        );
                      })()}
                      <div className="flex gap-2 mt-3">
                        <Input
                          placeholder="Write a comment..."
                          value={commentInputs[achievement.id || ""] || ""}
                          onChange={(e) =>
                            setCommentInputs((prev) => ({
                              ...prev,
                              [achievement.id || ""]: e.target.value,
                            }))
                          }
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                              e.preventDefault();
                              handleAddComment(achievement.id || "");
                            }
                          }}
                        />
                        <Button
                          size="sm"
                          onClick={() => handleAddComment(achievement.id || "")}
                          disabled={!commentInputs[achievement.id || ""]?.trim()}
                        >
                          Post
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Achievement</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={editForm.handleSubmit(handleEdit)}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label>Title *</Label>
              <Input {...editForm.register("title", { required: true })} />
            </div>
            <div className="space-y-2">
              <Label>Description *</Label>
              <Textarea
                {...editForm.register("description", { required: true })}
              />
            </div>
            <div className="space-y-2">
              <Label>Tags</Label>
              <Input
                {...editForm.register("tags")}
                placeholder="e.g., project, team, innovation"
              />
            </div>
            <div className="space-y-2">
              <Label>Visibility</Label>
              <Select
                value={editForm.watch("visibility")}
                onValueChange={(value) => editForm.setValue("visibility", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select visibility" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.id!}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={updateAchievement.isPending}>
                {updateAchievement.isPending ? "Updating..." : "Update"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
