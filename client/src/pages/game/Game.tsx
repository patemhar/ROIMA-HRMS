import { useState } from "react";

import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Alert, AlertDescription } from "@/components/ui/alert";

import { getErrorMessage } from "@/utils/error";
import { CheckCircle2, XCircle, Plus, Clock, Timer, Users, Calendar, Heart } from "lucide-react";
import { useGetAllGames, useUpdateGame, useCreateGame, useToggleGameActive } from "@/hooks/game/game.hooks";
import { useNavigate } from "react-router-dom";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/store";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { components } from "@/types/api";
import { hasPermission, PermissionCode } from "@/constants/permissions";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";

type Schemas = components["schemas"];

export const GamePage = () => {
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const allGamesQuery = useGetAllGames();
  const games = allGamesQuery.data;

  const navigate = useNavigate();

  const { user } = useAuth((state) => state.auth);
  const permissions = user?.permission;
  const canManageGames = hasPermission(permissions, PermissionCode.GAME_MANAGE);

  const updateGameMutation = useUpdateGame();
  const createGameMutation = useCreateGame();
  const gameActiveToggleMutation = useToggleGameActive();

  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingGame, setEditingGame] = useState<Schemas["GameResponseDto"] | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    startTime: "",
    endTime: "",
    slotDurationMinutes: 0,
    maxPlayersPerSlot: 0,
    activeOnWeekends: false,
  });

  const handleCreateGame = () => {
    const data: Schemas["GameCreateRequestDto"] = {
      name: formData.name,
      description: formData.description,
      operatingStartTime: (formData.startTime + ":00") as any,
      operatingEndTime: (formData.endTime + ":00") as any,
      slotDurationMinutes: formData.slotDurationMinutes,
      maxPlayers: formData.maxPlayersPerSlot,
      activeOnWeekends: formData.activeOnWeekends,
    };
    createGameMutation.mutate(
      data,
      {
        onSuccess: () => {
          setSuccessMessage("Game created successfully");
          setCreateDialogOpen(false);
          resetForm();
        },
        onError: (error) => {
          setErrorMessage(getErrorMessage(error));
        },
      }
    );
  };

  const handleUpdateGame = () => {
    if (!editingGame) return;
    const data: Schemas["GameCreateRequestDto"] = {
      name: formData.name,
      description: formData.description,
      operatingStartTime: (formData.startTime) as any,
      operatingEndTime: (formData.endTime) as any,
      slotDurationMinutes: formData.slotDurationMinutes,
      maxPlayers: formData.maxPlayersPerSlot,
      activeOnWeekends: formData.activeOnWeekends,
    };
    updateGameMutation.mutate(
      { id: editingGame.id!, data },
      {
        onSuccess: () => {
          setSuccessMessage("Game updated successfully");
          toast.success("Game updated successfully");
          setUpdateDialogOpen(false);
          setEditingGame(null);
          resetForm();
        },
        onError: (error) => {
          toast.error(getErrorMessage(error));
          setErrorMessage(getErrorMessage(error));
        },
      }
    );
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      startTime: "",
      endTime: "",
      slotDurationMinutes: 0,
      maxPlayersPerSlot: 0,
      activeOnWeekends: false,
    });
  };

  const openCreateDialog = () => {
    resetForm();
    setEditingGame(null);
    setCreateDialogOpen(true);
  };

  const openUpdateDialog = (game: Schemas["GameResponseDto"]) => {
    setEditingGame(game);
    setFormData({
      name: game.name || "",
      description: game.description || "",
      startTime: game.startTime?.toString() || "00:00",
      endTime: game.endTime?.toString() || "00:00",
      slotDurationMinutes: game.slotDurationMinutes || 0,
      maxPlayersPerSlot: game.maxPlayersPerSlot || 0,
      activeOnWeekends: game.activeOnWeekends || false,
    });
    setUpdateDialogOpen(true);
  };

  const handleGameActiveToggle = (gameId: string) => {

    if(!gameId) {
      toast.error("Invalid game ID");
      return;
    }

    if(!window.confirm("Are you sure you want to toggle the active status of this game?")) return;

    try {
      gameActiveToggleMutation.mutate(gameId);
  
      toast.success("Game active status toggled successfully");        
    } catch (error) {
      toast.error("Failed to toggle game active status" + getErrorMessage(error));
      return;
    }
  };

  return (
    
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Games</h1>
            <p className="text-muted-foreground mt-1">
              All the games currently available.
            </p>
          </div>
          <div className="flex gap-3">
            {canManageGames && (
              <Button onClick={openCreateDialog}>
                <Plus className="h-4 w-4 mr-2" />
                Create Game
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => navigate("bookings")}
            >
              My Bookings
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate("stats")}
            >
              User Stats
            </Button>
          </div>
        </div>

        {/* Success Message */}
        {successMessage && (
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              {successMessage}
            </AlertDescription>
          </Alert>
        )}

        {/* Error Message */}
        {errorMessage && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        <Card>
          <CardContent>
            {allGamesQuery.isLoading ? (
              <div className="flex justify-center py-10">
                <Spinner />
              </div>
            ) : allGamesQuery.isError ? (
              <p className="text-red-500">
                {getErrorMessage(allGamesQuery.error)}
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
                {games?.map((game) => (
                  <Card
                    key={game.id}
                    className="hover:shadow-xl transition-all duration-300 rounded-xl border border-gray-200 bg-white overflow-hidden group"
                  >
                    <CardContent className="p-6 border-t border-gray-50 h-full">
                      <div className="flex flex-col justify-between h-full">
                        <div className="space-y-4 flex-1">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="text-lg font-semibold text-gray-800">
                                  {game.name}
                                </h4>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  game.active 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                  {game.active ? 'Active' : 'Inactive'}
                                </span>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {game.description}
                              </p>
                            </div>
                            {canManageGames && (
                              <Switch
                                checked={game.active}
                                onCheckedChange={() => handleGameActiveToggle(game.id!)}
                              />
                            )}
                          </div>

                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 bg-linear-to-br from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-100">
                            {[
                              {
                                label: "Operating Hours",
                                value: `${game.startTime} - ${game.endTime}`,
                                icon: Clock,
                              },
                              {
                                label: "Slot Duration",
                                value: `${game.slotDurationMinutes} minutes`,
                                icon: Timer,
                              },
                              {
                                label: "Max Players/Slot",
                                value: game.maxPlayersPerSlot,
                                icon: Users,
                              },
                              {
                                label: "Active On Weekends",
                                value: game.activeOnWeekends ? "Yes" : "No",
                                icon: Calendar,
                              },
                              {
                                label: "Interested",
                                value: game.interestedCount,
                                icon: Heart,
                              },
                            ].map(({ label, value, icon: Icon }) => (
                              <div className="flex items-center gap-3" key={label}>
                                <Icon className="h-4 w-4 text-blue-600" />
                                <div>
                                  <Label className="font-medium text-gray-700 text-sm">{label}:</Label>
                                  <p className="text-sm text-gray-600 truncate">
                                    {value}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="mt-6 flex flex-wrap gap-3">
                          <Button
                            onClick={() => navigate(`${game.id}`)}
                            disabled={!game.active}
                            className={`min-w-32 transition-all duration-200 ${
                              game.active 
                                ? 'bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg' 
                                : 'bg-gray-400 cursor-not-allowed'
                            }`}
                          >
                            <Calendar className="h-4 w-4 mr-2" />
                            Book Slot
                          </Button>
                          {canManageGames && (
                            <Button 
                              variant="outline" 
                              onClick={() => openUpdateDialog(game)}
                              className="min-w-25 border-gray-300 hover:bg-gray-50 transition-colors duration-200"
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Update
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Create Game Dialog */}
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Game</DialogTitle>
              <DialogDescription>
                Add a new game to the system. Fill in all the required details.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="create-name">Name</Label>
                <Input
                  id="create-name"
                  placeholder="e.g., Chess, Table Tennis"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-description">Description</Label>
                <Textarea
                  id="create-description"
                  placeholder="Describe the game..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="create-startTime">Start Time (HH:MM)</Label>
                  <Input
                    id="create-startTime"
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="create-endTime">End Time (HH:MM)</Label>
                  <Input
                    id="create-endTime"
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="create-slotDuration">Slot Duration (Minutes)</Label>
                  <Input
                    id="create-slotDuration"
                    type="number"
                    min="1"
                    placeholder="e.g., 30"
                    value={formData.slotDurationMinutes || ""}
                    onChange={(e) => setFormData({ ...formData, slotDurationMinutes: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="create-maxPlayers">Max Players per Slot</Label>
                  <Input
                    id="create-maxPlayers"
                    type="number"
                    min="1"
                    placeholder="e.g., 4"
                    value={formData.maxPlayersPerSlot || ""}
                    onChange={(e) => setFormData({ ...formData, maxPlayersPerSlot: Number(e.target.value) })}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Label htmlFor="weekend">Operational on Weekends: </Label>
                  <Switch
                    id="weekend"
                    checked={formData.activeOnWeekends}
                    onCheckedChange={(checked) => setFormData({ ...formData, activeOnWeekends: checked })}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateGame} disabled={createGameMutation.isPending}>
                {createGameMutation.isPending ? "Creating..." : "Create Game"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Update Game Dialog */}
        <Dialog open={updateDialogOpen} onOpenChange={setUpdateDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Update Game</DialogTitle>
              <DialogDescription>
                Update the game details below.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="update-name">Name</Label>
                <Input
                  id="update-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="update-description">Description</Label>
                <Textarea
                  id="update-description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="update-startTime">Start Time (HH:MM)</Label>
                  <Input
                    id="update-startTime"
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="update-endTime">End Time (HH:MM)</Label>
                  <Input
                    id="update-endTime"
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="update-slotDuration">Slot Duration (Minutes)</Label>
                  <Input
                    id="update-slotDuration"
                    type="number"
                    min="1"
                    value={formData.slotDurationMinutes}
                    onChange={(e) => setFormData({ ...formData, slotDurationMinutes: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="update-maxPlayers">Max Players per Slot</Label>
                  <Input
                    id="update-maxPlayers"
                    type="number"
                    min="1"
                    value={formData.maxPlayersPerSlot}
                    onChange={(e) => setFormData({ ...formData, maxPlayersPerSlot: Number(e.target.value) })}
                  />
                </div>
                <div className="flex items-center gap-1">
                  <Label htmlFor="update-weekend">Operational on Weekends</Label>
                  <Switch
                    id="update-weekend"
                    checked={formData.activeOnWeekends}
                    onCheckedChange={(checked) => setFormData({ ...formData, activeOnWeekends: checked })}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setUpdateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateGame} disabled={updateGameMutation.isPending}>
                {updateGameMutation.isPending ? "Updating..." : "Update Game"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
  );
};
