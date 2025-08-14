"use client";
import { usePathname } from "next/navigation";
import React, { Component, ReactNode } from "react";

interface ErrorBoundaryState {
  hasError: boolean;
  contentHeight?: number;
}

interface ErrorBoundaryProps {
  children: ReactNode;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, contentHeight: undefined };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error("Error caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <div className="flex items-center justify-center">Some thing went wrong</div>;
    }

    return this.props.children;
  }
}

const ErrorBoundaryWrapper = ({ children }: { children: ReactNode }) => {
  const pathname = usePathname();

  return <ErrorBoundary key={pathname}>{children}</ErrorBoundary>;
};

export default ErrorBoundaryWrapper;
