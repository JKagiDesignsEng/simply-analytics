/**
 * Simply Analytics - Cookieless Web Analytics Tracking Script
 * A lightweight, privacy-focused tracking script for web analytics
 */

(function () {
    'use strict';

    // Get configuration from script tag attributes
    const scriptTag = document.currentScript || document.querySelector('script[data-website-id]');
    const websiteId = scriptTag?.getAttribute('data-website-id');
    
    // Smart API URL detection: use the origin where the tracking script is hosted
    let apiUrl = scriptTag?.getAttribute('data-api-url') || window.SIMPLY_ANALYTICS_URL;
    if (!apiUrl && scriptTag?.src) {
        // Extract origin from the script's source URL
        try {
            const scriptUrl = new URL(scriptTag.src);
            apiUrl = scriptUrl.origin;
        } catch (e) {
            // Fallback to window location origin
            apiUrl = window.location.origin;
        }
    } else if (!apiUrl) {
        apiUrl = window.location.origin;
    }

    // Configuration
    const CONFIG = {
        websiteId: websiteId,
        apiUrl: apiUrl,
        endpoint: '/api/track',
        sessionDuration: 30 * 60 * 1000, // 30 minutes
        heartbeatInterval: 15 * 1000, // 15 seconds
    };

    // State
    let sessionId = null;
    let startTime = Date.now();
    let lastActivity = Date.now();
    let isTracking = true;
    let heartbeatTimer = null;

    // Utility functions
    function generateSessionId() {
        return (
            'sa_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now()
        );
    }

    function getSessionId() {
        if (!sessionId) {
            // Try to get from sessionStorage first
            sessionId = sessionStorage.getItem('sa_session_id');

            if (!sessionId || isSessionExpired()) {
                sessionId = generateSessionId();
                sessionStorage.setItem('sa_session_id', sessionId);
                sessionStorage.setItem(
                    'sa_session_start',
                    Date.now().toString()
                );
            }
        }
        return sessionId;
    }

    function isSessionExpired() {
        const sessionStart = sessionStorage.getItem('sa_session_start');
        if (!sessionStart) return true;

        return Date.now() - parseInt(sessionStart) > CONFIG.sessionDuration;
    }

    function updateActivity() {
        lastActivity = Date.now();
        sessionStorage.setItem('sa_last_activity', lastActivity.toString());
    }

    function getScreenInfo() {
        return {
            screenWidth: screen.width,
            screenHeight: screen.height,
            viewportWidth: window.innerWidth,
            viewportHeight: window.innerHeight,
            colorDepth: screen.colorDepth,
            pixelRatio: window.devicePixelRatio || 1,
        };
    }
    
    function getConnectionInfo() {
        const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        if (connection) {
            return {
                effectiveType: connection.effectiveType, // '4g', '3g', etc.
                downlink: connection.downlink, // Mbps
                rtt: connection.rtt, // Round-trip time in ms
                saveData: connection.saveData, // Data saver mode
            };
        }
        return {};
    }
    
    function getPerformanceMetrics() {
        if (typeof PerformanceNavigationTiming !== 'undefined') {
            const perfData = performance.getEntriesByType('navigation')[0];
            if (perfData) {
                return {
                    loadTime: Math.round(perfData.loadEventEnd - perfData.fetchStart),
                    domContentLoaded: Math.round(perfData.domContentLoadedEventEnd - perfData.fetchStart),
                    firstPaint: performance.getEntriesByType('paint').find(e => e.name === 'first-paint')?.startTime || null,
                    firstContentfulPaint: performance.getEntriesByType('paint').find(e => e.name === 'first-contentful-paint')?.startTime || null,
                };
            }
        }
        return {};
    }
    
    function getLanguageAndTimezone() {
        return {
            language: navigator.language || navigator.userLanguage,
            languages: navigator.languages ? navigator.languages.join(',') : null,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            timezoneOffset: new Date().getTimezoneOffset(),
        };
    }

    function getCurrentPath() {
        return location.pathname + location.search;
    }

    function getReferrer() {
        return document.referrer || '';
    }

    function getDomain() {
        return location.hostname;
    }

    // Tracking functions
    function sendTrackingData(data) {
        if (!isTracking) return;

        const payload = {
            websiteId: CONFIG.websiteId,
            domain: getDomain(),
            sessionId: getSessionId(),
            timestamp: new Date().toISOString(),
            ...getScreenInfo(),
            ...getLanguageAndTimezone(),
            connection: getConnectionInfo(),
            performance: data.eventName !== 'heartbeat' ? getPerformanceMetrics() : undefined,
            ...data,
        };

        // Use fetch with keepalive for better compatibility
        fetch(CONFIG.apiUrl + CONFIG.endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
            keepalive: true,
        }).catch(() => {
            // Silently fail - analytics shouldn't break the user experience
        });
    }

    function trackPageView() {
        const duration = Date.now() - startTime;

        sendTrackingData({
            path: getCurrentPath(),
            referrer: getReferrer(),
            duration: Math.round(duration / 1000), // Convert to seconds
        });

        // Reset start time for next page view
        startTime = Date.now();
        updateActivity();
    }

    function trackEvent(eventName, eventData = {}) {
        sendTrackingData({
            path: getCurrentPath(),
            eventName: eventName,
            eventData: eventData,
        });
        updateActivity();
    }

    function trackHeartbeat() {
        // Only track if user has been active recently
        const timeSinceActivity = Date.now() - lastActivity;
        if (timeSinceActivity < CONFIG.heartbeatInterval * 2) {
            const duration = Date.now() - startTime;
            sendTrackingData({
                path: getCurrentPath(),
                duration: Math.round(duration / 1000),
                eventName: 'heartbeat',
            });
        }
    }

    // Event listeners
    function attachEventListeners() {
        // Track user activity
        ['click', 'scroll', 'keypress', 'mousemove', 'touchstart'].forEach(
            (event) => {
                document.addEventListener(event, updateActivity, {
                    passive: true,
                });
            }
        );

        // Track page visibility changes
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                trackPageView(); // Track when leaving page
                clearInterval(heartbeatTimer);
            } else {
                startTime = Date.now(); // Reset when returning
                startHeartbeat();
            }
        });

        // Track before page unload
        window.addEventListener('beforeunload', () => {
            trackPageView();
        });

        // Track hash changes (for SPAs)
        window.addEventListener('hashchange', () => {
            trackPageView();
        });

        // Track history changes (for SPAs)
        const originalPushState = history.pushState;
        const originalReplaceState = history.replaceState;

        history.pushState = function () {
            originalPushState.apply(history, arguments);
            setTimeout(trackPageView, 0);
        };

        history.replaceState = function () {
            originalReplaceState.apply(history, arguments);
            setTimeout(trackPageView, 0);
        };

        window.addEventListener('popstate', () => {
            setTimeout(trackPageView, 0);
        });
    }

    function startHeartbeat() {
        heartbeatTimer = setInterval(trackHeartbeat, CONFIG.heartbeatInterval);
    }

    // Public API
    window.sa = window.sa || {};
    window.sa.track = trackEvent;
    window.sa.pageview = trackPageView;
    window.sa.stop = () => {
        isTracking = false;
        clearInterval(heartbeatTimer);
    };
    window.sa.start = () => {
        isTracking = true;
        startHeartbeat();
    };

    // Auto-track common events
    function setupAutoTracking() {
        // Track clicks on external links
        document.addEventListener('click', (event) => {
            const link = event.target.closest('a');
            if (link && link.hostname !== location.hostname) {
                trackEvent('external_link_click', {
                    url: link.href,
                    text: link.textContent.trim().substring(0, 100),
                });
            }
        });

        // Track form submissions
        document.addEventListener('submit', (event) => {
            const form = event.target;
            if (form.tagName === 'FORM') {
                trackEvent('form_submit', {
                    action: form.action || getCurrentPath(),
                    method: form.method || 'GET',
                });
            }
        });

        // Track file downloads
        document.addEventListener('click', (event) => {
            const link = event.target.closest('a');
            if (link && link.href) {
                const extension = link.href.split('.').pop().toLowerCase();
                const downloadExtensions = [
                    'pdf',
                    'doc',
                    'docx',
                    'xls',
                    'xlsx',
                    'ppt',
                    'pptx',
                    'zip',
                    'rar',
                    'mp3',
                    'mp4',
                    'avi',
                ];

                if (downloadExtensions.includes(extension)) {
                    trackEvent('file_download', {
                        url: link.href,
                        extension: extension,
                        filename: link.href.split('/').pop(),
                    });
                }
            }
        });

        // Track scroll depth
        let maxScroll = 0;
        let scrollMarkers = [25, 50, 75, 90];
        let trackedMarkers = [];

        function trackScrollDepth() {
            const scrollTop =
                window.pageYOffset || document.documentElement.scrollTop;
            const docHeight =
                document.documentElement.scrollHeight - window.innerHeight;
            const scrollPercent = Math.round((scrollTop / docHeight) * 100);

            if (scrollPercent > maxScroll) {
                maxScroll = scrollPercent;

                scrollMarkers.forEach((marker) => {
                    if (
                        scrollPercent >= marker &&
                        !trackedMarkers.includes(marker)
                    ) {
                        trackedMarkers.push(marker);
                        trackEvent('scroll_depth', { depth: marker });
                    }
                });
            }
        }

        window.addEventListener('scroll', throttle(trackScrollDepth, 1000), {
            passive: true,
        });
    }

    // Utility function for throttling
    function throttle(func, limit) {
        let inThrottle;
        return function () {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => (inThrottle = false), limit);
            }
        };
    }

    // Initialize
    function init() {
        // Check if websiteId is provided
        if (!CONFIG.websiteId) {
            console.error('Simply Analytics: Website ID not found. Please add data-website-id attribute to the tracking script.');
            return;
        }

        // Don't track if Do Not Track is enabled
        if (navigator.doNotTrack === '1' || window.doNotTrack === '1') {
            console.log(
                'Simply Analytics: Tracking disabled due to Do Not Track setting'
            );
            return;
        }

        // Initialize tracking
        attachEventListeners();
        setupAutoTracking();
        startHeartbeat();

        // Track initial page view
        trackPageView();

        console.log('Simply Analytics: Tracking initialized for website:', CONFIG.websiteId);
    }

    // Start when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
