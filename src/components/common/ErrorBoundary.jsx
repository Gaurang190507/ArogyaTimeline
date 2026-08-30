import React from 'react';

/**
 * Lightweight React ErrorBoundary.
 * Catches unhandled errors in child components and renders a
 * graceful fallback instead of a white-screen crash.
 *
 * Usage:
 *   <ErrorBoundary>
 *     <MyComponent />
 *   </ErrorBoundary>
 */
export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', error, info?.componentStack);
  }

  render() {
    if (this.state.error) {
      const onReset = this.props.onReset || (() => this.setState({ error: null }));
      return (
        <div className="min-h-[200px] flex items-center justify-center bg-red-50 rounded-2xl p-6 text-center">
          <div className="max-w-sm">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-lg">⚠️</span>
            </div>
            <h3 className="text-sm font-bold text-slate-800 mb-1">
              Something went wrong
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              {this.state.error.message || 'An unexpected error occurred.'}
            </p>
            <button
              onClick={onReset}
              className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
