import React, { ReactNode, ReactElement } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error) {
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error Boundary caught error:', error);
    }
  }

  render(): ReactElement {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="bg-white p-8 rounded shadow-lg max-w-md text-center">
            <h1 className="text-3xl font-bold text-red-600 mb-4">Oops!</h1>
            <p className="text-gray-700 mb-4">
              Something went wrong. We're working to fix it.
            </p>
            <details className="mb-4 text-left bg-gray-100 p-4 rounded text-sm text-gray-600">
              <summary className="cursor-pointer font-semibold">Error Details</summary>
              <pre className="mt-2 overflow-auto max-h-48">
                {this.state.error?.toString()}
              </pre>
            </details>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children as ReactElement;
  }
}
