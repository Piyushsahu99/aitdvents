import { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-red-50 via-background to-orange-50 dark:from-red-950/20 dark:via-background dark:to-orange-950/20">
          <Card className="max-w-lg w-full border-red-200 dark:border-red-800">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 rounded-full bg-red-100 dark:bg-red-900/30">
                  <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
                <CardTitle className="text-xl">Something went wrong</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                We encountered an unexpected error. This has been logged and we'll look into it.
              </p>
              
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="p-3 bg-muted rounded-lg text-xs">
                  <summary className="cursor-pointer font-semibold mb-2">Error Details</summary>
                  <pre className="overflow-auto text-red-600 dark:text-red-400">
                    {this.state.error.toString()}
                  </pre>
                </details>
              )}

              <div className="flex gap-3">
                <Button 
                  onClick={this.handleReset}
                  className="flex-1"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reload Page
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => window.location.href = '/'}
                  className="flex-1"
                >
                  Go Home
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
