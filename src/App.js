// import React, { useState, useCallback } from 'react';
// import { BrowserRouter, Route, Switch } from 'react-router-dom';
// import LoginSignup from './components/LoginSignup';
// import { ssoErrorHandler } from './utils/errorHandler';
// import './App.css';

// // Set the base path for your app
// window.BASE_PATH = process.env.PUBLIC_URL || '';

// function App() {
//   // Global state for SSO Configuration
//   const [ssoConfig, setSsoConfig] = useState({
//     channel: '',
//     channelLogo: '',
//     ru: '',
//     socialLoginRu: '',
//     fbClientId: '',
//     googleClientId: '',
//     appleClientId: '',
//     termsurl: '',
//     policyurl: ''
//   });

//   // Global state for Profile Widget Configuration
//   const [profileConfig, setProfileConfig] = useState({
//     channel: '',
//     staticUrl: '',
//     nonLoggedInRu: '/',
//     closeButtonRequired: true
//   });

//   // Initialize error handling for SSO-related errors
//   React.useEffect(() => {
//     return () => {
//       // Cleanup on unmount
//       if (ssoErrorHandler && ssoErrorHandler.cleanup) {
//         ssoErrorHandler.cleanup();
//       }
//     };
//   }, []);

//   // Create stable route components using render functions
//   const renderHome = () => (
//     <LoginSignup 
//       ssoConfig={ssoConfig}
//       setSsoConfig={setSsoConfig}
//       profileConfig={profileConfig}
//       setProfileConfig={setProfileConfig}
//     />
//   );

//   const renderLogin = () => (
//     <LoginSignup 
//       page="login" 
//       ssoConfig={ssoConfig}
//       setSsoConfig={setSsoConfig}
//       profileConfig={profileConfig}
//       setProfileConfig={setProfileConfig}
//     />
//   );

//   const renderRegister = () => (
//     <LoginSignup 
//       page="register" 
//       ssoConfig={ssoConfig}
//       setSsoConfig={setSsoConfig}
//       profileConfig={profileConfig}
//       setProfileConfig={setProfileConfig}
//     />
//   );

//   const renderProfile = () => (
//     <LoginSignup 
//       page="profile" 
//       ssoConfig={ssoConfig}
//       setSsoConfig={setSsoConfig}
//       profileConfig={profileConfig}
//       setProfileConfig={setProfileConfig}
//     />
//   );

//   return (
//     <div className="app">
//       <BrowserRouter basename={window.BASE_PATH}>
//         <Switch>
//           <Route exact path="/" render={renderHome} />
//           <Route path="/loginnew" render={renderLogin} />
//           <Route path="/registernew" render={renderRegister} />
//           <Route path="/profilenew" render={renderProfile} />
//         </Switch>
//       </BrowserRouter>
//     </div>
//   );
// }
// export default App;


import React from 'react';
import LoginWidget from './components/LoginSign';
import './App.css';

window.BASE_PATH = process.env.PUBLIC_URL || '';
window.addEventListener("error", (event) => {
  const src = event.filename || "";
  if (
    event.message === "Script error." ||
    src.includes("accounts.google.com/gsi/client")
  ) {
    console.warn("Suppressed Google GSI script error:", event.message);
    event.preventDefault();
    return false; // stop browser from throwing red error
  }
});


function App() {
  
  
  return (
    <div className="app">
      <LoginWidget />
    </div>
  );
}

export default App;