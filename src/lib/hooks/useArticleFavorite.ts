import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '@/contexts/UserContextProvider';
import routerMeta from '@/lib/routerMeta';
import { useFavoriteArticleMutation, useUnfavoriteArticleMutation } from '@/queries/articles.query';

export const useArticleFavorite = () => {
  const { isLogin } = useContext(UserContext);
  const navigate = useNavigate();
  const favoriteArticleMutation = useFavoriteArticleMutation();
  const unfavoriteArticleMutation = useUnfavoriteArticleMutation();

  const toggleFavorite = async (slug: string, favorited: boolean) => {
    if (!isLogin) {
      navigate(routerMeta.SignInPage.path);
      return;
    }

    if (favorited) {
      await unfavoriteArticleMutation.mutateAsync({ slug });
    } else {
      await favoriteArticleMutation.mutateAsync({ slug });
    }
  };

  return {
    toggleFavorite,
    isFavoriteLoading: favoriteArticleMutation.isLoading || unfavoriteArticleMutation.isLoading,
  };
};
