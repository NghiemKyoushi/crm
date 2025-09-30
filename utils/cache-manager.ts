/**
 * Cache Management Utility
 * Handles clearing browser cache, cookies, and localStorage on critical errors
 */

export class CacheManager {
  /**
   * Check if running in browser environment
   */
  static isClient(): boolean {
    return typeof window !== 'undefined' && typeof document !== 'undefined';
  }
  /**
   * Clear all application data and force reload
   */
  static async clearAllAndReload(reason = 'Critical error detected') {
    if (!this.isClient()) {
      console.warn('[CacheManager] Not in client environment, skipping cache clear');
      return;
    }

    console.warn(`[CacheManager] Clearing cache: ${reason}`);

    try {
      // Clear localStorage
      if (typeof localStorage !== 'undefined') {
        localStorage.clear();
      }

      // Clear sessionStorage
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.clear();
      }

      // Clear cookies
      this.clearAllCookies();

      // Clear service worker cache if available
      await this.clearServiceWorkerCache();

      // Force reload with cache bypass
      if (typeof window !== 'undefined' && window.location) {
        window.location.reload();
      }
    } catch (error) {
      console.error('[CacheManager] Error during cache clearing:', error);
      // Fallback: just reload
      if (typeof window !== 'undefined' && window.location) {
        window.location.reload();
      }
    }
  }

  /**
   * Clear all cookies
   */
  static clearAllCookies() {
    if (!this.isClient() || typeof document === 'undefined') {
      return;
    }

    try {
      const cookies = document.cookie.split(';');

      for (let cookie of cookies) {
        const eqPos = cookie.indexOf('=');
        const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();

        if (name) {
          // Clear for current domain
          document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;

          // Clear for parent domain
          const domain = window.location.hostname.split('.').slice(-2).join('.');
          document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=.${domain}`;
        }
      }
    } catch (error) {
      console.error('[CacheManager] Error clearing cookies:', error);
    }
  }

  /**
   * Clear service worker cache
   */
  static async clearServiceWorkerCache() {
    if (!this.isClient()) {
      return;
    }

    try {
      if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const registration of registrations) {
          await registration.unregister();
        }
      }

      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
      }
    } catch (error) {
      console.error('[CacheManager] Error clearing service worker cache:', error);
    }
  }

  /**
   * Check if error should trigger cache clear
   */
  static shouldClearCache(error: Error): boolean {
    const errorMessage = error.message || '';
    const errorStack = error.stack || '';

    // Clear cache for these specific error patterns
    const criticalPatterns = [
      'Cannot read properties of null',
      'Cannot read property',
      // 'TypeError: Cannot read',
      'ChunkLoadError',
      'Loading chunk',
      'Loading CSS chunk',
      'Unexpected token',
      // 'SyntaxError',
      'Script error'
    ];

    return criticalPatterns.some(pattern =>
      errorMessage.includes(pattern) || errorStack.includes(pattern)
    );
  }

  /**
   * Clear only authentication data
   */
  static clearAuthData() {
    if (!this.isClient()) {
      return;
    }

    try {
      // Clear auth tokens
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
      }

      // Clear auth cookies
      if (typeof document !== 'undefined') {
        const authCookies = ['token', 'accessToken', 'refreshToken', 'session'];
        authCookies.forEach(cookieName => {
          document.cookie = `${cookieName}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
        });
      }

      console.log('[CacheManager] Auth data cleared');
    } catch (error) {
      console.error('[CacheManager] Error clearing auth data:', error);
    }
  }

  /**
   * Show user-friendly error message before cache clear
   */
  static showCacheClearMessage(translations?: { systemError: string; refreshingApp: string; pleaseWait: string }) {
    if (!this.isClient() || typeof document === 'undefined') {
      return null;
    }

    const defaultMessages = {
      systemError: 'Critical error detected',
      refreshingApp: 'Refreshing application to fix...',
      pleaseWait: 'Please wait a moment...'
    };

    const messages = translations || defaultMessages;

    // Create temporary overlay
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      font-size: 16px;
      z-index: 9999;
      text-align: center;
      padding: 20px;
    `;

    overlay.innerHTML = `
      <div style="background: white; color: #333; padding: 30px; border-radius: 10px; max-width: 400px;">
        <div style="margin-bottom: 20px;">⚠️</div>
        <div style="margin-bottom: 20px;">${messages.refreshingApp}</div>
        <div style="font-size: 14px; opacity: 0.7;">${messages.pleaseWait}</div>
      </div>
    `;

    document.body.appendChild(overlay);

    // Auto remove after 3 seconds
    setTimeout(() => {
      if (overlay.parentNode) {
        overlay.parentNode.removeChild(overlay);
      }
    }, 3000);
  }
}

// Global error handler - only in client environment
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    const error = event.error;
    if (error && CacheManager.shouldClearCache(error)) {
      console.error('[Global] Critical error detected:', error);
      CacheManager.showCacheClearMessage();
      setTimeout(() => {
        CacheManager.clearAllAndReload('Global error handler triggered');
      }, 2000);
    }
  });

  // Unhandled promise rejection handler
  window.addEventListener('unhandledrejection', (event) => {
    const error = event.reason;
    if (error instanceof Error && CacheManager.shouldClearCache(error)) {
      console.error('[Global] Critical promise rejection:', error);
      CacheManager.showCacheClearMessage();
      setTimeout(() => {
        CacheManager.clearAllAndReload('Unhandled promise rejection');
      }, 2000);
    }
  });
}