import routerMeta from '@/lib/routerMeta';
import { useFollowUserMutation, useUnFollowUserMutation } from '@/queries/profiles.query';
import { useGetUserQuery } from '@/queries/user.query';
import { Link } from 'react-router-dom';

interface IFollowButton {
  profileName: string;
  isFollow: boolean;
}

const FollowButton = ({ profileName, isFollow }: IFollowButton) => {
  const { data } = useGetUserQuery();
  const followUserMutation = useFollowUserMutation();
  const unfollowUserMutation = useUnFollowUserMutation();
  const isMutating = followUserMutation.isLoading || unfollowUserMutation.isLoading;

  const onToggleFollow = () => {
    if (isFollow) {
      unfollowUserMutation.mutate({ username: profileName });
      return;
    }

    followUserMutation.mutate({ username: profileName });
  };

  return (
    <>
      {data.username === profileName ? (
        <Link to={routerMeta.SettingPage.path} className="btn btn-sm btn-outline-secondary action-btn">
          <i className="ion-gear-a"></i>&nbsp; Edit Profile Settings
        </Link>
      ) : (
        <button
          type="button"
          className={`btn btn-sm btn-outline-${isFollow ? 'primary' : 'secondary'} action-btn`}
          disabled={isMutating}
          onClick={onToggleFollow}
        >
          <i className="ion-plus-round"></i>
          &nbsp; {isFollow ? 'Unfollow' : 'Follow'} {profileName}
        </button>
      )}
    </>
  );
};

export default FollowButton;
