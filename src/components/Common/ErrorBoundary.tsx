import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] w-full p-6 text-center border-2 border-dashed border-red-500/20 bg-red-50 dark:bg-red-950/10 rounded-2xl">
          <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-500 mb-4">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-red-700 dark:text-red-400 mb-2">Something went wrong</h2>
          <p className="text-sm text-red-600/80 dark:text-red-400/80 mb-6 max-w-md">
            {this.state.error?.message || 'An unexpected error occurred in this component.'}
          </p>
          <button
            onClick={this.handleReset}
            className="px-6 py-2.5 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold rounded-xl shadow-lg shadow-red-500/20 transition-all active:scale-95"
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
