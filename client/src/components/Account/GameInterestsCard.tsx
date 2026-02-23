import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useMyProfile, useAddInterest, useRemoveInterest } from "@/hooks/user/user.hooks";
import { useGetAllGames } from "@/hooks/util/util.hooks";
import { toast } from "sonner";
import { getErrorMessage } from "@/utils/error";

export function GameInterestsCard() {
  // Queries
  const myProfileQuery = useMyProfile();
  const gamesQuery = useGetAllGames();

  const games = gamesQuery.data ?? [];
  const myInterests = myProfileQuery.data?.gameInterests ?? [];

  // Mutations
  const addInterestMutation = useAddInterest();
  const removeInterestMutation = useRemoveInterest();

  // Game Interests
  const handleAddInterest = async (gameId: string) => {
    if (myInterests.includes(gameId)) {
      toast.error("Already added");
      return;
    }
    try {
      await addInterestMutation.mutateAsync(gameId);
      toast.success("Interest added");
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleRemoveInterest = async (gameId: string) => {
    try {
      await removeInterestMutation.mutateAsync(gameId);
      toast.success("Interest removed");
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Game Interests</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div>
          <Label className="text-sm font-medium mb-2 block">
            Your Interests
          </Label>
          {myInterests.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {myInterests.map((gameId: string) => {
                const game = games.find((g) => g.id === gameId);
                if (!game) return null;
                return (
                  <div
                    key={gameId}
                    className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-lg"
                  >
                    <span className="text-sm font-medium">{game.name}</span>
                    <button
                      onClick={() => handleRemoveInterest(gameId)}
                      disabled={removeInterestMutation.isPending}
                      className="text-muted-foreground text-lg "
                      title="Remove interest"
                    >
                      ×
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No interests added yet. Add games below to express interest for
              future cycles.
            </p>
          )}
        </div>
        <div>
          <Label className="text-sm font-medium mb-2 block">
            Available Games
          </Label>
          {gamesQuery.isLoading ? (
            <p className="text-sm text-muted-foreground">Loading games...</p>
          ) : games.filter((g) => !myInterests.includes(g.id!)).length ===
            0 ? (
            <p className="text-sm text-muted-foreground">
              You have added all available games.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {games
                .filter((g) => !myInterests.includes(g.id!))
                .map((game) => (
                  <div
                    key={game.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div>
                      <p className="text-sm font-medium">{game.name}</p>
                      {game.description && (
                        <p className="text-xs text-muted-foreground">
                          {game.description}
                        </p>
                      )}
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleAddInterest(game.id!)}
                      disabled={addInterestMutation.isPending}
                    >
                      Add
                    </Button>
                  </div>
                ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}