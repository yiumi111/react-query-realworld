import { QUERY_ARTICLES_KEY, QUERY_ARTICLE_KEY, QUERY_COMMENTS_KEY, QUERY_TAG_KEY } from '@/constants/query.constant';
import {
  getArticle,
  getArticles,
  createArticle,
  updateArticle,
  deleteArticle,
  getComments,
  createComment,
  deleteComment,
  favoriteArticle,
  unfavoriteArticle,
} from '@/repositories/articles/articlesRepository';
import { getTags } from '@/repositories/tags/tagsRepository';
import { useMutation, useQueries, useQueryClient } from '@tanstack/react-query';
import { IArticle } from '@/interfaces/main';

export const useGetArticlesQueries = (isGlobal: boolean, page: number, selectedTag: string) =>
  useQueries({
    queries: [
      {
        queryKey: [QUERY_ARTICLES_KEY, isGlobal, selectedTag, page],
        queryFn: () => getArticles({ isGlobal, selectedTag, page }).then((res) => res.data),
        staleTime: 20000,
      },
      {
        queryKey: [QUERY_TAG_KEY],
        queryFn: () => getTags().then((res) => res.data.tags),
        staleTime: 20000,
      },
    ],
  });

export const useGetArticleQueries = (slug: string) =>
  useQueries({
    queries: [
      {
        queryKey: [QUERY_ARTICLE_KEY, slug],
        queryFn: () => getArticle({ slug }).then((res) => res.data.article),
        staleTime: 20000,
      },
      {
        queryKey: [QUERY_COMMENTS_KEY, slug],
        queryFn: () => getComments({ slug }).then((res) => res.data.comments),
        staleTime: 20000,
      },
    ],
  });

export const useCreateArticleMutation = () => useMutation(createArticle);

export const useUpdateArticleMutation = () => useMutation(updateArticle);

export const useDeleteArticleMutation = () => useMutation(deleteArticle);

export const useCreateCommentMutation = () => useMutation(createComment);

export const useDeleteCommentMutation = () => useMutation(deleteComment);

export const useFavoriteArticleMutation = () => {
  const queryClient = useQueryClient();
  return useMutation(favoriteArticle, {
    onSuccess: (data, variables) => {
      const { slug } = variables;
      const updatedArticle = data.data.article as IArticle;

      // 更新文章详情缓存
      queryClient.setQueryData([QUERY_ARTICLE_KEY, slug], updatedArticle);

      // 更新所有包含该文章的列表缓存
      queryClient.setQueriesData<{ articles: IArticle[]; articlesCount: number }>(
        { queryKey: [QUERY_ARTICLES_KEY] },
        (oldData) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            articles: oldData.articles.map((article) => (article.slug === slug ? updatedArticle : article)),
          };
        },
      );
    },
  });
};

export const useUnfavoriteArticleMutation = () => {
  const queryClient = useQueryClient();
  return useMutation(unfavoriteArticle, {
    onSuccess: (data, variables) => {
      const { slug } = variables;
      const updatedArticle = data.data.article as IArticle;

      // 更新文章详情缓存
      queryClient.setQueryData([QUERY_ARTICLE_KEY, slug], updatedArticle);

      // 更新所有包含该文章的列表缓存
      queryClient.setQueriesData<{ articles: IArticle[]; articlesCount: number }>(
        { queryKey: [QUERY_ARTICLES_KEY] },
        (oldData) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            articles: oldData.articles.map((article) => (article.slug === slug ? updatedArticle : article)),
          };
        },
      );
    },
  });
};
