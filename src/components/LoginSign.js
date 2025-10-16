
import React, { useState } from 'react';
import '../sso.css';

export default function LoginWidget() {
  const [isLoginPage, setIsLoginPage] = useState(false);
  const [isProfilePage, setIsProfilePage] = useState(false);
  const [isConfigPage, setIsConfigPage] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Config form state
  const [config, setConfig] = useState({
    channelName: 'toi',
    googleClientId: '103703403489-b4t4lt8mr05brqpcdrmsu0di54cmjv4f.apps.googleusercontent.com',
    ru: '',
    showSuccessScreen: false,
    GISPlusFedcmEnabled: true,
    signInCallback: ''
  });

  const loadScript = (src, callback) => {
    const script = document.createElement('script');
    script.crossOrigin = 'anonymous';
    script.type = 'text/javascript';
    script.src = src;
    script.defer = true;
    script.onload = callback;
    script.onerror = () => {
      setError(`Failed to load script: ${src}`);
      setIsLoading(false);
    };
    document.head.appendChild(script);
  };

  const waitForWidget = (name, callback) => {
    let attempts = 0;
    const maxAttempts = 50;

    const check = setInterval(() => {
      attempts++;
      if (window[name]) {
        clearInterval(check);
        callback();
      } else if (attempts >= maxAttempts) {
        clearInterval(check);
        setError(`${name} failed to load`);
        setIsLoading(false);
      }
    }, 100);
  };

  const initLogin = () => {
    if (!window.ssoWidget) {
      setError('Widget not available');
      setIsLoading(false);
      return;
    }

    const widgetConfig = {
      channelName: config.channelName,
      element: 'ssoLogin',
      resendOtpTimer: 30,
      ru: config.ru,
      channelLogo: '',
      showSuccessScreen: config.showSuccessScreen,
      nonSocialLogin: {
        loginVia: ['email', 'mobile'],
        loginWith: ['otp', 'Password']
      },
      socialLogin: [
        { type: 'Facebook', clientId: '898459706886386' },
        { type: 'Google', clientId: config.googleClientId }
      ],
      signupForm: {
        defaultFirstName: 'Guest',
        signUpFields: {
          Email: { placeholder: 'enter email', required: true },
          MobileNumber: { placeholder: 'enter mobile number', required: true },
          firstName: { placeholder: 'enter first name', required: true }
        },
        signupVia: ['Password'],
        MandatoryVerifyVia: ['email']
      },
      GISPlusFedcmEnabled: config.GISPlusFedcmEnabled,
      defaultSelected: true
    };

    // Only add signInCallback if user provided a value
    if (config.signInCallback.trim()) {
      widgetConfig.signInCallback = (res) => {
        alert(config.signInCallback);
        setError(null);
        setIsLoading(false);
      };
    }

    try {
      window.ssoWidget('init', widgetConfig);
      console.log('Login widget initialized');
      setIsLoading(false);
    } catch (err) {
      console.error('Error initializing login widget:', err);
      setError('Error initializing login widget');
      setIsLoading(false);
    }

    window.addEventListener('error', function (e) {
      if (e.message === 'Script error.' && !e.filename) {
        console.warn('Third-party script error suppressed:', e);
        e.preventDefault();
        return false;
      }
    });
  };

  const initProfile = () => {
    if (!window.ssoProfileWidget) {
      setError('Profile widget not available');
      setIsLoading(false);
      return;
    }

    const profileConfig = {
      channel: 'toi',
      staticUrl: 'https://jssocdnstg.indiatimes.com/crosswalk/217/widget',
      nonLoggedInRu: 'https://jssodev.indiatimes.com/sso/identity/login?channel=toi',
      CloseButtonRequired: true,
      shouldAutoOpenProfile: true,
      element: 'ssoprofileWidgetMain'
    };

    try {
      setTimeout(() => {
        window.ssoProfileWidget.init(profileConfig);
        console.log('Profile widget initialized');
      }, 1000);

      setTimeout(() => {
        if (window.ssoProfileWidget && window.ssoProfileWidget.open) {
          window.ssoProfileWidget.open();
          console.log('Profile widget opened');
        }
      }, 1200);

      setIsLoading(false);
    } catch (err) {
      console.error('Error initializing profile widget:', err);
      setError('Error initializing profile widget');
      setIsLoading(false);
    }
  };

  const handleLoginClick = () => {
    setIsLoading(true);
    setError(null);
    setIsLoginPage(true);

    setTimeout(() => {
      let loginElement = document.getElementById('ssoLogin');
      if (!loginElement) {
        loginElement = document.createElement('div');
        loginElement.id = 'ssoLogin';
        document.body.appendChild(loginElement);
      }

      loadScript('https://jssocdnstg.indiatimes.com/crosswalk_sdk/sdk/jsso_crosswalk_legacy_0.8.1.min.js', () => {
        loadScript('https://jssocdnstg.indiatimes.com/crosswalk/217/widget/index.main.umd.js', () => {
          waitForWidget('ssoWidget', initLogin);
        });
      });
    }, 200);
  };

  const handleProfileClick = () => {
    setIsLoading(true);
    setError(null);
    setIsProfilePage(true);

    setTimeout(() => {
      let profileElement = document.getElementById('ssoprofileWidgetMain');
      if (!profileElement) {
        profileElement = document.createElement('div');
        profileElement.id = 'ssoprofileWidgetMain';
        document.body.appendChild(profileElement);
      }

      loadScript('https://jssocdnstg.indiatimes.com/crosswalk_sdk/sdk/jsso_crosswalk_legacy_0.8.1.min.js', () => {
        loadScript('https://jssocdnstg.indiatimes.com/crosswalk/217/widget/index.main.umd.js', () => {
          waitForWidget('ssoProfileWidget', initProfile);
        });
      });
    }, 200);
  };

  const handleBack = () => {
    setIsLoginPage(false);
    setIsProfilePage(false);
    setIsConfigPage(false);
    setError(null);
    setIsLoading(false);
    const loginEl = document.getElementById('ssoLogin');
    const profileEl = document.getElementById('ssoprofileWidgetMain');
    if (loginEl) loginEl.innerHTML = '';
    if (profileEl) profileEl.innerHTML = '';
  };

  const handleConfigChange = (field, value) => {
    setConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleConfigSubmit = (e) => {
    e.preventDefault();
    setIsConfigPage(false);
  };

  // --- HOME PAGE ---
  if (!isLoginPage && !isProfilePage && !isConfigPage) {
    return (
      <div className="login-container">
        <div className="login-card">
          <div className="login-left">
            <h1 className="login-title">Welcome to SSO Demo</h1>
            <button
              onClick={() => setIsConfigPage(true)}
              className="login-button"
              style={{ backgroundColor: '#34A853', marginBottom: '10px' }}
            >
              Configure Settings
            </button>
            <button
              onClick={handleLoginClick}
              disabled={isLoading}
              className="login-button"
            >
              {isLoading ? 'Loading...' : 'Go to Login'}
            </button>
            <button
              onClick={handleProfileClick}
              disabled={isLoading}
              className="login-button"
              style={{ backgroundColor: '#EA4335', marginTop: '10px' }}
            >
              {isLoading ? 'Loading...' : 'Go to Profile'}
            </button>
            {error && <div className="login-error">{error}</div>}
          </div>
        </div>
      </div>
    );
  }

  // --- CONFIG PAGE ---
  if (isConfigPage) {
    return (
      <div className="login-container">
        <div className="login-card config-page">
          <div className="login-header">
            <button onClick={handleBack} className="back-button">
              ← Back to Home
            </button>
            <h1 className="login-title">Widget Configuration</h1>
          </div>
          <form onSubmit={handleConfigSubmit} className="config-form">
            <div className="form-group">
              <label htmlFor="channelName">Channel Name</label>
              <input
                type="text"
                id="channelName"
                value={config.channelName}
                onChange={(e) => handleConfigChange('channelName', e.target.value)}
                placeholder="Enter channel name"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="googleClientId">Google Client ID</label>
              <input
                type="text"
                id="googleClientId"
                value={config.googleClientId}
                onChange={(e) => handleConfigChange('googleClientId', e.target.value)}
                placeholder="Enter Google Client ID"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="ru">Redirect URL (ru)</label>
              <input
                type="text"
                id="ru"
                value={config.ru}
                onChange={(e) => handleConfigChange('ru', e.target.value)}
                placeholder="Enter redirect URL"
                
              />
            </div>

            <div className="form-group">
              <label htmlFor="showSuccessScreen">Show Success Screen</label>
              <select
                id="showSuccessScreen"
                value={config.showSuccessScreen}
                onChange={(e) => handleConfigChange('showSuccessScreen', e.target.value === 'true')}
              >
                <option value="false">False (Default)</option>
                <option value="true">True</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="GISPlusFedcmEnabled">GIS Plus Fedcm Enabled</label>
              <select
                id="GISPlusFedcmEnabled"
                value={config.GISPlusFedcmEnabled}
                onChange={(e) => handleConfigChange('GISPlusFedcmEnabled', e.target.value === 'true')}
              >
                <option value="true">True (Default)</option>
                <option value="false">False</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="signInCallback">Sign In Callback Message (Optional)</label>
              <input
                type="text"
                id="signInCallback"
                value={config.signInCallback}
                onChange={(e) => handleConfigChange('signInCallback', e.target.value)}
                placeholder="Leave empty to disable callback"
              />
              <small>If provided, this message will be shown on successful login</small>
            </div>

            <button type="submit" className="login-button" style={{ width: '100%', marginTop: '20px' }}>
              Save Configuration
            </button>
          </form>
        </div>
      </div>
    );
  }

  // --- LOGIN PAGE ---
  if (isLoginPage) {
    return (
      <div className="login-container">
        <div className="login-card login-page">
          <div className="login-header">
            <button onClick={handleBack} className="back-button">
              ← Back to Home
            </button>
            <h1 className="login-title">SSO Login</h1>
          </div>
          <div id="ssoLogin" className="widget-container-full"></div>
          {error && <div className="login-error">{error}</div>}
        </div>
      </div>
    );
  }

  // --- PROFILE PAGE ---
  if (isProfilePage) {
    return (
      <div className="login-container">
        <div className="login-card login-page">
          <div className="login-header">
            <button onClick={handleBack} className="back-button">
              ← Back to Home
            </button>
            <h1 className="login-title">SSO Profile</h1>
          </div>
          <div id="ssoprofileWidgetMain" className="widget-container-full"></div>
          {error && <div className="login-error">{error}</div>}
        </div>
      </div>
    );
  }
}