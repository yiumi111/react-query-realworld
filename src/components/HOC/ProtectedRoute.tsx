import routerMeta from '@/lib/routerMeta';
import { Navigate } from 'react-router-dom';
import { ReactElement, useContext } from 'react';
import { UserContext } from '@/contexts/UserContextProvider';

interface IProtectedRoute {
  children: ReactElement;
  path: string;
}

const ProtectedRoute = ({ children, path }: IProtectedRoute) => {
  const { isLogin } = useContext(UserContext);

  if (
    !isLogin &&
    (path === routerMeta.NewArticlePage.path ||
      path === routerMeta.EditArticlePage.path ||
      path === routerMeta.SettingPage.path)
  ) {
    return <Navigate to={routerMeta.SignInPage.path} replace={true} />;
  }

  if (isLogin && (path === routerMeta.SignUpPage.path || path === routerMeta.SignInPage.path)) {
    return <Navigate to={routerMeta.HomePage.path} replace={true} />;
  }

  return children;
};

export default ProtectedRoute;
