import { useGetProfileQueries } from '@/queries/profiles.query';
import { NavLink, Route, Routes, useParams, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Profile from '@/components/Profile';
import FeedList from '@/components/feed/FeedList';

const ProfilePage = () => {
  const { username } = useParams<{ username: string }>();
  const location = useLocation();
  const [page, setPage] = useState(1);

  const isFavoritesTab = location.pathname.endsWith('/favorites');

  const [profileInfo, articlesInfo] = useGetProfileQueries(username ?? '', page, isFavoritesTab);

  useEffect(() => {
    setPage(1);
  }, [username, isFavoritesTab]);

  if (!username) {
    return null;
  }

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

            <Routes>
              <Route path="/" element={<FeedList articlesInfo={articlesInfo.data} page={page} setPage={setPage} />} />
              <Route
                path="/favorites"
                element={<FeedList articlesInfo={articlesInfo.data} page={page} setPage={setPage} />}
              />
            </Routes>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
