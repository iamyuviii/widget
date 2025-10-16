// // Google Sign-In blocker - prevents Google Sign-In from loading when not configured
// // This script should be loaded before any SSO widgets

// (function() {
//     'use strict';
    
//     console.log('🚫 Google Sign-In blocker initialized');

//     // Block gapi (Google API) if it tries to load
//     Object.defineProperty(window, 'gapi', {
//         get: function() {
//             // // console.warn('🚫 Google API (gapi) access blocked - not configured');
//             return undefined;
//         },
//         set: function() {
//             // console.warn('🚫 Attempt to set Google API (gapi) blocked');
//         },
//         configurable: false
//     });

//     // Block google object if it tries to load
//     Object.defineProperty(window, 'google', {
//         get: function() {
//             // console.warn('🚫 Google object access blocked - not configured');
//             return undefined;
//         },
//         set: function() {
//             // console.warn('🚫 Attempt to set Google object blocked');
//         },
//         configurable: false
//     });

//     // Block onGoogleLibraryLoad callback
//     Object.defineProperty(window, 'onGoogleLibraryLoad', {
//         get: function() {
//             // console.warn('🚫 Google Library Load callback blocked');
//             return function() {
//                 // console.warn('🚫 Google Library Load callback executed but blocked');
//             };
//         },
//         set: function() {
//             // console.warn('🚫 Attempt to set Google Library Load callback blocked');
//         },
//         configurable: false
//     });

//     // Block Google Sign-In specific callbacks
//     const googleCallbacks = [
//         'onGoogleSignInLoad',
//         'onGoogleYoloLoad',
//         'onGoogleAuthLoad'
//     ];

//     googleCallbacks.forEach(callback => {
//         Object.defineProperty(window, callback, {
//             get: function() {
//                 // console.warn(`🚫 ${callback} blocked`);
//                 return function() {
//                     // console.warn(`🚫 ${callback} executed but blocked`);
//                 };
//             },
//             set: function() {
//                 // console.warn(`🚫 Attempt to set ${callback} blocked`);
//             },
//             configurable: false
//         });
//     });

//     // Override fetch to block Google Sign-In related requests
//     const originalFetch = window.fetch;
//     window.fetch = function(url, options) {
//         if (typeof url === 'string' && (
//             url.includes('accounts.google.com') ||
//             url.includes('googleapis.com/oauth2') ||
//             url.includes('gstatic.com/oauth') ||
//             url.includes('google.com/js/client')
//         )) {
//             // console.warn('🚫 Blocked Google Sign-In related fetch request:', url);
//             return Promise.reject(new Error('Google Sign-In not configured'));
//         }
//         return originalFetch.apply(this, arguments);
//     };

//     // Override XMLHttpRequest to block Google Sign-In requests
//     const originalXHROpen = XMLHttpRequest.prototype.open;
//     XMLHttpRequest.prototype.open = function(method, url) {
//         if (typeof url === 'string' && (
//             url.includes('accounts.google.com') ||
//             url.includes('googleapis.com/oauth2') ||
//             url.includes('gstatic.com/oauth') ||
//             url.includes('google.com/js/client')
//         )) {
//             // console.warn('🚫 Blocked Google Sign-In related XHR request:', url);
//             throw new Error('Google Sign-In not configured');
//         }
//         return originalXHROpen.apply(this, arguments);
//     };

//     // Enhanced error blocking for Google Sign-In scripts
//     const originalCreateElement = document.createElement;
//     document.createElement = function(tagName) {
//         const element = originalCreateElement.call(this, tagName);
        
//         if (tagName.toLowerCase() === 'script') {
//             const originalSetAttribute = element.setAttribute;
//             element.setAttribute = function(name, value) {
//                 if (name === 'src' && typeof value === 'string' && 
//                     (value.includes('accounts.google.com') || 
//                      value.includes('gstatic.com/oauth') ||
//                      value.includes('google.com/js/client'))) {
//                     // Block Google Sign-In script loading
//                     return;
//                 }
//                 return originalSetAttribute.call(this, name, value);
//             };
            
//             const originalSrcSetter = Object.getOwnPropertyDescriptor(HTMLScriptElement.prototype, 'src') || 
//                                      Object.getOwnPropertyDescriptor(Element.prototype, 'src');
//             if (originalSrcSetter && originalSrcSetter.set) {
//                 Object.defineProperty(element, 'src', {
//                     set: function(value) {
//                         if (typeof value === 'string' && 
//                             (value.includes('accounts.google.com') || 
//                              value.includes('gstatic.com/oauth') ||
//                              value.includes('google.com/js/client'))) {
//                             // Block Google Sign-In script loading
//                             return;
//                         }
//                         return originalSrcSetter.set.call(this, value);
//                     },
//                     get: originalSrcSetter.get
//                 });
//             }
//         }
        
//         return element;
//     };

//     // Global error handler to suppress Google Sign-In errors
//     const originalErrorHandler = window.onerror;
//     window.onerror = function(message, source, lineno, colno, error) {
//         // Suppress errors from Google accounts domain
//         if (source && (source.includes('accounts.google.com') || source.includes('gstatic.com'))) {
//             console.warn('🚫 Suppressed Google Sign-In error:', message);
//             return true; // Prevent default error handling
//         }
        
//         // Suppress errors with Google-related messages
//         if (typeof message === 'string' && 
//             (message.includes('google') || message.includes('gapi') || message.toLowerCase().includes('oa'))) {
//             console.warn('🚫 Suppressed Google-related error:', message);
//             return true;
//         }
        
//         // Call original error handler for other errors
//         if (originalErrorHandler) {
//             return originalErrorHandler.apply(this, arguments);
//         }
//         return false;
//     };

//     // Handle unhandled promise rejections
//     const originalUnhandledRejection = window.onunhandledrejection;
//     window.onunhandledrejection = function(event) {
//         if (event.reason && typeof event.reason === 'string' && 
//             (event.reason.includes('accounts.google.com') || 
//              event.reason.includes('Google Sign-In') ||
//              event.reason.includes('gapi'))) {
//             console.warn('🚫 Suppressed Google Sign-In promise rejection:', event.reason);
//             event.preventDefault();
//             return;
//         }
        
//         if (originalUnhandledRejection) {
//             return originalUnhandledRejection.apply(this, arguments);
//         }
//     };

//     // Listen for and suppress Google-related error events
//     window.addEventListener('error', function(event) {
//         if (event.filename && (event.filename.includes('accounts.google.com') || 
//                               event.filename.includes('gstatic.com'))) {
//             console.warn('🚫 Suppressed Google Sign-In error event:', event.message);
//             event.stopPropagation();
//             event.preventDefault();
//         }
//     }, true);

//     console.log('✅ Google Sign-In blocker setup complete');
// })();
