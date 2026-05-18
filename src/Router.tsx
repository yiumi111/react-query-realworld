import { lazy, Suspense, useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import routerMeta, { IRouterMeta } from '@/lib/routerMeta';
import LoadingFallback from '@/components/LoadingFallback';
import ProtectedRoute from '@/components/HOC/ProtectedRoute';
import { useQueryErrorResetBoundary } from '@tanstack/react-query';
import { ErrorBoundary } from 'react-error-boundary';
import ErrorFallback from '@/components/ErrorFallback';
import Layout from '@/components/common/Layout';

interface IRouteElementProps {
  pageName: string;
  path: string;
}

const lazyImport = (pageName: string) => lazy(() => import(`@/pages/${pageName}`));

const assignRouter = Object.keys(routerMeta).map((componentKey: string) => {
  const props: IRouterMeta = routerMeta[componentKey];

  return {
    pageName: componentKey,
    props,
  };
});

const RouteFrame = () => {
  const { reset } = useQueryErrorResetBoundary();
  const location = useLocation();

  return (
    <ErrorBoundary
      onReset={reset}
      resetKeys={[location.key]}
      fallbackRender={({ error, resetErrorBoundary }) => (
        <ErrorFallback error={error} resetErrorBoundary={resetErrorBoundary} />
      )}
    >
      <Suspense fallback={<LoadingFallback />}>
        <Layout />
      </Suspense>
    </ErrorBoundary>
  );
};

const RouteElement = ({ pageName, path }: IRouteElementProps) => {
  const { reset } = useQueryErrorResetBoundary();
  const location = useLocation();
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [Component, setComponent] = useState(() => lazyImport(pageName));

  return (
    <ErrorBoundary
      onReset={reset}
      resetKeys={[location.key, loadAttempt]}
      fallbackRender={({ error, resetErrorBoundary }) => (
        <ErrorFallback
          error={error}
          resetErrorBoundary={resetErrorBoundary}
          onRetry={() => {
            setLoadAttempt((currentAttempt) => currentAttempt + 1);
            setComponent(() => lazyImport(pageName));
          }}
        />
      )}
    >
      <Suspense fallback={<LoadingFallback />}>
        <ProtectedRoute path={path}>
          <Component />
        </ProtectedRoute>
      </Suspense>
    </ErrorBoundary>
  );
};

const Router = () => {
  return (
    <Routes>
      <Route element={<RouteFrame />}>
        {assignRouter.map(({ pageName, props }) => (
          <Route key={props.path} path={props.path} element={<RouteElement pageName={pageName} path={props.path} />} />
        ))}
      </Route>
    </Routes>
  );
};

export default Router;
