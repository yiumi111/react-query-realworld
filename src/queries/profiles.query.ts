import { QUERY_ARTICLES_KEY, QUERY_PROFILE_KEY } from '@/constants/query.constant';
import { getArticles } from '@/repositories/articles/articlesRepository';
import { followUser, getProfile, unfollowUser } from '@/repositories/profiles/profileRepository';
import { useMutation, useQueries, useQueryClient } from '@tanstack/react-query';

export const useGetProfileQueries = (username: string, page: number, isFavorited: boolean) =>
  useQueries({
    queries: [
      {
        queryKey: [QUERY_PROFILE_KEY, username],
        queryFn: () => getProfile({ username }).then((res) => res.data.profile),
        staleTime: 20000,
      },
      {
        queryKey: [QUERY_ARTICLES_KEY, username, page, isFavorited],
        queryFn: () => getArticles({ username, page, isFavorited }).then((res) => res.data),
        staleTime: 20000,
      },
    ],
  });

export const useFollowUserMutation = () => {
  const queryClient = useQueryClient();
  return useMutation(followUser, {
    onSuccess: (data, variables) => {
      const { username } = variables;
      const updatedProfile = data.data.profile;

      // 更新 Profile 页面缓存
      queryClient.setQueryData([QUERY_PROFILE_KEY, username], updatedProfile);

      // 更新所有文章列表中该作者的 following 状态
      queryClient.setQueriesData<{ articles: any[]; articlesCount: number }>(
        { queryKey: [QUERY_ARTICLES_KEY] },
        (oldData) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            articles: oldData.articles.map((article) => {
              if (article.author.username === username) {
                return {
                  ...article,
                  author: {
                    ...article.author,
                    following: true,
                  },
                };
              }
              return article;
            }),
          };
        },
      );
    },
  });
};

export const useUnFollowUserMutation = () => {
  const queryClient = useQueryClient();
  return useMutation(unfollowUser, {
    onSuccess: (data, variables) => {
      const { username } = variables;
      const updatedProfile = data.data.profile;

      // 更新 Profile 页面缓存
      queryClient.setQueryData([QUERY_PROFILE_KEY, username], updatedProfile);

      // 更新所有文章列表中该作者的 following 状态
      queryClient.setQueriesData<{ articles: any[]; articlesCount: number }>(
        { queryKey: [QUERY_ARTICLES_KEY] },
        (oldData) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            articles: oldData.articles.map((article) => {
              if (article.author.username === username) {
                return {
                  ...article,
                  author: {
                    ...article.author,
                    following: false,
                  },
                };
              }
              return article;
            }),
          };
        },
      );
    },
  });
};
