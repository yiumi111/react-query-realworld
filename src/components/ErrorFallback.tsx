import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';

interface IErrorFallbackProps {
  resetErrorBoundary: (...args: unknown[]) => void;
}

const ErrorFallback = ({ resetErrorBoundary }: IErrorFallbackProps) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const handleRetry = () => {
    queryClient.resetQueries();
    resetErrorBoundary();
  };

  const handleGoHome = () => {
    queryClient.clear();
    navigate('/', { replace: true });
  };

  return (
    <div style={{ textAlign: 'center', padding: '50px' }}>
      <h1 className="logo-font" style={{ marginBottom: '20px' }}>
        Oops! Something went wrong.
      </h1>
      <p style={{ color: '#666', marginBottom: '30px' }}>We encountered an error loading this page.</p>
      <div className="btn-group">
        <button type="button" className="btn btn-outline-danger" onClick={handleRetry}>
          Retry
        </button>
        <button type="button" className="btn btn-outline-primary" onClick={handleGoHome}>
          Go Home
        </button>
      </div>
    </div>
  );
};

export default ErrorFallback;
