import { useState } from "react";

import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Alert, AlertDescription } from "@/components/ui/alert";

import { getErrorMessage } from "@/utils/error";
import { CheckCircle2, XCircle, Plus } from "lucide-react";
import { useGetAllGames, useUpdateGame, useCreateGame } from "@/hooks/game/game.hooks";
import { useNavigate } from "react-router-dom";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/store";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { components } from "@/types/api";
import { hasPermission, PermissionCode } from "@/constants/permissions";

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
  });

  const handleCreateGame = () => {
    const data: Schemas["GameCreateRequestDto"] = {
      name: formData.name,
      description: formData.description,
      operatingStartTime: (formData.startTime + ":00") as any,
      operatingEndTime: (formData.endTime + ":00") as any,
      slotDurationMinutes: formData.slotDurationMinutes,
      maxPlayers: formData.maxPlayersPerSlot,
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
      operatingStartTime: (formData.startTime + ":00") as any,
      operatingEndTime: (formData.endTime + ":00") as any,
      slotDurationMinutes: formData.slotDurationMinutes,
      maxPlayers: formData.maxPlayersPerSlot,
    };
    updateGameMutation.mutate(
      { id: editingGame.id!, data },
      {
        onSuccess: () => {
          setSuccessMessage("Game updated successfully");
          setUpdateDialogOpen(false);
          setEditingGame(null);
          resetForm();
        },
        onError: (error) => {
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
      startTime: `${game.startTime?.hour?.toString().padStart(2, '0') || '00'}:${game.startTime?.minute?.toString().padStart(2, '0') || '00'}`,
      endTime: `${game.endTime?.hour?.toString().padStart(2, '0') || '00'}:${game.endTime?.minute?.toString().padStart(2, '0') || '00'}`,
      slotDurationMinutes: game.slotDurationMinutes || 0,
      maxPlayersPerSlot: game.maxPlayersPerSlot || 0,
    });
    setUpdateDialogOpen(true);
  };

  return (
    
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Games</h1>
            <p className="text-muted-foreground">
              All the games currently available.
            </p>
          </div>
          {canManageGames && (
            <Button onClick={openCreateDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Create Game
            </Button>
          )}
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
              <div className="space-y-4">
                {games?.map((game) => (
                  <Card
                    key={game.id}
                    className="hover:shadow-lg transition-shadow w-fit"
                  >
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start flex-col">
                        <div className="space-y-1 flex-1">
                          <h4 className="font-semibold">{game.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {game.description}
                          </p>
                          <div className="grid sm:grid-cols-2 gap-3 mt-3 bg-amber-100 p-5 rounded-lg">
                            <div className="flex items-center gap-2">
                                <Label>
                                    Operating hours: 
                                </Label>
                                <p className="text-sm text-muted-foreground">
                                    {String(game.startTime)} - {String(game.endTime)}
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <Label>
                                    Slot Duration:    
                                </Label>
                                <p className="text-sm text-muted-foreground">
                                    {game.slotDurationMinutes} Minutes
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <Label>
                                    Max players per slot:
                                </Label>
                                <p className="text-sm text-muted-foreground">
                                    {game.maxPlayersPerSlot}
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <Label>
                                    Currently Interested People in this game:
                                </Label>
                                <p className="text-sm text-muted-foreground">
                                    {game.interestedCount}
                                </p>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2 mt-5">
                          <Button onClick={() => navigate(`${game.id}`)}>
                            Book a Slot
                          </Button>
                          {canManageGames && (
                            <Button variant="outline" onClick={() => openUpdateDialog(game)}>
                              Update Game
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
              <div>
                <Label htmlFor="create-name">Name</Label>
                <Input
                  id="create-name"
                  placeholder="e.g., Chess, Table Tennis"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="create-description">Description</Label>
                <Textarea
                  id="create-description"
                  placeholder="Describe the game..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="create-startTime">Start Time (HH:MM)</Label>
                  <Input
                    id="create-startTime"
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  />
                </div>
                <div>
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
                <div>
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
                <div>
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
              <div>
                <Label htmlFor="update-name">Name</Label>
                <Input
                  id="update-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="update-description">Description</Label>
                <Textarea
                  id="update-description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="update-startTime">Start Time (HH:MM)</Label>
                  <Input
                    id="update-startTime"
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  />
                </div>
                <div>
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
                <div>
                  <Label htmlFor="update-slotDuration">Slot Duration (Minutes)</Label>
                  <Input
                    id="update-slotDuration"
                    type="number"
                    min="1"
                    value={formData.slotDurationMinutes}
                    onChange={(e) => setFormData({ ...formData, slotDurationMinutes: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <Label htmlFor="update-maxPlayers">Max Players per Slot</Label>
                  <Input
                    id="update-maxPlayers"
                    type="number"
                    min="1"
                    value={formData.maxPlayersPerSlot}
                    onChange={(e) => setFormData({ ...formData, maxPlayersPerSlot: Number(e.target.value) })}
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
