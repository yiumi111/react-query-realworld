import { lazy, Suspense } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import routerMeta, { IRouterMeta } from '@/lib/routerMeta';
import LoadingFallback from '@/components/LoadingFallback';
import ProtectedRoute from '@/components/HOC/ProtectedRoute';
import { useQueryErrorResetBoundary } from '@tanstack/react-query';
import { ErrorBoundary } from 'react-error-boundary';
import ErrorFallback from '@/components/ErrorFallback';
import Layout from '@/components/common/Layout';

const lazyImport = (pageName: string) => lazy(() => import(`@/pages/${pageName}`));

const assignRouter = Object.keys(routerMeta).map((componentKey: string) => {
  const props: IRouterMeta = routerMeta[componentKey];

  return {
    Component: lazyImport(componentKey),
    props,
  };
});

const Router = () => {
  const { reset } = useQueryErrorResetBoundary();
  const location = useLocation();

  return (
    <ErrorBoundary
      onReset={reset}
      resetKeys={[location.pathname]}
      fallbackRender={({ resetErrorBoundary }) => (
        <ErrorFallback resetErrorBoundary={resetErrorBoundary} />
      )}
    >
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route element={<Layout />}>
            {assignRouter.map(({ Component, props }) => (
              <Route
                key={props.path}
                path={props.path}
                element={
                  <ProtectedRoute path={props.path}>
                    <ErrorBoundary
                      onReset={reset}
                      resetKeys={[location.pathname]}
                      fallbackRender={({ resetErrorBoundary }) => (
                        <ErrorFallback resetErrorBoundary={resetErrorBoundary} />
                      )}
                    >
                      <Suspense fallback={<LoadingFallback />}>
                        <Component />
                      </Suspense>
                    </ErrorBoundary>
                  </ProtectedRoute>
                }
              />
            ))}
          </Route>
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
};

export default Router;
