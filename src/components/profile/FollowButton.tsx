import routerMeta from '@/lib/routerMeta';
import { useProfileFollow } from '@/lib/hooks/useProfileFollow';
import { useGetUserQuery } from '@/queries/user.query';
import { Link } from 'react-router-dom';

interface IFollowButton {
  profileName: string;
  isFollow: boolean;
}

const FollowButton = ({ profileName, isFollow }: IFollowButton) => {
  const { data } = useGetUserQuery();
  const { toggleFollow, isFollowLoading } = useProfileFollow();

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
          onClick={() => toggleFollow(profileName, isFollow)}
          disabled={isFollowLoading}
        >
          <i className="ion-plus-round"></i>
          &nbsp; Follow {profileName}
        </button>
      )}
    </>
  );
};

export default FollowButton;
