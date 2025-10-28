import React from "react";

type Props = {
  children: React.ReactNode;
  fallback?: React.ReactNode;
};

type State = {
  hasError: boolean;
};

export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown, info: unknown) {
    // Log the error for debugging
    // eslint-disable-next-line no-console
    console.error("ErrorBoundary caught error:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ? (
        <>{this.props.fallback}</>
      ) : (
        <div className="inline-flex h-5 w-5 items-center justify-center rounded-md bg-gray-200 text-gray-500">!</div>
      );
    }
    return this.props.children as React.ReactElement;
  }
}
