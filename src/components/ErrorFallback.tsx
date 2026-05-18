import { useNavigate } from 'react-router-dom';

interface IErrorFallbackProps {
  error?: Error;
  resetErrorBoundary: (...args: unknown[]) => void;
  onRetry?: () => void;
}

const ErrorFallback = ({ error, resetErrorBoundary, onRetry }: IErrorFallbackProps) => {
  const navigate = useNavigate();
  const message = error?.message || 'Something went wrong while loading this page.';

  return (
    <div style={{ textAlign: 'center' }}>
      <h1 className="logo-font">Something went wrong</h1>
      <p>{message}</p>
      <div className="btn-group">
        <button
          type="button"
          className="btn btn-outline-danger"
          onClick={() => {
            onRetry?.();
            resetErrorBoundary();
          }}
        >
          Try again
        </button>
        <button type="button" className="btn btn-outline-primary" onClick={() => navigate('/')}>
          Go Home
        </button>
      </div>
    </div>
  );
};

export default ErrorFallback;
