import { useNavigate } from 'react-router-dom';

interface IErrorFallbackProps {
  resetErrorBoundary: (...args: unknown[]) => void;
}

const ErrorFallback = ({ resetErrorBoundary }: IErrorFallbackProps) => {
  const navigate = useNavigate();

  return (
    <div style={{ textAlign: 'center', padding: '2rem' }}>
      <h1 className="logo-font">Something went wrong</h1>
      <p>We couldn't load this page or data.</p>
      <div className="btn-group">
        <button type="button" className="btn btn-outline-danger" onClick={() => resetErrorBoundary()}>
          Try again
        </button>
        <button
          type="button"
          className="btn btn-outline-primary"
          onClick={() => {
            navigate('/', { replace: true });
            resetErrorBoundary();
          }}
        >
          Go Home
        </button>
      </div>
    </div>
  );
};

export default ErrorFallback;
