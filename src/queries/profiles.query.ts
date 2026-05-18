import { QUERY_ARTICLES_KEY, QUERY_ARTICLE_KEY, QUERY_PROFILE_KEY } from '@/constants/query.constant';
import { getArticles } from '@/repositories/articles/articlesRepository';
import { followUser, getProfile, unfollowUser } from '@/repositories/profiles/profileRepository';
import { useMutation, useQueries, useQueryClient } from '@tanstack/react-query';

export const useGetProfileQueries = (username: string, page: number, isFavorited: boolean) => {
  return useQueries({
    queries: [
      {
        queryKey: [QUERY_PROFILE_KEY, username],
        queryFn: () => getProfile({ username }).then((res) => res.data.profile),
        staleTime: 20000,
        enabled: Boolean(username),
      },
      {
        queryKey: [QUERY_ARTICLES_KEY, username, page, isFavorited],
        queryFn: () => getArticles({ username, page, isFavorited }).then((res) => res.data),
        staleTime: 20000,
        enabled: Boolean(username),
      },
    ],
  });
};

const useProfileMutation = (mutationFn: typeof followUser | typeof unfollowUser) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onSuccess: (response, variables) => {
      queryClient.setQueryData([QUERY_PROFILE_KEY, variables.username], response.data.profile);
      queryClient.invalidateQueries({ queryKey: [QUERY_PROFILE_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_ARTICLE_KEY] });
    },
  });
};

export const useFollowUserMutation = () => useProfileMutation(followUser);

export const useUnFollowUserMutation = () => useProfileMutation(unfollowUser);
