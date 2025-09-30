/**
 * Early cache manager initialization
 * This script loads before the main application to catch early errors
 */

(function() {
  'use strict';

  // Early error patterns that should trigger cache clear
  const CRITICAL_ERROR_PATTERNS = [
    'Cannot read properties of null',
    'Cannot read property',
    'TypeError: Cannot read',
    'ChunkLoadError',
    'Loading chunk',
    'Loading CSS chunk',
    'Unexpected token',
    'SyntaxError',
    'Script error'
  ];

  // Check if error should trigger cache clear
  function shouldClearCache(error) {
    const errorMessage = error.message || '';
    const errorStack = error.stack || '';

    return CRITICAL_ERROR_PATTERNS.some(pattern =>
      errorMessage.includes(pattern) || errorStack.includes(pattern)
    );
  }

  // Clear all cookies
  function clearAllCookies() {
    try {
      const cookies = document.cookie.split(';');

      for (let cookie of cookies) {
        const eqPos = cookie.indexOf('=');
        const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();

        if (name) {
          // Clear for current domain
          document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/';

          // Clear for parent domain
          const domain = window.location.hostname.split('.').slice(-2).join('.');
          document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=.' + domain;
        }
      }
    } catch (error) {
      console.error('[EarlyCacheManager] Error clearing cookies:', error);
    }
  }

  // Show user-friendly message
  function showCacheClearMessage() {
    const message = 'Đã phát hiện lỗi hệ thống. Đang làm mới ứng dụng để khắc phục...';

    const overlay = document.createElement('div');
    overlay.style.cssText =
      'position: fixed;' +
      'top: 0;' +
      'left: 0;' +
      'width: 100%;' +
      'height: 100%;' +
      'background: rgba(0, 0, 0, 0.8);' +
      'color: white;' +
      'display: flex;' +
      'align-items: center;' +
      'justify-content: center;' +
      'font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;' +
      'font-size: 16px;' +
      'z-index: 9999;' +
      'text-align: center;' +
      'padding: 20px;';

    overlay.innerHTML =
      '<div style="background: white; color: #333; padding: 30px; border-radius: 10px; max-width: 400px;">' +
      '<div style="margin-bottom: 20px;">⚠️</div>' +
      '<div style="margin-bottom: 20px;">' + message + '</div>' +
      '<div style="font-size: 14px; opacity: 0.7;">Vui lòng đợi trong giây lát...</div>' +
      '</div>';

    document.body.appendChild(overlay);

    return overlay;
  }

  // Clear all and reload
  function clearAllAndReload(reason) {
    console.warn('[EarlyCacheManager] Clearing cache:', reason);

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
      clearAllCookies();

      // Force reload with cache bypass
      if (window.location) {
        window.location.reload(true);
      }
    } catch (error) {
      console.error('[EarlyCacheManager] Error during cache clearing:', error);
      // Fallback: just reload
      if (window.location) {
        window.location.reload();
      }
    }
  }

  // Early error handler
  window.addEventListener('error', function(event) {
    const error = event.error;
    if (error && shouldClearCache(error)) {
      console.error('[EarlyGlobal] Critical error detected:', error);
      const overlay = showCacheClearMessage();

      setTimeout(function() {
        clearAllAndReload('Early global error handler triggered');
      }, 2000);
    }
  });

  // Early unhandled promise rejection handler
  window.addEventListener('unhandledrejection', function(event) {
    const error = event.reason;
    if (error instanceof Error && shouldClearCache(error)) {
      console.error('[EarlyGlobal] Critical promise rejection:', error);
      const overlay = showCacheClearMessage();

      setTimeout(function() {
        clearAllAndReload('Early unhandled promise rejection');
      }, 2000);
    }
  });

  // Check for chunk loading errors on script load
  document.addEventListener('DOMContentLoaded', function() {
    const scripts = document.querySelectorAll('script[src]');
    scripts.forEach(function(script) {
      script.addEventListener('error', function() {
        console.error('[EarlyCacheManager] Script loading failed:', script.src);
        if (script.src && (script.src.includes('chunk') || script.src.includes('.js'))) {
          const overlay = showCacheClearMessage();
          setTimeout(function() {
            clearAllAndReload('Script chunk loading failed');
          }, 1000);
        }
      });
    });
  });

  console.log('[EarlyCacheManager] Initialized');
})();