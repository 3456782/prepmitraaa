import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
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
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      let errorMessage = "Something went wrong.";
      let isPermissionError = false;

      try {
        const parsedError = JSON.parse(this.state.error?.message || '{}');
        if (parsedError.error?.includes('Missing or insufficient permissions')) {
          isPermissionError = true;
          errorMessage = "You don't have permission to perform this action or view this data.";
        }
      } catch (e) {
        errorMessage = this.state.error?.message || errorMessage;
      }

      return (
        <div className="min-h-[400px] flex flex-col items-center justify-center p-8 text-center">
          <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mb-6">
            <AlertTriangle size={32} />
          </div>
          <h2 className="text-2xl font-black mb-4">Application Error</h2>
          <p className="text-zinc-400 max-w-md mb-8">
            {errorMessage}
          </p>
          <button
            onClick={this.handleReset}
            className="flex items-center gap-2 px-6 py-3 bg-zinc-900 text-white font-bold rounded-2xl hover:bg-zinc-800 transition-all border border-white/5"
          >
            <RefreshCw size={18} />
            Reload Application
          </button>
          
          {isPermissionError && (
            <p className="mt-6 text-xs text-zinc-600 italic">
              If this persists, please contact support or check your account status.
            </p>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
