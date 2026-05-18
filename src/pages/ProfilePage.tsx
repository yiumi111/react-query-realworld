import { useGetProfileQueries } from '@/queries/profiles.query';
import { NavLink, useMatch, useParams } from 'react-router-dom';
import { useState } from 'react';
import Profile from '@/components/Profile';
import FeedList from '@/components/feed/FeedList';

interface IProfileContentProps {
  username: string;
  isFavorited: boolean;
}

const ProfileContent = ({ username, isFavorited }: IProfileContentProps) => {
  const [page, setPage] = useState(1);
  const [profileInfo, articlesInfo] = useGetProfileQueries(username, page, isFavorited);

  return (
    <div className="profile-page">
      <Profile profile={profileInfo.data} />
      <div className="container">
        <div className="row">
          <div className="col-xs-12 col-md-10 offset-md-1">
            <div className="articles-toggle">
              <ul className="nav nav-pills outline-active">
                <li className="nav-item">
                  <NavLink
                    className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                    end
                    to={`/profile/${username}`}
                  >
                    My Articles
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink
                    className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                    end
                    to={`/profile/${username}/favorites`}
                  >
                    Favorited Articles
                  </NavLink>
                </li>
              </ul>
            </div>

            <FeedList articlesInfo={articlesInfo.data} page={page} setPage={setPage} />
          </div>
        </div>
      </div>
    </div>
  );
};

const ProfilePage = () => {
  const { username = '' } = useParams();
  const isFavorited = useMatch('/profile/:username/favorites') !== null;

  return (
    <ProfileContent
      key={`${username}-${isFavorited ? 'favorites' : 'articles'}`}
      username={username}
      isFavorited={isFavorited}
    />
  );
};

export default ProfilePage;
