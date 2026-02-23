export const userKeys = {
  all: ["users"] as const,

  profile: () => [...userKeys.all, "profile"] as const,
  myProfile: () => [...userKeys.profile(), "me"] as const,

  avatar: () => [...userKeys.profile(), "avatar"] as const,

  userProfile: (id: string) => [...userKeys.profile(), id] as const,

  account: () => [...userKeys.all, "account"],
  accountDetails: (id: string) => [...userKeys.account(), id] as const
};
