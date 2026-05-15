import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '@/contexts/UserContextProvider';
import routerMeta from '@/lib/routerMeta';
import { useFollowUserMutation, useUnFollowUserMutation } from '@/queries/profiles.query';

export const useProfileFollow = () => {
  const { isLogin } = useContext(UserContext);
  const navigate = useNavigate();
  const followUserMutation = useFollowUserMutation();
  const unfollowUserMutation = useUnFollowUserMutation();

  const toggleFollow = async (username: string, following: boolean) => {
    if (!isLogin) {
      navigate(routerMeta.SignInPage.path);
      return;
    }

    if (following) {
      await unfollowUserMutation.mutateAsync({ username });
    } else {
      await followUserMutation.mutateAsync({ username });
    }
  };

  return {
    toggleFollow,
    isFollowLoading: followUserMutation.isLoading || unfollowUserMutation.isLoading,
  };
};
