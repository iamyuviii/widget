"use strict";
/*! JSSO Crosswalk v0.8.1 | Gopal | (c) Times Internet Ltd
added logintype in  socialLogin, created from 0.8.1 version */
class JssoCrosswalk {
    constructor(channel, platform,showFedCmIframe, ssoBaseUrl, socialappBaseUrl,ssofpslogincheckVal) {
        this.channel = channel;
        this.platform = platform;
        window.showSsoFedCmIframe = window.showSsoFedCmIframe || showFedCmIframe;
        if (ssoBaseUrl && this.isValidDomain(ssoBaseUrl))
            this.ssoBaseUrl = ssoBaseUrl + "/sso/crossapp/identity/web/";
        else
            this.ssoBaseUrl =
                "https://jssostg.indiatimes.com/sso/crossapp/identity/web/";

        if (socialappBaseUrl && this.isValidDomain(socialappBaseUrl)) {
            this.socialappBaseUrl = socialappBaseUrl + "/socialsite/crossapp/web/";
        } else
            this.socialappBaseUrl =
                "https://testsocialappsintegrator.indiatimes.com/socialsite/crossapp/web/";

        this.sdkVersion = "0.8.1";
        this.csrfToken = this.getCookie("csrfToken");

        this.ssec = this.getCookie("jsso_crosswalk_ssec_" + this.channel);
        this.tksec = this.getCookie("jsso_crosswalk_tksec_" + this.channel);
        this.csut = this.getCookie("csut");
        this.gdpr = this.getCookie("gdpr");
        this.userDetails = this.getSessionStorage("jsso_crosswalk_user_details");
        this.profileDetails = this.getSessionStorage(
            "jsso_crosswalk_profile_details"
        );
        this.captchaToken = this.getCookie("captchaToken");

        this.UNAUTHORIZED_ACCESS_RESPONSE = {
            code: 404,
            message: "UNAUTHORIZED_ACCESS",
            status: "FAILURE",
            data: null,
        };
        this.CONNECTION_ERROR_RESPONSE = {
            code: 503,
            message: "CONNECTION_ERROR",
            status: "FAILURE",
            data: null,
        };
        this.CONNECTION_TIMEOUT_RESPONSE = {
            code: 504,
            message: "CONNECTION_TIMEOUT",
            status: "FAILURE",
            data: null,
        };
        this.APP_CONNECTION_TIMEOUT_RESPONSE = {
            code: 505,
            message: "TRUECALLER_LOGIN_FAILURE",
            status: "FAILURE",
            data: null,
        };
        this.INVALID_MOBILE = {
            code: 402,
            message: "INVALID_MOBILE",
            status: "FAILURE",
            data: null,
        };
        this.INVALID_EMAIL = {
            code: 403,
            message: "INVALID_EMAIL",
            status: "FAILURE",
            data: null,
        };
        this.INVALID_REQUEST = {
            code: 413,
            message: "INVALID_REQUEST",
            status: "FAILURE",
            data: null,
        };
        this.INVALID_PASSWORD = {
            code: 417,
            message: "INVALID_PASSWORD",
            status: "FAILURE",
            data: null,
        };
        this.INVALID_DOMAIN = {
            code: 418,
            message: "INVALID_DOMAIN",
            status: "FAILURE",
            data: null,
        };

        this.waitForloginWithTicket = false;
        if (ssofpslogincheckVal!=null && ssofpslogincheckVal) {
            window.ssofpslogincheck = true;

        }else{
            window.ssofpslogincheck = false;
        }
        const urlParams = new URLSearchParams(window.location.search);
        const ticketId = urlParams.get("ticketId");

        var channelCookies = this.getChannelCookies();
        if (ticketId) {
            this.getV1ValidLoggedInUser(ticketId, false);
        } else {
            if (channelCookies.login != "" && channelCookies.daily == "") {
                this.getValidLoggedInUser();
            }
        }

        var myurl = window.location.href;
        var self = this;

        if (getParameterByName("code", myurl)) {
            var state = getParameterByName("state", myurl).split(",");

            if (state[0] == "SSOTLOGINGOOGLEPLUS") {
                this.googleplusLogin(
                    getParameterByName("code", myurl),
                    state[1],
                    function (response) {
                        if (response.code == 200) {
                            self.SocialloginSucces(response)
                        }
                    }
                );
            }
            if (state[0] == "SSOTLOGINAPPLE") {
                this.appleLogin(
                    getParameterByName("code", myurl),
                    function (response) {
                        if (response.code == 200) {
                            self.SocialloginSucces(response)
                        }
                    }
                );
            }
            if (state[0] == "SSOTLOGINFACEBOOK") {
                this.facebookLogin(
                    getParameterByName("code", myurl),
                    state[1],
                    function (response) {
                        if (
                            response.code == 200 ||
                            (response.code == 4413 && response.stateid)
                        ) {
                            self.SocialloginSucces(response)
                        }
                    }
                );
            }
            if (state[0] == "SSOTLOGINMICROSOFT") {
                this.microsoftLogin(
                    getParameterByName("code", myurl),
                    state[1],
                    function (response) {

                        if (
                            response.code == 200 ||
                            (response.code == 4413 && response.stateid)
                        ) {
                            self.SocialloginSucces(response)
                        }
                    }
                );
            }
            if (getParameterByName("state", myurl)[0] == "SSOTLOGINLINKEDIN") {
                this.linkedinLogin(
                    getParameterByName("code", myurl),
                    window.location.href.split("?")[0],
                    function (response) {
                        if (response.code == 200) {
                            self.SocialloginSucces(response)
                        }
                    }
                );
            }

            //truecallerVerifyV1(requestId, callback);

        }
    }
    SocialloginSucces(response){
        this.fedcmInIfram(response);
        if(typeof BroadcastChannel != 'undefined'){
        const ssobroadCast = new BroadcastChannel(this.channel);
        ssobroadCast.postMessage({
            sender: "applelogin",
            message: response
            });
        }
        else if(window.opener){
            window.opener.postMessage(
            {
                sender: "applelogin",
                message: response
            },
            "*"
        );
        }else if (window.parent && window.parent.JssoLoginCompleteCallback) {
            window.parent.JssoLoginCompleteCallback(response);
        }
        window.close();
    }
    fedcmInIfram(response){
            if(window.showSsoFedCmIframe){
                var url =  this.ssoBaseUrl.split("/sso")[0] + '/sso/identity/login/setLoginStatus';
                if(response){
                this.getValidLoggedInUser(function(res){
                        url = url +"?ticketId="+res.data.encTicket+'&openforfedcm='+true;

                        var newWinFedcm = window.open(
                                    url,
                                    "ssoLoginWindownew",
                                    "menubar=no,locationbar=n0,toolbar=no,status=no,menubar=no,scrollbars=no,resizable=no,left=10000,top=10000,width=10,height=10,visible=none"
                                    );
                })
                }
                else{
                    var newWinFedcm = window.open(
                        url,
                        "ssoLoginWindownew",
                        "menubar=no,locationbar=n0,toolbar=no,status=no,menubar=no,scrollbars=no,resizable=no,left=10000,top=10000,width=10,height=10,visible=none"
                        );
                    setTimeout(function(){
                        newWinFedcm.close()
                    },0)

                    //document.body.appendChild(fedIframe);
                }
            }

    }
    asyncJssoCall(api, data, callback) {
        this.asyncCall(this.ssoBaseUrl + api, data, callback, api);
    }

    asyncJssoCallWithHeaders(api, data, headers, callback) {
        this.asyncCallWithHeaders(this.ssoBaseUrl + api, data, headers, callback);
    }

    asyncSocialappCall(api, data, callback) {
        this.asyncCall(this.socialappBaseUrl + api, data, callback, api);
    }

    asyncCall(apiUrl, data, callback, method) {
        var x = new XMLHttpRequest();
        x.open("POST", apiUrl);
        x.timeout = 30000;
        x.withCredentials = true;
        x.setRequestHeader("content-type", "application/json");
        x.setRequestHeader("channel", this.channel);
        x.setRequestHeader("platform", this.platform);
        x.setRequestHeader("sdkVersion", this.sdkVersion);
        x.setRequestHeader("IsJssoCrosswalk", "true");
        x.setRequestHeader("csrfToken", this.getCookie("csrfToken") || this.csrfToken);
        x.setRequestHeader("captchaToken", this.getCookie("captchaToken") || this.captchaToken);
        x.setRequestHeader(
            "ssec",this.getCookie("jsso_crosswalk_ssec_" + this.channel)

        );
        x.setRequestHeader(
            "tksec",this.getCookie("jsso_crosswalk_tksec_" + this.channel)

        );
        x.setRequestHeader("csut", this.getCookie("csut"));
        x.setRequestHeader("gdpr", this.getCookie("gdpr"));
        x.responseType = "json";

        x.onload = function () {
            var response = x.response;

            if (typeof response == "string") {
                response = JSON.parse(response);
            }

            if (!response || !response.code) {
                this.deleteChannelCookies();
                if (callback) callback(this.UNAUTHORIZED_ACCESS_RESPONSE);
                return;
            }

            if (response.code == 404) {
                this.deleteChannelCookies();
                if (callback) callback(response);
                return;
            }




            if (x.getResponseHeader("ssec")) this.ssec = x.getResponseHeader("ssec");
            if (x.getResponseHeader("tksec"))
                this.tksec = x.getResponseHeader("tksec");
            if (x.getResponseHeader("csut")) this.csut = x.getResponseHeader("csut");
            if (x.getResponseHeader("gdpr")) this.gdpr = x.getResponseHeader("gdpr");
            if (x.getResponseHeader("csrfToken")){
                this.csrfToken = x.getResponseHeader("csrfToken");
                this.createCookie("csrfToken", x.getResponseHeader("csrfToken"), 30 * 24 * 60 * 60 * 1000);
            }

            try {
                const captchaHeader = x.getResponseHeader("captchaToken");
                if (captchaHeader && captchaHeader !== "null" && captchaHeader !== "undefined") {
                    this.captchaToken = captchaHeader;
                    this.createCookie("captchaToken", captchaHeader, 30 * 24 * 60 * 60 * 1000);
                }
            } catch (e) {
                console.log("Cannot access captchaToken header:", e);
            }



            if (method === "getUserDetails") {
                this.userDetails = JSON.stringify(response);
                if (this.userDetails) {
                    this.setSessionStorage(
                        "jsso_crosswalk_user_details",
                        this.userDetails,
                        15
                    );
                }
            } else if (method === "getUserProfile") {
                this.profileDetails = JSON.stringify(response);
                if (this.profileDetails) {
                    this.setSessionStorage(
                        "jsso_crosswalk_profile_details",
                        this.profileDetails,
                        15
                    );
                }
            }

            if (callback) return callback(response);
        }.bind(this);

        x.onerror = function () {
            if (callback) return callback(this.CONNECTION_ERROR_RESPONSE);
        }.bind(this);

        x.ontimeout = function () {
            if (callback) return callback(this.CONNECTION_TIMEOUT_RESPONSE);
        }.bind(this);

        x.send(JSON.stringify(data));
    }

    asyncCallWithHeaders(apiUrl, data, headers, callback) {
        var x = new XMLHttpRequest();
        x.open("POST", apiUrl);
        x.timeout = 30000;

        x.withCredentials = true;
        x.setRequestHeader("content-type", "application/json");
        x.setRequestHeader("channel", this.channel);
        x.setRequestHeader("platform", this.platform);
        x.setRequestHeader("sdkVersion", this.sdkVersion);
        x.setRequestHeader("IsJssoCrosswalk", "true");
        x.setRequestHeader("csrfToken", this.getCookie("csrfToken") || this.csrfToken);
        x.setRequestHeader("captchaToken", this.getCookie("captchaToken") || this.captchaToken);
        x.setRequestHeader("csut", this.getCookie("csut"));
        x.setRequestHeader("gdpr", this.getCookie("this.gdpr"));
        x.responseType = "json";

        if (headers) {
            for (var key in headers) {
                x.setRequestHeader(key, headers[key]);
            }
        }else{
            x.setRequestHeader(
                "ssec",
                this.getCookie("jsso_crosswalk_ssec_" + this.channel)
            );
            x.setRequestHeader(
                "tksec",
                this.getCookie("jsso_crosswalk_tksec_" + this.channel)
            );
        }

        x.onload = function () {
            var response = x.response;
            if (typeof response == "string") {
                response = JSON.parse(response);
            }

            if (!response || !response.code) {
                this.deleteChannelCookies();
                if (callback) callback(this.UNAUTHORIZED_ACCESS_RESPONSE);
                return;
            }

            if (response.code == 404) {
                this.deleteChannelCookies();
                if (callback) callback(response);
                return;
            }

            if (x.getResponseHeader("csrfToken")){
                this.csrfToken = x.getResponseHeader("csrfToken");
                this.createCookie("csrfToken", x.getResponseHeader("csrfToken"), 30 * 24 * 60 * 60 * 1000);

            }

            try {
                const captchaHeader = x.getResponseHeader("captchaToken");
                if (captchaHeader && captchaHeader !== "null" && captchaHeader !== "undefined") {
                    this.captchaToken = captchaHeader;
                    this.createCookie("captchaToken", captchaHeader, 30 * 24 * 60 * 60 * 1000);
                }
            } catch (e) {
                console.log("Cannot access captchaToken header:", e);
            }


            if (x.getResponseHeader("ssec")) this.ssec = x.getResponseHeader("ssec");

            if (x.getResponseHeader("tksec"))
                this.tksec = x.getResponseHeader("tksec");

            if (x.getResponseHeader("csut")) this.csut = x.getResponseHeader("csut");

            if (x.getResponseHeader("gdpr")) this.gdpr = x.getResponseHeader("gdpr");

            if (callback) return callback(response);
        }.bind(this);

        x.onerror = function () {
            if (callback) return callback(this.CONNECTION_ERROR_RESPONSE);
        }.bind(this);

        x.ontimeout = function () {
            if (callback) return callback(this.CONNECTION_TIMEOUT_RESPONSE);
        }.bind(this);

        x.send(JSON.stringify(data));
    }

    fedcmLogin(callback) {
        if (this.getCookie("jsso_crosswalk_tksec_" + this.channel) == "") {
            if ("IdentityCredential" in window) {
                let randomNumber = Math.random().toString().substring(7);
                navigator.credentials
                    .get({
                        identity: {
                            providers: [
                                {
                                    configURL: this.ssoBaseUrl.split("/sso")[0] + "/fedcm.json",
                                    clientId: "TIMES",
                                    nonce: randomNumber,
                                },
                            ],
                        },
                    })
                    .then((response) => {
                        const tokenVal1 = response.token;
                        if (tokenVal1 != null) {
                            this.getV1ValidLoggedInUser(tokenVal1,false,callback);
                        }
                    })
                    .catch((e) => {
                        console.log(e);
                    });
            }
        }
    }
    FPSLOGIN(callback,stopCallback){
        var _this = this;
        var fpsrequestDomain =  this.ssoBaseUrl.split("/sso")[0] + '/';
        try {
            if(navigator && navigator.permissions && navigator.permissions.query){
                navigator.permissions.query({name: 'top-level-storage-access', requestedOrigin: fpsrequestDomain}).then(res => {
                    if (res.state === 'granted') {
                    if ('requestStorageAccessFor' in document) {
                        document.requestStorageAccessFor(fpsrequestDomain).then(
                        res => {
                                if(stopCallback){
                                    _this.getValidLoggedInUser();
                                }else{
                                    _this.getValidLoggedInUser(callback);
                                }

                        },
                        err => {
                            _this.fedcmLogin();
                            console.log('Storage-access permission granted, immediately request storage access.');
                        }
                        );
                    }
                    } else if (res.state === 'prompt') {
                        var fpsclickcheck = true;
                        window.onclick = function name(params) {
                            if ('requestStorageAccessFor' in document && fpsclickcheck) {
                                fpsclickcheck = false;
                                document.requestStorageAccessFor(fpsrequestDomain).then(
                                res => {
                                    if(stopCallback){
                                        _this.getValidLoggedInUser();
                                    }else{
                                        _this.getValidLoggedInUser(callback);
                                    }
                                },
                                err => {
                                    _this.fedcmLogin(callback);
                                    console.log('Storage-access permission granted, immediately request storage access.');
                                }
                                );
                            }
                        }
                    }
            });
        }
    } catch (e) {
    }
    }
    getValidLoggedInUser(callback,stopCallback) {
        if(this.waitForloginWithTicket){

            var interval=setInterval(()=>
                {
                if(!this.waitForloginWithTicket){
                    clearInterval(interval);
                this.getValidLoggedInUser(callback);
            }
            },50)
        }else{
            this.asyncJssoCall(
                "loggedInUser",
                {},
                function (response) {
                    if (response.code == 200) {
                        try{
                            if(typeof navigator != 'undefined' ){
                                navigator.login.setStatus("logged-in");
                            }
                        }catch(e){}
                        this.createChannelCookies();
                    } else {
                        if(window.ssofpslogincheck){
                            window.ssofpslogincheck = false;
                            this.FPSLOGIN(callback,stopCallback)
                        }
                    }

                    if (callback) return callback(response);
                }.bind(this)
            );
        }

    }

    getV1ValidLoggedInUser(ticketId, reload = true, callback) {
        this.waitForloginWithTicket = true;
        this.asyncJssoCallWithHeaders(
            "v1LoggedInUser",
            {},
            {
                ticketId: ticketId,
            },
            function (response) {
                this.waitForloginWithTicket = false;
                if (response.code == 200) {
                    try{
                            if(typeof navigator != 'undefined' ){
                                navigator.login.setStatus("logged-in");
                            }
                        }catch(e){}
                    this.createChannelCookies();
                    if(getParameterByName('openforfedcm')){
                        window.close()
                    }
                    if (reload) {
                        location.reload();
                    }
                }

                if (callback) return callback(response);
            }.bind(this)
        );
    }

    getValidAppLoggedInUser(ssoid, ssec, ticketId, tksec, callback) {
        this.asyncJssoCallWithHeaders(
            "appLoggedInUser",
            {},
            {
                ssoid: ssoid,
                ssec: ssec,
                ticketId: ticketId,
                tksec: tksec,
            },
            function (response) {
                if (response.code == 200) {
                    this.createChannelCookies();
                }
                if (callback) return callback(response);
            }.bind(this)
        );
    }

    checkUserExists(identifier,  callback, userRecaptchaResponseToken, v3captchasecret) {
        this.asyncJssoCall(
            "checkUserExists",
            {
                identifier: identifier,
                userRecaptchaResponseToken: userRecaptchaResponseToken,
                v3captchasecret:v3captchasecret
        },
            callback
        );
    }

    registerUser(
        firstName,
        lastName,
        gender,
        dob,
        email,
        mobile,
        password,
        isSendOffer,
        termsAccepted,
        shareDataAllowed,
        timespointsPolicy,
        userRecaptchaResponseToken,
        v3captchasecret,
        callback,
        city,
        state,
        country,
    ) {
        if (!email && !mobile) return callback(this.INVALID_REQUEST);
        if (email && !this.isValidEmail(email)) return callback(this.INVALID_EMAIL);
        if (mobile && !this.isValidMobile(mobile))
            return callback(this.INVALID_MOBILE);
        if (!this.isValidPassword(password)) return callback(this.INVALID_PASSWORD);

        if (userRecaptchaResponseToken) {
            this.asyncJssoCall(
                "registerUser",
                {
                    firstName: firstName,
                    lastName: lastName,
                    gender: gender,
                    dob: dob,
                    email: email,
                    mobile: mobile,
                    password: password,
                    isSendOffer: isSendOffer,
                    termsAccepted: termsAccepted,
                    shareDataAllowed: shareDataAllowed,
                    timespointsPolicy: timespointsPolicy,
                    userRecaptchaResponseToken: userRecaptchaResponseToken,
                    v3captchasecret:v3captchasecret,
                    city:city,
                    state:state,
                    country:country,
                },
                function (response) {
                    if (response.code == 200) {
                        this.createChannelCookies();
                    }
                    if (callback) return callback(response);
                }.bind(this)
            );
        } else {
            this.asyncJssoCall(
                "registerUser",
                {
                    firstName: firstName,
                    lastName: lastName,
                    gender: gender,
                    dob: dob,
                    email: email,
                    mobile: mobile,
                    password: password,
                    isSendOffer: isSendOffer,
                    termsAccepted: termsAccepted,
                    shareDataAllowed: shareDataAllowed,
                    timespointsPolicy: timespointsPolicy,
                    city:city,
                    state:state,
                    country:country,
                },
                callback
            );
        }
    }

    registerUserRecaptcha(
        firstName,
        lastName,
        gender,
        dob,
        email,
        mobile,
        password,
        isSendOffer,
        recaptcha,
        termsAccepted,
        shareDataAllowed,
        timespointsPolicy,
        v3captchasecret,
        callback,
        city,
        state,
        country,
    ) {
        if (!email && !mobile) return callback(this.INVALID_REQUEST);
        if (email && !this.isValidEmail(email)) return callback(this.INVALID_EMAIL);
        if (mobile && !this.isValidMobile(mobile))
            return callback(this.INVALID_MOBILE);
        if (!this.isValidPassword(password)) return callback(this.INVALID_PASSWORD);
        this.asyncJssoCall(
            "registerUserRecaptcha",
            {
                firstName: firstName,
                lastName: lastName,
                gender: gender,
                dob: dob,
                email: email,
                mobile: mobile,
                password: password,
                isSendOffer: isSendOffer,
                recaptcha: recaptcha,
                termsAccepted: termsAccepted,
                shareDataAllowed: shareDataAllowed,
                timespointsPolicy: timespointsPolicy,
                v3captchasecret:v3captchasecret,
                city:city,
                state:state,
                country:country,
            },
            function (response) {
                if (response.code == 200) {
                    this.createChannelCookies();
                }
                if (callback) return callback(response);
            }.bind(this)
        );
    }

    resendMobileSignUpOtp(mobile, ssoid, callback, userRecaptchaResponseToken, v3captchasecret) {
        if (!this.isValidMobile(mobile)) return callback(this.INVALID_MOBILE);

        if (userRecaptchaResponseToken) {
            this.asyncJssoCall(
                "resendSignUpOtp",
                {
                    mobile: mobile,
                    ssoid: ssoid,
                    userRecaptchaResponseToken: userRecaptchaResponseToken,
                    v3captchasecret:v3captchasecret
                },
                callback
            );
        } else {
            this.asyncJssoCall(
                "resendSignUpOtp",
                {
                    mobile: mobile,
                    ssoid: ssoid,
                },
                callback
            );
        }
    }

    resendEmailSignUpOtp(email, ssoid, callback, userRecaptchaResponseToken, v3captchasecret) {
        if (!this.isValidEmail(email)) return callback(this.INVALID_EMAIL);

        if (userRecaptchaResponseToken) {
            this.asyncJssoCall(
                "resendSignUpOtp",
                {
                    email: email,
                    ssoid: ssoid,
                    userRecaptchaResponseToken: userRecaptchaResponseToken,
                    v3captchasecret:v3captchasecret,
                },
                function (response) {
                    if (response.code == 200) {
                        this.createChannelCookies();
                    }
                    if (callback) return callback(response);
                }.bind(this)
            );
        } else {
            this.asyncJssoCall(
                "resendSignUpOtp",
                {
                    email: email,
                    ssoid: ssoid,
                },
                callback
            );
        }
    }

    verifyMobileSignUp(mobile, ssoid, otp, callback) {
        if (!this.isValidMobile(mobile)) return callback(this.INVALID_MOBILE);
        this.asyncJssoCall(
            "verifySignUpOTP",
            {
                mobile: mobile,
                ssoid: ssoid,
                otp: otp,
            },
            function (response) {
                if (response.code == 200) {
                    this.createChannelCookies();
                    this.fedcmInIfram(response);

                }

                if (callback) return callback(response);
            }.bind(this)
        );
    }

    verifyEmailSignUp(email, ssoid, otp, callback) {
        if (!this.isValidEmail(email)) return callback(this.INVALID_EMAIL);
        this.asyncJssoCall(
            "verifySignUpOTP",
            {
                email: email,
                ssoid: ssoid,
                otp: otp,
            },
            function (response) {
                if (response.code == 200) {
                    this.createChannelCookies();
                    this.fedcmInIfram(response);

                }

                if (callback) return callback(response);
            }.bind(this)
        );
    }

    verifyMobileLogin(mobile, password, callback) {
        if (!this.isValidMobile(mobile)) return callback(this.INVALID_MOBILE);
        this.asyncJssoCall(
            "verifyLoginOtpPassword",
            {
                mobile: mobile,
                password: password,
            },
            function (response) {
                if (response.code == 200) {
                    this.createChannelCookies();
                    this.fedcmInIfram(response);

                }

                if (callback) return callback(response);
            }.bind(this)
        );
    }

    verifyEmailLogin(email, password, callback) {
        if (!this.isValidEmail(email)) return callback(this.INVALID_EMAIL);
        this.asyncJssoCall(
            "verifyLoginOtpPassword",
            {
                email: email,
                password: password,
            },
            function (response) {
                if (response.code == 200) {
                    this.createChannelCookies();
                    this.fedcmInIfram(response);
                }

                if (callback) return callback(response);
            }.bind(this)
        );
    }
    v1VerifyMobileLogin(mobile, password, callback) {
        if (!this.isValidMobile(mobile)) return callback(this.INVALID_MOBILE);
        this.asyncJssoCall(
            "v1VerifyLoginOtp",
            {
                mobile: mobile,
                password: password,
            },
            function (response) {
                if (response.code == 200) {
                    this.createChannelCookies();
                    this.fedcmInIfram(response);
                }

                if (callback) return callback(response);
            }.bind(this)
        );
    }

    v1VerifyEmailLogin(email, password, callback) {
        if (!this.isValidEmail(email)) return callback(this.INVALID_EMAIL);
        this.asyncJssoCall(
            "v1VerifyLoginOtp",
            {
                email: email,
                password: password,
            },
            function (response) {
                if (response.code == 200) {
                    this.createChannelCookies();
                    this.fedcmInIfram(response);

                }

                if (callback) return callback(response);
            }.bind(this)
        );
    }
    verifyMobileLoginForOptIn(mobile, password, callback) {
        if (!this.isValidMobile(mobile)) return callback(this.INVALID_MOBILE);
        this.asyncJssoCall(
            "verifyLoginOtpPassword",
            {
                mobile: mobile,
                password: password,
                optInRequest: true,
            },
            function (response) {
                if (response.code == 200) {
                    this.createChannelCookies();
                    this.fedcmInIfram(response);

                }

                if (callback) return callback(response);
            }.bind(this)
        );
    }

    verifyEmailLoginForOptIn(email, password, callback) {
        if (!this.isValidEmail(email)) return callback(this.INVALID_EMAIL);
        this.asyncJssoCall(
            "verifyLoginOtpPassword",
            {
                email: email,
                password: password,
                optInRequest: true,
            },
            function (response) {
                if (response.code == 200) {
                    this.createChannelCookies();
                    this.fedcmInIfram(response);

                }

                if (callback) return callback(response);
            }.bind(this)
        );
    }
    optIn(callback) {
        this.asyncJssoCall(
            "optIn",
            {},
            function (response) {
                if (callback) return callback(response);
            }.bind(this)
        );
    }

    facebookLogin(code, facebookRedirectUri, callback) {
        this.asyncSocialappCall(
            "facebookLogin",
            {
                code: code,
                facebookRedirectUri: facebookRedirectUri,
            },
            function (response) {
                if (response.code == 200) {
                    this.createChannelCookies();
                }

                if (callback) return callback(response);
            }.bind(this)
        );
    }

    appleLogin(code, callback) {
        this.asyncSocialappCall(
            "appleLogin",
            {
                code: code,
            },
            function (response) {
                if (response.code == 200) {
                    this.createChannelCookies();
                }

                if (callback) return callback(response);
            }.bind(this)
        );
    }


    GoogleOAuthLogin(clientId, accessToken, ru, callback) {
        this.asyncJssoCall(
            "v1/GISverify",
            {
                clientId: clientId,
                accessToken: accessToken,
                ru: ru,
            },
            function (response) {
                if (response.code == 200) {
                    this.createChannelCookies();
                    this.fedcmInIfram(response);
                }

                if (callback) return callback(response);
            }.bind(this)
        );
    }

  
    
    googleplusLogin(code, googleplusRedirectUri, callback) {
        this.asyncSocialappCall(
            "googleplusLogin",
            {
                code: code,
                googleplusRedirectUri: googleplusRedirectUri,
            },
            function (response) {
                if (response.code == 200) {
                    this.createChannelCookies();
                    this.fedcmInIfram(response);

                }

                if (callback) return callback(response);
            }.bind(this)
        );
    }

    linkedinLogin(code, linkedinRedirectUri, callback) {
        this.asyncSocialappCall(
            "linkedinLogin",
            {
                code: code,
                linkedinRedirectUri: linkedinRedirectUri,
            },
            function (response) {
                if (response.code == 200) {
                    this.createChannelCookies();
                    this.fedcmInIfram(response);

                }

                if (callback) return callback(response);
            }.bind(this)
        );
    }
    microsoftLogin(code, microsoftRedirectUri, callback) {
        this.asyncSocialappCall(
            "microsoftLogin",
            {
                code: code,
                microsoftRedirectUri: microsoftRedirectUri,
            },
            function (response) {
                if (response.code == 200) {
                    this.createChannelCookies();
                    this.fedcmInIfram(response);

                }

                if (callback) return callback(response);
            }.bind(this)
        );
    }
    getUserProfile(callback, forceUpdate = false) {
        if (this.profileDetails && !forceUpdate) {
            if (callback) return callback(JSON.parse(this.profileDetails));
        } else {
            this.asyncJssoCall("getUserProfile", {}, callback);
        }
    }
    getUserDetails(callback, forceUpdate = false) {
        if (this.userDetails && !forceUpdate) {
            if (callback) return callback(JSON.parse(this.userDetails));
        } else {
            this.asyncJssoCall("getUserDetails", {}, callback);
        }
    }

    sendUpdateOtp(callback, userRecaptchaResponseToken, v3captchasecret) {
        if (userRecaptchaResponseToken) {
            this.asyncJssoCall(
                "sendUpdateOtp",
                {
                    v3captchasecret:v3captchasecret
                },
                function (response) {
                    if (response.code == 200) {
                        this.createChannelCookies();
                    }
                    if (callback) return callback(response);
                }.bind(this)
            );
        } else {
            this.asyncJssoCall("sendUpdateOtp", {}, callback);
        }
    }

    getMobileLoginOtp(mobile, callback, userRecaptchaResponseToken, v3captchasecret) {
        if (!this.isValidMobile(mobile)) return callback(this.INVALID_MOBILE);

        if (userRecaptchaResponseToken != undefined) {
            this.asyncJssoCall(
                "getLoginOtp",
                {
                    mobile: mobile,
                    userRecaptchaResponseToken: userRecaptchaResponseToken,
                    v3captchasecret:v3captchasecret
                },
                callback
            );
        } else {
            this.asyncJssoCall(
                "getLoginOtp",
                {
                    mobile: mobile,
                },
                function (response) {
                    if (response.code == 200) {
                        this.createChannelCookies();
                    }
                    if (callback) return callback(response);
                }.bind(this)
            );
        }
    }
    getMobileLoginOtpForOptIn(mobile, callback, userRecaptchaResponseToken, v3captchasecret) {
        if (!this.isValidMobile(mobile)) return callback(this.INVALID_MOBILE);

        if (userRecaptchaResponseToken != undefined) {
            this.asyncJssoCall(
                "getLoginOtp",
                {
                    mobile: mobile,
                    optInRequest: true,
                    userRecaptchaResponseToken: userRecaptchaResponseToken,
                    v3captchasecret:v3captchasecret,
                },
                callback
            );
        } else {
            this.asyncJssoCall(
                "getLoginOtp",
                {
                    mobile: mobile,
                },
                function (response) {
                    if (response.code == 200) {
                        this.createChannelCookies();
                    }
                    if (callback) return callback(response);
                }.bind(this)
            );
        }
    }

    getEmailLoginOtp(email, callback, userRecaptchaResponseToken, v3captchasecret) {
        if (!this.isValidEmail(email)) return callback(this.INVALID_EMAIL);

        if (userRecaptchaResponseToken != undefined) {
            this.asyncJssoCall(
                "getLoginOtp",
                {
                    email: email,
                    userRecaptchaResponseToken: userRecaptchaResponseToken,
                    v3captchasecret:v3captchasecret
                },
                callback
            );
        } else {
            this.asyncJssoCall(
                "getLoginOtp",
                {
                    email: email,
                },
                callback
            );
        }
    }
    getEmailLoginOtpForOptIn(email, callback, userRecaptchaResponseToken, v3captchasecret) {
        if (!this.isValidEmail(email)) return callback(this.INVALID_EMAIL);

        if (userRecaptchaResponseToken != undefined) {
            this.asyncJssoCall(
                "getLoginOtp",
                {
                    email: email,
                    optInRequest: true,
                    userRecaptchaResponseToken: userRecaptchaResponseToken,
                    v3captchasecret:v3captchasecret
                },
                callback
            );
        } else {
            this.asyncJssoCall(
                "getLoginOtp",
                {
                    email: email,
                },
                callback
            );
        }
    }
    updateUserProfile(
        firstName,
        lastName,
        gender,
        dob,
        city,
        state,
        country,
        termsAccepted,
        shareDataAllowed,
        callback
    ) {
        this.asyncJssoCall(
            "updateUserProfile",
            {
                firstName: firstName,
                lastName: lastName,
                gender: gender,
                dob: dob,
                city: city,
                state: state,
                country: country,
                termsAccepted: termsAccepted,
                shareDataAllowed: shareDataAllowed,
            },
            function (response) {
                if (response.code == 200) {
                    this.createChannelCookies();
                }
                if (callback) return callback(response);
            }.bind(this)
        );
    }

    getMobileForgotPasswordOtp(mobile, callback, userRecaptchaResponseToken, v3captchasecret) {
        if (!this.isValidMobile(mobile)) return callback(this.INVALID_MOBILE);

        if (userRecaptchaResponseToken) {
            this.asyncJssoCall(
                "getForgotPasswordOtp",
                {
                    mobile: mobile,
                    userRecaptchaResponseToken: userRecaptchaResponseToken,
                    v3captchasecret:v3captchasecret,
                },
                callback
            );
        } else {
            this.asyncJssoCall(
                "getForgotPasswordOtp",
                {
                    mobile: mobile,
                },
                function (response) {
                    if (response.code == 200) {
                        this.createChannelCookies();
                    }
                    if (callback) return callback(response);
                }.bind(this)
            );
        }
    }

    getEmailForgotPasswordOtp(email, callback, userRecaptchaResponseToken, v3captchasecret) {
        if (!this.isValidEmail(email)) return callback(this.INVALID_EMAIL);

        if (userRecaptchaResponseToken) {
            this.asyncJssoCall(
                "getForgotPasswordOtp",
                {
                    email: email,
                    userRecaptchaResponseToken: userRecaptchaResponseToken,
                    v3captchasecret:v3captchasecret,
                },
                callback
            );
        } else {
            this.asyncJssoCall(
                "getForgotPasswordOtp",
                {
                    email: email,
                },
                callback
            );
        }
    }

    verifyMobileForgotPassword(mobile, otp, password, confirmPassword, callback) {
        if (!this.isValidMobile(mobile)) return callback(this.INVALID_MOBILE);
        if (!this.isValidPassword(password)) return callback(this.INVALID_PASSWORD);
        this.asyncJssoCall(
            "verifyForgotPassword",
            {
                mobile: mobile,
                otp: otp,
                password: password,
                confirmPassword: confirmPassword,
            },
            callback
        );
    }

    verifyEmailForgotPassword(email, otp, password, confirmPassword, callback) {
        if (!this.isValidEmail(email)) return callback(this.INVALID_EMAIL);
        if (!this.isValidPassword(password)) return callback(this.INVALID_PASSWORD);
        this.asyncJssoCall(
            "verifyForgotPassword",
            {
                email: email,
                otp: otp,
                password: password,
                confirmPassword: confirmPassword,
            },
            callback
        );
    }

    loginMobileForgotPassword(mobile, otp, password, confirmPassword, callback) {
        if (!this.isValidMobile(mobile)) return callback(this.INVALID_MOBILE);
        if (!this.isValidPassword(password)) return callback(this.INVALID_PASSWORD);
        this.asyncJssoCall(
            "loginForgotPassword",
            {
                mobile: mobile,
                otp: otp,
                password: password,
                confirmPassword: confirmPassword,
            },
            function (response) {
                if (response.code == 200) {
                    this.createChannelCookies();
                }

                if (callback) return callback(response);
            }.bind(this)
        );
    }

    loginEmailForgotPassword(email, otp, password, confirmPassword, callback) {
        if (!this.isValidEmail(email)) return callback(this.INVALID_EMAIL);
        if (!this.isValidPassword(password)) return callback(this.INVALID_PASSWORD);
        this.asyncJssoCall(
            "loginForgotPassword",
            {
                email: email,
                otp: otp,
                password: password,
                confirmPassword: confirmPassword,
            },
            function (response) {
                if (response.code == 200) {
                    this.createChannelCookies();
                }

                if (callback) return callback(response);
            }.bind(this)
        );
    }

    signOutUser(callback) {
        this.asyncJssoCall(
            "signOutUser",
            {},
            function (response) {
                try{
                        if(typeof navigator != 'undefined' ){
                                navigator.login.setStatus("logged-out");
                            }
                        }catch(e){}

                this.deleteChannelCookies();
                sessionStorage.removeItem("jsso_crosswalk_user_details")
                this.userDetails = "";
                this.fedcmInIfram();
                if (callback) return callback(response);
            }.bind(this)
        );
    }

    updateMobile(mobile, callback, userRecaptchaResponseToken, v3captchasecret) {
        if (!this.isValidMobile(mobile)) return callback(this.INVALID_MOBILE);
        if (userRecaptchaResponseToken) {
            this.asyncJssoCall(
                "updateMobile",
                {
                    mobile: mobile,
                    userRecaptchaResponseToken: userRecaptchaResponseToken,
                    v3captchasecret:v3captchasecret,
                },
                function (response) {
                    if (response.code == 200) {
                        this.createChannelCookies();
                    }
                    if (callback) return callback(response);
                }.bind(this)
            );
        } else {
            this.asyncJssoCall(
                "updateMobile",
                {
                    mobile: mobile,
                },
                callback
            );
        }
    }
    v1UpdateMobile(mobile, callback, userRecaptchaResponseToken, v3captchasecret) {
        if (!this.isValidMobile(mobile)) return callback(this.INVALID_MOBILE);
        if (userRecaptchaResponseToken) {
            this.asyncJssoCall(
                "v1UpdateMobile",
                {
                    mobile: mobile,
                    userRecaptchaResponseToken: userRecaptchaResponseToken,
                    v3captchasecret:v3captchasecret,
                },
                callback
            );
        } else {
            this.asyncJssoCall(
                "updateMobile",
                {
                    mobile: mobile,
                },
                asyncJssoCallWithHeaders,
                callback
            );
        }
    }

    verifyMobile(mobile, otp, callback) {
        if (!this.isValidMobile(mobile)) return callback(this.INVALID_MOBILE);
        this.asyncJssoCall(
            "verifyMobile",
            {
                mobile: mobile,
                otp: otp,
            },
            callback
        );
    }

    addAlternateEmail(email, callback) {
        if (!this.isValidEmail(email)) return callback(this.INVALID_EMAIL);
        this.asyncJssoCall(
            "addAlternateEmail",
            {
                email: email,
            },
            callback
        );
    }
    v1AddUpdateEmail(email, callback, userRecaptchaResponseToken, v3captchasecret) {
        if (!this.isValidEmail(email)) return callback(this.INVALID_EMAIL);

        if (userRecaptchaResponseToken) {
            this.asyncJssoCall(
                "v1AddUpdateEmail",
                {
                    email: email,
                    userRecaptchaResponseToken: userRecaptchaResponseToken,
                    v3captchasecret:v3captchasecret
                },
                function (response) {
                    if (response.code == 200) {
                        this.createChannelCookies();
                    }
                    if (callback) return callback(response);
                }.bind(this)
            );
        } else {
            this.asyncJssoCall(
                "v1AddUpdateEmail",
                {
                    email: email,
                },
                callback
            );
        }
    }
    v1AddUpdateMobile(mobile, callback, userRecaptchaResponseToken, v3captchasecret) {
        if (!this.isValidMobile(mobile)) return callback(this.INVALID_MOBILE);

        if (userRecaptchaResponseToken) {
            this.asyncJssoCall(
                "v1AddUpdateMobile",
                {
                    mobile: mobile,
                    userRecaptchaResponseToken: userRecaptchaResponseToken,
                    v3captchasecret:v3captchasecret,
                },
                function (response) {
                    if (response.code == 200) {
                        this.createChannelCookies();
                    }
                    if (callback) return callback(response);
                }.bind(this)
            );
        } else {
            this.asyncJssoCall(
                "v1AddUpdateMobile",
                {
                    mobile: mobile,
                },
                callback
            );
        }
    }

    verifyAlternateEmail(email, otp, callback) {
        if (!this.isValidEmail(email)) return callback(this.INVALID_EMAIL);
        this.asyncJssoCall(
            "verifyAlternateEmail",
            {
                email: email,
                otp: otp,
            },
            callback
        );
    }
    v1VerifyAlternateEmail(email, otp, uuid, callback) {
        if (!this.isValidEmail(email)) return callback(this.INVALID_EMAIL);
        this.asyncJssoCall(
            "v1verifyAlternateEmail",
            {
                email: email,
                otp: otp,
                uuid: uuid,
            },
            callback
        );
    }
    v1VerifyAlternateMobile(mobile, otp, uuid, callback) {
        if (!this.isValidMobile(mobile)) return callback(this.INVALID_MOBILE);
        this.asyncJssoCall(
            "v1verifyAlternateMobile",
            {
                mobile: mobile,
                otp: otp,
                uuid: uuid,
            },
            callback
        );
    }
    verifyUpdateOtp(otp, uuid, callback) {
        this.asyncJssoCall(
            "verifyUpdateOtp",
            {
                otp: otp,
                uuid: uuid,
            },
            callback
        );
    }

    linkFacebook(code, redirectUri, callback) {
        this.asyncJssoCall(
            "linkSocial",
            {
                oauthSiteId: "facebook",
                oauthCode: code,
                redirectUri: redirectUri,
            },
            callback
        );
    }

    linkGoogleplus(code, redirectUri, callback) {
        this.asyncJssoCall(
            "linkSocial",
            {
                oauthSiteId: "googleplus",
                oauthCode: code,
                redirectUri: redirectUri,
            },
            callback
        );
    }

    linkLinkedin(code, redirectUri, callback) {
        this.asyncJssoCall(
            "linkSocial",
            {
                oauthSiteId: "linkedin",
                oauthCode: code,
                redirectUri: redirectUri,
            },
            callback
        );
    }

    delinkSocial(source, callback) {
        this.asyncJssoCall(
            "delinkSocial",
            {
                oauthSiteId: source,
            },
            callback
        );
    }

    setPassword(newPass, confirmPass, callback) {
        if (!this.isValidPassword(newPass)) return callback(this.INVALID_PASSWORD);
        this.asyncJssoCall(
            "setPassword",
            {
                newPassword: newPass,
                confirmPassword: confirmPass,
            },
            callback
        );
    }

    changePassword(oldPass, newPass, confirmPass, callback) {
        if (!this.isValidPassword(newPass)) return callback(this.INVALID_PASSWORD);
        this.asyncJssoCall(
            "changePassword",
            {
                oldPassword: oldPass,
                newPassword: newPass,
                confirmPassword: confirmPass,
            },
            callback
        );
    }

    changePrimaryEmail(emailId, callback) {
        if (!this.isValidEmail(emailId)) return callback(this.INVALID_EMAIL);
        this.asyncJssoCall(
            "changePrimaryEmail",
            {
                emailId: emailId,
            },
            callback
        );
    }

    facebookLoginAccessToken(accessToken, facebookRedirectUri, callback) {
        this.asyncSocialappCall(
            "facebookLogin",
            {
                accessToken: accessToken,
                facebookRedirectUri: facebookRedirectUri,
            },
            function (response) {
                if (response.code == 200) {
                    this.createChannelCookies();
                }

                if (callback) return callback(response);
            }.bind(this)
        );
    }

    linkFacebookAccessToken(accessToken, redirectUri, callback) {
        this.asyncJssoCall(
            "linkSocial",
            {
                oauthSiteId: "facebook",
                accessToken: accessToken,
                redirectUri: redirectUri,
            },
            callback
        );
    }

    socialImageUpload(oauthSiteId, callback) {
        this.asyncJssoCall(
            "socialImageUpload",
            {
                oauthSiteId: oauthSiteId,
            },
            callback
        );
    }

    updateProfilePic(file, callback) {
        var apiUrl = this.ssoBaseUrl + "uploadProfilePic";
        var formData = new FormData();
        formData.append("datafile", file);
        var x = new XMLHttpRequest();
        x.open("POST", apiUrl);
        x.timeout = 30000;
        x.withCredentials = true;
        x.setRequestHeader("channel", this.channel);
        x.setRequestHeader("platform", this.platform);
        x.setRequestHeader("sdkVersion", this.sdkVersion);
        x.setRequestHeader("IsJssoCrosswalk", "true");
        x.setRequestHeader("csrfToken", this.getCookie("csrfToken"));
        x.setRequestHeader("captchaToken", this.getCookie("captchaToken"));
        x.setRequestHeader(
            "ssec",
            this.getCookie("jsso_crosswalk_ssec_" + this.channel)
        );
        x.setRequestHeader(
            "tksec",
            this.getCookie("jsso_crosswalk_tksec_" + this.channel)
        );
        x.responseType = "json";

        x.onload = function () {
            var response = x.response;

            if (typeof response == "string") {
                response = JSON.parse(response);
            }

            if (!response || !response.code) {
                this.deleteChannelCookies();
                if (callback) callback(this.UNAUTHORIZED_ACCESS_RESPONSE);
                return;
            }

            if (response.code == 404) {
                this.deleteChannelCookies();
                if (callback) callback(response);
                return;
            }

            if (x.getResponseHeader("csrftoken"))
                this.csrfToken = x.getResponseHeader("csrftoken");
            if (x.getResponseHeader("captchaToken"))
                this.captchaToken = x.getResponseHeader("captchaToken");
            if (x.getResponseHeader("ssec")) this.ssec = x.getResponseHeader("ssec");
            if (x.getResponseHeader("tksec"))
                this.tksec = x.getResponseHeader("tksec");
            if (callback) return callback(response);
        }.bind(this);

        x.onerror = function () {
            if (callback) return callback(this.CONNECTION_ERROR_RESPONSE);
        }.bind(this);

        x.ontimeout = function () {
            if (callback) return callback(this.CONNECTION_TIMEOUT_RESPONSE);
        }.bind(this);

        x.send(formData);
    }

    registerOnlyMobile(
        firstName,
        lastName,
        gender,
        mobile,
        termsAccepted,
        shareDataAllowed,
        timespointsPolicy,
        callback,
        userRecaptchaResponseToken,
        v3captchasecret
    ) {
        if (!mobile) return callback(this.INVALID_REQUEST);
        if (mobile && !this.isValidMobile(mobile))
            return callback(this.INVALID_MOBILE);

        if (userRecaptchaResponseToken) {
            this.asyncJssoCall(
                "registerOnlyMobile",
                {
                    firstName: firstName,
                    lastName: lastName,
                    gender: gender,
                    mobile: mobile,
                    termsAccepted: termsAccepted,
                    shareDataAllowed: shareDataAllowed,
                    timespointsPolicy: timespointsPolicy,
                    userRecaptchaResponseToken: userRecaptchaResponseToken,
                    v3captchasecret:v3captchasecret,
                },
                function (response) {
                    if (response.code == 200) {
                        this.createChannelCookies();
                    }
                    if (callback) return callback(response);
                }.bind(this)
            );
        } else {
            this.asyncJssoCall(
                "registerOnlyMobile",
                {
                    firstName: firstName,
                    lastName: lastName,
                    gender: gender,
                    mobile: mobile,
                    termsAccepted: termsAccepted,
                    shareDataAllowed: shareDataAllowed,
                    timespointsPolicy: timespointsPolicy,
                },
                callback
            );
        }
    }

    truecallerLogin(mobile, callback) {
        if (!mobile) return callback(this.INVALID_REQUEST);
        if (mobile && !this.isValidMobile(mobile))
            return callback(this.INVALID_MOBILE);
        this.asyncJssoCall(
            "truecallerLogin",
            {
                mobile: mobile,
            },
            callback
        );
    }

    truecallerVerify(requestId, callback) {
        if (!requestId) return callback(this.INVALID_REQUEST);
        this.asyncJssoCall(
            "truecallerVerify",
            {
                requestId: requestId,
            },
            function (response) {
                if (response.code == 200) {
                    this.createChannelCookies();
                }

                if (callback) return callback(response);
            }.bind(this)
        );
    }
    truecallerVerifyV1(requestId, callback) {
        if (!requestId) return ;
        this.asyncJssoCall(
            "truecallerVerify",
            {
                requestId: requestId,
            },
            function (response) {

                if (callback) return callback(response);
            }.bind(this)
        );
    }

    addAlternateEmailTrap(email, password, alterEmail, callback) {
        if (!this.isValidEmail(email)) return callback(this.INVALID_EMAIL);
        this.asyncJssoCall(
            "addAlternateEmailIdTrap",
            {
                email: email,
                password: password,
                alterEmail: alterEmail,
            },
            callback
        );
    }

    verifyAlternateEmailTrap(email, password, alterEmail, otp, callback) {
        if (!this.isValidEmail(email)) return callback(this.INVALID_EMAIL);
        this.asyncJssoCall(
            "verifyAlternateEmailIdTrap",
            {
                email: email,
                password: password,
                alterEmail: alterEmail,
                otp: otp,
            },
            callback
        );
    }

    addAlternateMobileTrap(email, password, alterMobile, callback) {
        if (!this.isValidEmail(email)) return callback(this.INVALID_EMAIL);
        this.asyncJssoCall(
            "addAlternateEmailIdTrap",
            {
                email: email,
                password: password,
                alterMobile: alterMobile,
            },
            callback
        );
    }

    verifyAlternateMobileTrap(email, password, alterMobile, otp, callback) {
        if (!this.isValidEmail(email)) return callback(this.INVALID_EMAIL);
        this.asyncJssoCall(
            "verifyAlternateMobileTrap",
            {
                email: email,
                password: password,
                alterMobile: alterMobile,
                otp: otp,
            },
            callback
        );
    }

    deleteAccount(password, callback) {
        this.asyncJssoCall(
            "deleteUser",
            {
                password: password,
            },
            callback
        );
    }

    getChannelDetails(channel, ru, callback) {
        this.asyncJssoCall(
            "channelDetails",
            {
                channel: channel,
                ru: ru,
            },
            callback
        );
    }

    gpOneTapLogin(token, callback) {
        this.asyncJssoCall(
            "gpOneTap",
            {
                token: token,
            },
            function (response) {
                if (response.code == 200) {
                    this.createChannelCookies();
                }

                if (callback) return callback(response);
            }.bind(this)
        );
    }

    subscriberLogin(token, callback) {
        this.asyncJssoCall(
            "subscriberLogin",
            {
                token: token,
            },
            function (response) {
                if (response.code == 200) {
                    this.createChannelCookies();
                }

                if (callback) return callback(response);
            }.bind(this)
        );
    }

    verifyMobileLoginGdpr(
        mobile,
        password,
        termsAccepted,
        shareDataAllowed,
        timespointsPolicy,
        callback
    ) {
        if (!this.isValidMobile(mobile)) return callback(this.INVALID_MOBILE);
        this.asyncJssoCall(
            "verifyLoginOtpPasswordGdpr",
            {
                mobile: mobile,
                password: password,
                termsAccepted: termsAccepted,
                shareDataAllowed: shareDataAllowed,
                timespointsPolicy: timespointsPolicy,
            },
            function (response) {
                if (response.code == 200) {
                    this.createChannelCookies();
                }

                if (callback) return callback(response);
            }.bind(this)
        );
    }
    verifyMobileLoginGdprForOptIn(
        mobile,
        password,
        termsAccepted,
        shareDataAllowed,
        timespointsPolicy,
        callback
    ) {
        if (!this.isValidMobile(mobile)) return callback(this.INVALID_MOBILE);
        this.asyncJssoCall(
            "verifyLoginOtpPasswordGdpr",
            {
                mobile: mobile,
                password: password,
                termsAccepted: termsAccepted,
                shareDataAllowed: shareDataAllowed,
                timespointsPolicy: timespointsPolicy,
            },
            function (response) {
                if (response.code == 200) {
                    this.createChannelCookies();
                }

                if (callback) return callback(response);
            }.bind(this)
        );
    }

    verifyEmailLoginGdpr(
        email,
        password,
        termsAccepted,
        shareDataAllowed,
        timespointsPolicy,
        callback
    ) {
        if (!this.isValidEmail(email)) return callback(this.INVALID_EMAIL);
        this.asyncJssoCall(
            "verifyLoginOtpPasswordGdpr",
            {
                email: email,
                password: password,
                termsAccepted: termsAccepted,
                shareDataAllowed: shareDataAllowed,
                timespointsPolicy: timespointsPolicy,
            },
            function (response) {
                if (response.code == 200) {
                    this.createChannelCookies();
                }

                if (callback) return callback(response);
            }.bind(this)
        );
    }
    verifyEmailLoginGdprForOptIn(
        email,
        password,
        termsAccepted,
        shareDataAllowed,
        timespointsPolicy,
        callback
    ) {
        if (!this.isValidEmail(email)) return callback(this.INVALID_EMAIL);
        this.asyncJssoCall(
            "verifyLoginOtpPasswordGdpr",
            {
                email: email,
                password: password,
                optInRequest: true,
                termsAccepted: termsAccepted,
                shareDataAllowed: shareDataAllowed,
                timespointsPolicy: timespointsPolicy,
            },
            function (response) {
                if (response.code == 200) {
                    this.createChannelCookies();
                }

                if (callback) return callback(response);
            }.bind(this)
        );
    }

    updateUserPermissions(
        termsAccepted,
        shareDataAllowed,
        timespointsPolicy,
        callback
    ) {
        this.asyncJssoCall(
            "updateUserPermissions",
            {
                termsAccepted: termsAccepted,
                shareDataAllowed: shareDataAllowed,
                timespointsPolicy: timespointsPolicy,
            },
            function (response) {
                if (response.code == 200) {
                    this.createChannelCookies();
                }

                if (callback) return callback(response);
            }.bind(this)
        );
    }

    truecallerOneTapLogin(checkTrueCallerFlag, callback) {
        if (
            !(
                checkTrueCallerFlag.valueOf() == true ||
                checkTrueCallerFlag.valueOf() == false
            )
        )
            return callback(this.INVALID_REQUEST);
        this.asyncJssoCall(
            "truecallerOneTapLogin",
            {},
            function (response) {
                if (response.code == 200) {
                    window.location.href =
                        "truecallersdk://truesdk/web_verify?requestNonce=" +
                        response.data.requestId +
                        "&partnerKey=O3Zo9fcfe8740f1d04593906db82270194b07&partnerName=" +
                        response.data.channelName +
                        "&lang=en&title=signIn&skipOption=skip";
                    if (checkTrueCallerFlag.valueOf() == false && callback)
                        return callback(response);
                    setTimeout(() => {
                        if (document.hasFocus()) {
                            if (callback)
                                return callback(this.APP_CONNECTION_TIMEOUT_RESPONSE);
                        } else {
                            if (callback) return callback(response);
                        }
                    }, 800);
                }
            }.bind(this)
        );
    }
    truecallerOneTapLoginV1(successCallback, failureCallback, popUpCallback, trueCallerId) {
        const _this = this;
        if(!trueCallerId){
            trueCallerId = "O3Zo9fcfe8740f1d04593906db82270194b07";
        }
        this.asyncJssoCall(
            "truecallerOneTapLogin",
             {},
              function (response) {
                if (response.code === 200) {
                const requestId = response.data.requestId;
                window.location.href =
                    "truecallersdk://truesdk/web_verify?requestNonce=" +
                    requestId +
                    "&partnerKey="+trueCallerId+
                    "&partnerName=" + response.data.channelName +
                    "&lang=en&title=signIn&skipOption=skip";

                    popUpCallback && popUpCallback({ type: 'OPEN' });

                setTimeout(() => {
                    if (document.hasFocus()) {
                        // Do NOT fail yet â€” just notify the UI to prompt user if needed
                        popUpCallback && popUpCallback({ type: 'SHOW_CONTINUE_HINT' });
                    }
                }, 800);

                // Start polling for verification
                let verifyCount = 0;
                const truecallerInterval = setInterval(() => {
                    if (verifyCount <= 10) {
                        _this.truecallerVerifyV1(requestId,(response)=>{
                            if ( response && response.data && response.data.code == 200) {
                                clearInterval(truecallerInterval)
                                _this.createChannelCookies();
                                successCallback && successCallback(response);
                            }else if ( response && response.data && response.data.code == 202){
                                clearInterval(truecallerInterval)
                                failureCallback && failureCallback(response)
                                popUpCallback && popUpCallback({'type':'SKIP'})
                            }
                            ++verifyCount
                        })
                    } else {
                        clearInterval(truecallerInterval);
                        failureCallback && failureCallback({ failedType: 'TIMEOUT' });
                        popUpCallback && popUpCallback({ type: 'TIMEOUT' });
                    }
                }, 1000);
            } else {
                // Handle backend error (e.g. failure to get requestId)
                failureCallback && failureCallback({ failedType: 'INIT_ERROR', message: response.message });
            }
        }.bind(this));
    }
    isIOS() {
        return [
            'iPad',
            'iPhone',
            'iPod'
        ].includes(navigator.platform)
        || (navigator.userAgent.includes("Mac"))
    }
    socialLogin(loginType, clientId, ru,clientRu) {
        if (loginType == "FACEBOOK") {
            this.openSocialLoginPage(
                "https://www.facebook.com/v5.0/dialog/oauth",
                clientId,
                loginType,
                ru
            );
        }

        if (loginType == "GOOGLEPLUS") {
            this.openSocialLoginPage(
                "https://accounts.google.com/o/oauth2/v2/auth",
                clientId,
                loginType,
                ru
            );
        }

        if (loginType == "LINKEDIN") {
            this.openSocialLoginPage(
                "https://www.linkedin.com/oauth/v2/authorization",
                clientId,
                loginType,
                ru
            );
        }
        if (loginType == "APPLE") {
            var isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
            if(this.isIOS() && isSafari){
                ru = ru+"?clientId="+clientId+'&clientRu='+clientRu+'&channel='+this.channel;
                var win = window.open(
                            ru,
                            "ssoLoginWindow",
                            "height=600,width=600,toolbar=no,titlebar=no,status=no,resizable=no,menubar=no,location=no,top=100,left=300,screenX=300,screenY=100"
                        );
            }
            else{
                this.openSocialLoginPage(
                    "https://appleid.apple.com/auth/authorize",
                    clientId,
                    loginType,
                    ru,
                    clientRu
                );
            }
        }
    }

    openSocialLoginPage(oauth2Endpoint, clientId, state, ru,clientRu,applePage) {
        var url = oauth2Endpoint;

        if (state == "FACEBOOK") {
            url +=
                "?client_id=" +
                clientId +
                "&display=popup&state=SSOTLOGIN" +
                state +
                "," +
                ru +
                "&redirect_uri=" +
                ru +
                "&scope=email";
        }

        if (state == "GOOGLEPLUS") {
            url +=
                "?response_type=code&client_id=" +
                clientId +
                "&state=SSOTLOGIN" +
                state +
                "," +
                ru +
                "&scope=email profile" +
                "&include_granted_scopes=true" +
                "&redirect_uri=" +
                ru;
        }

        if (state == "LINKEDIN") {
            url +=
                "?response_type=code&client_id=" +
                clientId +
                "&state=SSOTLOGIN" +
                state +
                "&scope=r_emailaddress r_liteprofile" +
                "&redirect_uri=" +
                ru;
        }
        if (state == "APPLE") {
            url +=
                "?client_id=" +
                clientId +
                "&state=SSOTLOGIN" +
                state +
                "," +
                clientRu +
                "&redirect_uri=" + ru +
                "&scope=email name" +
                "&response_type=code id_token&response_mode=form_post"

        }
        if(applePage){
            window.location.href = url;
            
        }else{
            var win = window.open(
                url,
                "ssoLoginWindow",
                "height=600,width=600,toolbar=no,titlebar=no,status=no,resizable=no,menubar=no,location=no,top=100,left=300,screenX=300,screenY=100"
            );
        }
    }

    getGeoLocation(callback) {
        var apiUrl = "https://geoapi.indiatimes.com/?cb=1";
        var script = document.createElement("script");

        script.onload = function () {
            if (callback) return callback(geoinfo);
        };

        script.src = apiUrl;
        document.head.appendChild(script);
    }

    linkSocialTrapPage(stateid, callback) {
        this.asyncJssoCall(
            "linkSocialTrap",
            {
                stateid: stateid,
            },
            callback
        );
    }

    resendMobileForgotPasswordOtp(mobile, callback, userRecaptchaResponseToken, v3captchasecret) {
        if (!this.isValidMobile(mobile)) return callback(this.INVALID_MOBILE);

        if (userRecaptchaResponseToken) {
            this.asyncJssoCall(
                "resendForgotPasswordOTP",
                {
                    mobile: mobile,
                    userRecaptchaResponseToken: userRecaptchaResponseToken,
                    v3captchasecret:v3captchasecret,
                },
                function (response) {
                    if (response.code == 200) {
                        this.createChannelCookies();
                    }
                    if (callback) return callback(response);
                }.bind(this)
            );
        } else {
            this.asyncJssoCall(
                "resendForgotPasswordOTP",
                {
                    mobile: mobile,
                },
                callback
            );
        }
    }

    resendEmailForgotPasswordOtp(email, callback, userRecaptchaResponseToken, v3captchasecret) {
        if (!this.isValidEmail(email)) return callback(this.INVALID_EMAIL);

        if (userRecaptchaResponseToken) {
            this.asyncJssoCall(
                "resendForgotPasswordOTP",
                {
                    email: email,
                    userRecaptchaResponseToken: userRecaptchaResponseToken,
                    v3captchasecret:v3captchasecret,
                },
                callback
            );
        } else {
            this.asyncJssoCall(
                "resendForgotPasswordOTP",
                {
                    email: email,
                },
                callback
            );
        }
    }

    resendMobileLoginOtp(mobile, callback, userRecaptchaResponseToken, v3captchasecret) {
        if (!this.isValidMobile(mobile)) return callback(this.INVALID_MOBILE);

        if (userRecaptchaResponseToken != undefined) {
            this.asyncJssoCall(
                "resendLoginOtp",
                {
                    mobile: mobile,
                    userRecaptchaResponseToken: userRecaptchaResponseToken,
                    v3captchasecret:v3captchasecret,
                },
                function (response) {
                    if (response.code == 200) {
                        this.createChannelCookies();
                    }

                    if (callback) return callback(response);
                }.bind(this)
            );
        } else {
            this.asyncJssoCallWithHeaders(
                "resendLoginOtp",
                {
                    mobile: mobile,
                },
                this.captchaToken,
                callback
            );
        }
    }

    resendEmailLoginOtp(email, callback, userRecaptchaResponseToken, v3captchasecret) {
        if (!this.isValidEmail(email)) return callback(this.INVALID_EMAIL);

        if (userRecaptchaResponseToken != undefined) {
            this.asyncJssoCall(
                "resendLoginOtp",
                {
                    email: email,
                    userRecaptchaResponseToken: userRecaptchaResponseToken,
                    v3captchasecret:v3captchasecret,
                },
                callback
            );
        } else {
            this.asyncJssoCallWithHeaders(
                "resendLoginOtp",
                {
                    email: email,
                },
                this.captchaToken,
                callback
            );
        }
    }

    GisLogin(clientId, credential, select_by, ru, callback) {
        this.asyncJssoCall(
            "GISverify",
            {
                clientId: clientId,
                credential: credential,
                select_by: select_by,
                ru: ru,
            },
            function (response) {
                if (response.code == 200) {
                    this.createChannelCookies();
                    this.fedcmInIfram(response);
                }

                if (callback) return callback(response);
            }.bind(this)
        );
    }

    credLogin(accessToken, callback) {
        this.asyncJssoCall(
            "credLogin",
            {
                accessToken: accessToken,
            },
            function (response) {
                if (response.code == 200) {
                    this.createChannelCookies();
                }

                if (callback) return callback(response);
            }.bind(this)
        );
    }
    newSocialLogin(accessToken, preference, loginType, callback) {
        this.asyncJssoCall(
            "socialLogin",
            {
                accessToken: accessToken,
                preference: preference,
                loginType: loginType,
            },
            function (response) {
                if (response.code == 200) {
                    this.createChannelCookies();
                }

                if (callback) return callback(response);
            }.bind(this)
        );
    }

    createChannelCookies() {
        var now = new Date();
        var midnight = new Date(now);
        midnight.setHours(24, 0, 0, 0);
        this.createCookie(
            "jsso_crosswalk_login_" + this.channel,
            "true",
            30 * 24 * 60 * 60 * 1000
        );
        this.createCookie(
            "jsso_crosswalk_daily_" + this.channel,
            "true",
            midnight - now
        );
        this.createCookie("csrfToken", this.csrfToken, 30 * 24 * 60 * 60 * 1000);
        this.createCookie(
            "captchaToken",
            this.captchaToken,
            30 * 24 * 60 * 60 * 1000
        );
        this.createCookie(
            "jsso_crosswalk_ssec_" + this.channel,
            this.ssec,
            30 * 24 * 60 * 60 * 1000
        );
        this.createCookie(
            "jsso_crosswalk_tksec_" + this.channel,
            this.tksec,
            30 * 24 * 60 * 60 * 1000
        );
        this.createCookie("csut", this.csut, 30 * 24 * 60 * 60 * 1000);
        this.createCookie("gdpr", this.gdpr, 30 * 24 * 60 * 60 * 1000);
    }

    getChannelCookies() {
        var channelCookies = {};
        channelCookies.login = this.getCookie(
            "jsso_crosswalk_login_" + this.channel
        );
        channelCookies.daily = this.getCookie(
            "jsso_crosswalk_daily_" + this.channel
        );
        return channelCookies;
    }

    deleteChannelCookies() {
        this.deleteCookieByName("jsso_crosswalk_login_" + this.channel);
        this.deleteCookieByName("jsso_crosswalk_daily_" + this.channel);
        this.deleteCookieByName("csrfToken");
        this.deleteCookieByName("captchaToken");
        this.deleteCookieByName("jsso_crosswalk_ssec_" + this.channel);
        this.deleteCookieByName("jsso_crosswalk_tksec_" + this.channel);
        this.deleteCookieByName("csut");
        this.deleteCookieByName("gdpr");
    }

    getCookie(cname) {
        var name = cname + "=";
        var decodedCookie = decodeURIComponent(document.cookie);
        var ca = decodedCookie.split(";");

        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];

            while (c.charAt(0) == " ") {
                c = c.substring(1);
            }

            if (c.indexOf(name) == 0) {
                return c.substring(name.length, c.length);
            }
        }

        return "";
    }

    deleteCookieByName(name) {
        document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/";
    }

    createCookie(name, value, expiryInMillis) {
        var now = new Date();
        var expireTime = now.getTime() + expiryInMillis;
        now.setTime(expireTime);
        document.cookie =
            name + "=" + value + "; expires=" + now.toGMTString() + "; path=/";
    }

    getSessionStorage(name) {
        let val = null;
        if (window.sessionStorage) {
            val = sessionStorage.getItem(name);

            if (val && val.indexOf("~~") > -1) {
                //Check for expiry date
                var vals = val.split("~~");
                var expiryDate = parseInt(vals[1]);
                if (expiryDate < new Date().getTime()) {
                    val = null;
                    sessionStorage.removeItem(name);
                } else {
                    val = vals[0];
                }
            }
        }
        return val;
    }

    setSessionStorage(name, value, timeInMins) {
        var timeInMs = timeInMins * 60 * 1000;
        var expiryDate = new Date().getTime() + timeInMs;
        if (window.sessionStorage) {
            if (value == null) {
                sessionStorage.removeItem(name);
            } else {
                try {
                    sessionStorage.setItem(name, value + "~~" + expiryDate);
                } catch (e) {
                    //Setting in cookie if setting in sessionStorage failed due to quota or unavailability
                }
            }
        }
    }

    isValidEmail(email) {
        var re =
            /^(([^<>()\[\]\\.,;:\s@"]+([^<>()\[\]\\,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase().trim());
    }

    isValidMobile(mobile) {
        var re =
            /^((((\+?\(91\))|0|((00|\+)?91))-?)?[6-9]\d{9})|((\+\d{1,5}[-])\d{3,14})$/;
        return re.test(String(mobile.trim()));
    }

    isValidDomain(domain) {
        var regex = new RegExp(
            "^(ttp[s]?:\\/\\/(www\\.)?|ftp:\\/\\/(www\\.)?|www\\.){1}([0-9A-Za-z-\\.@:%_+~#=]+)+((\\.[a-zA-Z]{2,3})+)(/(.)*)?(\\?(.)*)?"
        );
        return regex.test(String(domain));
    }

    isValidPassword(password) {
        password = String(password);
        var re1 = /.*[a-z]+.*/;
        var re2 = /.*[!@#$%^&*()]+.*/;
        var re3 = /.*[0-9]+.*/;
        if (password.length < 6 || password.length > 14) return false;
        if (re1.test(password) && re2.test(password) && re3.test(password))
            return true;
        return false;
    }

    open(...args) {
        const [url, ...restParams] = args;
        if (!url) return;
        let newURL = new URL(url);
        const callback = (response) => {
            const ticketId = response.data.encTicket;
            newURL.searchParams.set("ticketId", ticketId);
            window.open(newURL, ...restParams);
        };
        this.getValidLoggedInUser(callback);
    }
}

function getParameterByName(name, url) {
    url = url || window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return "";
    if (!results[2]) return "";
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}
function isSafari() {
    return /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
}
if (typeof window !== "undefined" && typeof JssoCrosswalk === "function" && typeof window.JssoCrosswalk !== "function") {
    window.JssoCrosswalk = JssoCrosswalk;
}