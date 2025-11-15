import React from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<ErrorBoundaryState>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent {...this.state} />;
      }

      return <DefaultErrorFallback {...this.state} onRetry={this.handleRetry} onReload={this.handleReload} />;
    }

    return this.props.children;
  }
}

interface DefaultErrorFallbackProps extends ErrorBoundaryState {
  onRetry: () => void;
  onReload: () => void;
}

function DefaultErrorFallback({ error, errorInfo, onRetry, onReload }: DefaultErrorFallbackProps) {
  const isChunkError = error?.message?.includes('ChunkLoadError') || 
                       error?.message?.includes('Loading chunk');

  return (
    <div className="min-h-[400px] flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="w-6 h-6 text-destructive" />
          </div>
          <CardTitle className="text-xl">
            {isChunkError ? 'App Update Available' : 'Something went wrong'}
          </CardTitle>
          <CardDescription>
            {isChunkError 
              ? 'A new version of the app is available. Please refresh to get the latest updates.'
              : 'An unexpected error occurred while loading this part of the application.'
            }
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {process.env.NODE_ENV === 'development' && error && (
            <details className="bg-muted rounded-lg p-4 text-sm">
              <summary className="cursor-pointer font-medium mb-2 flex items-center gap-2">
                <Bug className="w-4 h-4" />
                Error Details
              </summary>
              <div className="space-y-2">
                <div>
                  <strong>Error:</strong> {error.message}
                </div>
                {error.stack && (
                  <div>
                    <strong>Stack:</strong>
                    <pre className="mt-1 text-xs overflow-auto max-h-32 bg-background/50 p-2 rounded border">
                      {error.stack}
                    </pre>
                  </div>
                )}
                {errorInfo?.componentStack && (
                  <div>
                    <strong>Component Stack:</strong>
                    <pre className="mt-1 text-xs overflow-auto max-h-32 bg-background/50 p-2 rounded border">
                      {errorInfo.componentStack}
                    </pre>
                  </div>
                )}
              </div>
            </details>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={onRetry} variant="outline" className="flex-1 gap-2">
              <RefreshCw className="w-4 h-4" />
              Try Again
            </Button>
            <Button onClick={onReload} className="flex-1 gap-2">
              <Home className="w-4 h-4" />
              {isChunkError ? 'Refresh App' : 'Reload Page'}
            </Button>
          </div>

          <div className="text-center text-sm text-muted-foreground">
            If the problem persists, please contact support or check your internet connection.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}