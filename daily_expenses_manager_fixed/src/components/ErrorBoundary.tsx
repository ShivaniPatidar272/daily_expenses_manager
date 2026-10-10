import { Component, type ErrorInfo, type ReactNode } from "react";

/** Shows a readable message instead of a blank white page if rendering ever throws. */
export default class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state: { error: Error | null } = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("App crashed:", error, info.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;
    return <div className="crash">
      <h1>Something went wrong</h1>
      <p>The app hit an unexpected error. Your saved expenses are still stored in this browser.</p>
      <pre>{this.state.error.message}</pre>
      <button type="button" className="btn btn-primary" onClick={() => window.location.reload()}>Reload the page</button>
    </div>;
  }
}
