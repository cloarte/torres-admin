import React from "react";

interface ErrorBoundaryState {
  error: Error | null;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("[ErrorBoundary] caught:", error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="p-8 bg-destructive/10 border border-destructive/30 rounded m-4">
          <h2 className="text-destructive font-bold text-lg mb-2">
            Error detectado:
          </h2>
          <pre className="text-destructive text-sm whitespace-pre-wrap">
            {this.state.error.message}
            {"\n\n"}
            {this.state.error.stack}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}
