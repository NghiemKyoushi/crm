"use client";
import { usePathname } from "next/navigation";
import React, { Component, ReactNode } from "react";
import { CacheManager } from "@/utils/cache-manager";
import { useTranslation } from 'react-i18next';
import { Button } from "antd";

interface ErrorBoundaryState {
  hasError: boolean;
  contentHeight?: number;
  isClearing?: boolean;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  t: (key: string) => string;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, contentHeight: undefined, isClearing: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error("Error caught:", error, errorInfo);

    // Check if this is a critical error that requires cache clearing
    if (CacheManager.shouldClearCache(error)) {
      console.warn("[ErrorBoundary] Critical error detected, clearing cache...");
      this.setState({ isClearing: true });

      // Show message and clear cache after delay
      CacheManager.showCacheClearMessage();
      setTimeout(() => {
        CacheManager.clearAllAndReload("Error boundary triggered");
      }, 2000);
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, isClearing: false });
  };

  handleClearCache = () => {
    this.setState({ isClearing: true });
    CacheManager.showCacheClearMessage();
    setTimeout(() => {
      CacheManager.clearAllAndReload("Manual cache clear from error boundary");
    }, 1000);
  };

  render() {
    if (this.state.isClearing) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
          <div className="text-center p-10 bg-white rounded-2xl border border-gray-200 max-w-md w-full mx-4">
            <div className="relative mb-6">
              <div className="animate-spin w-12 h-12 border-3 border-gray-300 border-t-gray-800 rounded-full mx-auto"></div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {this.props.t('errorHandling.refreshingAppShort')}
            </h3>
            <p className="text-sm text-gray-500">
              {this.props.t('errorHandling.pleaseWait')}
            </p>
          </div>
        </div>
      );
    }

    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
          <div className="text-center p-10 bg-white rounded-2xl border border-gray-200 max-w-md w-full mx-4">
            {/* Modern Icon */}
            <div className="mb-6 flex items-center justify-center">
              <div className="relative">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Content */}
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              {this.props.t('errorHandling.somethingWentWrong')}
            </h2>
            <p className="text-sm text-gray-500 mb-8 leading-relaxed">
              {this.props.t('errorHandling.appEncounteredError')}
            </p>

            {/* Actions */}
            <div className="space-y-3">
                <Button
                onClick={this.handleRetry}
                className="w-full px-5 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-all duration-200 shadow-sm hover:shadow mb-2"
                >
                {this.props.t('errorHandling.tryAgain')}
                </Button>

                <Button
                onClick={this.handleClearCache}
                className="w-full px-5 py-2.5 bg-white text-gray-700 text-sm font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-all duration-200"
                >
                {this.props.t('errorHandling.refreshAndClearCache')}
                </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const ErrorBoundaryWrapper = ({ children }: { children: ReactNode }) => {
  const pathname = usePathname();
  const { t } = useTranslation();

  return <ErrorBoundary key={pathname} t={t}>{children}</ErrorBoundary>;
};

export default ErrorBoundaryWrapper;
