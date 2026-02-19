import type { components } from "@/types/api";
import type { ApiResponse } from "@/types/http";
import { hrKeys, normalCacheConfig } from "./types";
import { QueryClient, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { travelService } from "@/services/travelService";
import { useAuth } from "@/store";

type Schemas = components["schemas"];
type ApiResult<T> = Promise<ApiResponse<T>>;


export const useTravelById = (travelId: string) => {
  const isAuthenticated = useAuth(s => s.auth.isAuthenticated);

  return useQuery({
    queryKey: hrKeys.travelById(travelId),
    queryFn: async () => {
      const res = await travelService.getTravelById(travelId);

      if (!res.success || !res.data)
        throw new Error(res.errors || "Failed");

      return res.data;
    },
    enabled: !!travelId && isAuthenticated,
    ...normalCacheConfig,
  });
};

export const useGetMyTravels = () => {
  const user = useAuth((state) => state.auth.user);

  return useQuery({
    queryKey: hrKeys.myTravels(user?.id ?? "anonymus"),
    queryFn: async () => {
      const res = await travelService.getMyTravels();

      if (!res.success || !res.data)
        throw new Error(res.errors || "Failed");

      return res.data;
    },
    enabled: !!user?.id,
    ...normalCacheConfig,
  });
};

export const useGetUserTravels = (
  userId: string,
) => {
  const isAuthenticated = useAuth((state) => state.auth.isAuthenticated);

  return useQuery({
    queryKey: hrKeys.travelByUserId(userId),
    queryFn: async () => {
      const data = await travelService.getUserTravels(
        userId,
      );

      if (!data.success || !data.data) {
        throw new Error(
          data.errors || "Failed to fetch job applications"
        );
      }
      return data.data;
    },
    enabled: !!isAuthenticated && !!userId,
    ...normalCacheConfig,
  });
};

export const useGetAllTravels = (isEnabled: boolean) => {
  const user = useAuth((state) => state.auth.user);

  return useQuery({
    queryKey: hrKeys.allTravels(user?.role ?? "public"),
    queryFn: async () => {
      const res = await travelService.getAllTravels();

      if (!res.success || !res.data)
        throw new Error(res.errors || "Failed");

      return res.data;
    },
    enabled: isEnabled,
    ...normalCacheConfig,
  });
};


export const useGetItineraries = (travelId: string) => {
  return useQuery({
    queryKey: hrKeys.itineraryByTravelId(travelId),
    queryFn: async () => {
      const res = await travelService.getItineraries(travelId);

      if (!res.success || !res.data)
        throw new Error(res.errors || "Failed");

      return res.data;
    },
    enabled: !!travelId,
    ...normalCacheConfig,
  });
};

export const useGetBookings = (travelId: string) => {
  return useQuery({
    queryKey: hrKeys.bookingByTravelId(travelId),
    queryFn: async () => {
      const res = await travelService.getBooking(travelId);

      if (!res.success || !res.data)
        throw new Error(res.errors || "Failed");

      return res.data;
    },
    enabled: !!travelId,
    ...normalCacheConfig,
  });
};


export const useCreateTravel = () => {
    const queryClient = useQueryClient();
    const user = useAuth((state) => state.auth.user);

    return useMutation({
        mutationFn: async (
            data: Schemas["TravelRequest"]
        ) => {
            const response = await travelService.createTravel(
                data
            );

            if(!response.success) {
                throw new Error(response.errors || "Failed to create travel")
            }

            return response;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: hrKeys.allTravels(user?.role ?? "public") })
        }
    })
}

export const useUpdateTravel = () => {
    const queryClient = useQueryClient();
    const user = useAuth((state) => state.auth.user);

    return useMutation({
        mutationFn: async ({
            id,
            data
        } : {
            id: string,
            data: Schemas["TravelUpdateRequest"]
        }) => {
            const response = await travelService.updateTravel({
                id,
                data
            });

            if(!response.success) {
                throw new Error(response.errors || "Failed to create travel")
            }

            return response;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: hrKeys.allTravels(user?.role ?? "public") })
        }
    })
}

export const useDeleteTravel = () => {
    const queryClient = useQueryClient();
    const user = useAuth((state) => state.auth.user);

    return useMutation({
        mutationFn: async (
            id: string
        ) => {
            const response = await travelService.deleteTravel(
                id
            );

            if(!response.success) {
                throw new Error(response.errors || "Failed to create travel")
            }

            return response;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: hrKeys.allTravels(user?.role ?? "public") })
        }
    })
}


export const useAddMember = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            id,
            data
        } : {
            id: string,
            data: Schemas["TravelMemberRequest"]
        }) => {

            const response = await travelService.addMembers(
                id,
                data
            );

            if(!response.success) {
                throw new Error(response.errors || "Failed to create travel")
            }

            return response;
        },
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: hrKeys.membersByTravelId(id) })
        }
    })
}

export const useDeleteMember = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            memberId,
            travelId
        } : {
            memberId: string,
            travelId: string
        }) => {
            const response = await travelService.deleteMember(
                memberId
            );

            if(!response.success) {
                throw new Error(response.errors || "Failed to create travel")
            }

            return response;
        },
        onSuccess: (_, {travelId}) => {
            queryClient.invalidateQueries({ queryKey: hrKeys.membersByTravelId(travelId) })
        }
    })
}

export const useAddItinerary = () => {

    const queryClient = new QueryClient();

    return useMutation({
        mutationFn: async ({
            id,
            data
        } : {
            id: string,
            data: Schemas["TravelItineraryRequest"]
        }) => {

            const response = await travelService.addItinerary(
                id,
                data
            );

            if(!response.success) {
                throw new Error(response.errors || "Failed to create travel")
            }

            return response;
        },
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: hrKeys.travelById(id) })
        }
    })
}

export const useUpdateItinerary = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            id,
            data
        } : {
            id: string,
            data: Schemas["TravelItineraryRequest"]
        }) => {
            const response = await travelService.updateItinerary(
                id,
                data
            );

            if(!response.success) {
                throw new Error(response.errors || "Failed to create travel")
            }

            return response;
        },
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({queryKey: hrKeys.itineraryByTravelId(id) })
        }
    })
}

export const useUpdateBooking = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            travelId,
            bookingId,
            data
        } : {
            travelId: string,
            bookingId: string,
            data: Schemas["TravelBookingRequest"]
        }) => {
            const response = await travelService.updateBooking(
                bookingId,
                data
            );

            if(!response.success) {
                throw new Error(response.errors || "Failed to update booking")
            }

            return response;
        },
        onSuccess: (_, { travelId }) => {
            queryClient.invalidateQueries({queryKey: hrKeys.bookingByTravelId(travelId) })
        }
    })
}

export const useDeleteBooking = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            bookingId,
            travelId
        } : {
            bookingId: string,
            travelId: string
        }) => {
            const response = await travelService.deleteBooking(
                bookingId
            );

            if(!response.success) {
                throw new Error(response.errors || "Failed to delete booking")
            }

            return response;
        },
        onSuccess: (_, {travelId}) => {
            queryClient.invalidateQueries({ queryKey: hrKeys.bookingByTravelId(travelId) })
        }
    })
}

export const useAddBooking = () => {

    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            id,
            data
        } : {
            id: string,
            data: Schemas["TravelItineraryRequest"]
        }) => {

            const response = await travelService.addBooking(
                id,
                data
            );

            if(!response.success) {
                throw new Error(response.errors || "Failed to add booking")
            }

            return response;
        },
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: hrKeys.bookingByTravelId(id) })
        }
    })
}

export const useAddExpense = () => {

    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            id,
            data
        } : {
            id: string,
            data: Schemas["TravelExpenseRequest"]
        }) => {

            const response = await travelService.addExpense(
                id,
                data
            );

            if(!response.success) {
                throw new Error(response.errors || "Failed to add expense")
            }

            return response;
        },
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: hrKeys.expensesByTravelId(id) })
        }
    })
}

export const useApproveExpense = () => {

    const queryClient = useQueryClient();
    const role = useAuth((state) => state.auth.role);

    return useMutation({
        mutationFn: async ({
            expenseId,
            data
        } : {
            expenseId: string,
            data: string
        }
        ) => {

            const response = await travelService.approveExpense(
                expenseId,
                data
            );

            if(!response.success) {
                throw new Error(response.errors || "Failed to approve expense")
            }

            return response;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: hrKeys.travels() })
        }
    })
}

export const useRejectExpense = () => {

    const queryClient = useQueryClient();
    const role = useAuth((state) => state.auth.role);

    return useMutation({
        mutationFn: async ({
            expenseId,
            data
        } : {
            expenseId: string,
            data: string
        }
        ) => {

            const response = await travelService.rejectExpense(
                expenseId,
                data
            );

            if(!response.success) {
                throw new Error(response.errors || "Failed to reject expense")
            }

            return response;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: hrKeys.travels() })
        }
    })
}