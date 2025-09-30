"use client";
import { usePathname } from "next/navigation";
import React, { Component, ReactNode } from "react";
import { CacheManager } from "@/utils/cache-manager";
import { useTranslation } from 'react-i18next';

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
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
          <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md">
            <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-700 mb-2">{this.props.t('errorHandling.refreshingAppShort')}</p>
            <p className="text-sm text-gray-500">{this.props.t('errorHandling.pleaseWait')}</p>
          </div>
        </div>
      );
    }

    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
          <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md">
            <div className="text-red-500 text-4xl mb-4">⚠️</div>
            <h2 className="text-xl font-bold text-gray-800 mb-4">{this.props.t('errorHandling.somethingWentWrong')}</h2>
            <p className="text-gray-600 mb-6">{this.props.t('errorHandling.appEncounteredError')}</p>
            <div className="space-y-3">
              <button
                onClick={this.handleRetry}
                className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                {this.props.t('errorHandling.tryAgain')}
              </button>
              <button
                onClick={this.handleClearCache}
                className="w-full px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                {this.props.t('errorHandling.refreshAndClearCache')}
              </button>
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
