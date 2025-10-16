// // Global error handler for Google Sign-In and other SSO-related errors

// export class SSOErrorHandler {
//     constructor() {
//         this.originalConsoleError = console.error;
//         this.originalWindowError = window.onerror;
//         this.originalUnhandledRejection = window.onunhandledrejection;
//         this.setupErrorHandlers();
//     }

//     setupErrorHandlers() {
//         // Suppress Google Sign-In related errors
//         window.onerror = (message, source, lineno, colno, error) => {
//             if (this.isGoogleSignInError(message, source)) {
//                 console.warn('🔒 Google Sign-In error suppressed (not configured):', message);
//                 return true; // Prevent error from bubbling up
//             }
            
//             // Call original error handler if it exists
//             if (this.originalWindowError) {
//                 return this.originalWindowError.call(window, message, source, lineno, colno, error);
//             }
//             return false;
//         };

//         // Handle unhandled promise rejections
//         window.addEventListener('unhandledrejection', (event) => {
//             if (this.isGoogleSignInRejection(event.reason)) {
//                 console.warn('🔒 Google Sign-In promise rejection suppressed:', event.reason);
//                 event.preventDefault();
//             }
//         });

//         // Override console.error to filter out Google Sign-In errors
//         console.error = (...args) => {
//             const message = args.join(' ');
//             if (this.isGoogleSignInError(message)) {
//                 console.warn('🔒 Google Sign-In console error suppressed:', ...args);
//                 return;
//             }
//             this.originalConsoleError.apply(console, args);
//         };
//     }

//     isGoogleSignInError(message, source = '') {
//         if (!message && !source) return false;
        
//         const messageStr = String(message).toLowerCase();
//         const sourceStr = String(source).toLowerCase();
        
//         const googleSignInIndicators = [
//             'accounts.google.com',
//             'gsi/client',
//             'google sign-in',
//             'google oauth',
//             'gapi',
//             'googleapis.com',
//             'client_id',
//             'oauth2'
//         ];
        
//         return googleSignInIndicators.some(indicator => 
//             messageStr.includes(indicator) || sourceStr.includes(indicator)
//         );
//     }

//     isGoogleSignInRejection(reason) {
//         if (!reason) return false;
        
//         const reasonStr = String(reason).toLowerCase();
//         return this.isGoogleSignInError(reasonStr);
//     }

//     // Clean up error handlers
//     cleanup() {
//         window.onerror = this.originalWindowError;
//         window.onunhandledrejection = this.originalUnhandledRejection;
//         console.error = this.originalConsoleError;
//     }
// }

// // Create global instance
// export const ssoErrorHandler = new SSOErrorHandler();

// // Export utility functions
// export const suppressGoogleSignInErrors = () => {
//     return new SSOErrorHandler();
// };
