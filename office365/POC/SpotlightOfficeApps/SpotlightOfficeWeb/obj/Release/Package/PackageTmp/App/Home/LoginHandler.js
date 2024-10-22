function ValidateUserTest() {
    ValidateUser("https://modelsbx.planful.com", "qaautomation@planful.com", "Test@123");
}
function getLoginStoredMetaData(){
    let resp = {};
    resp.url = guserProperties.getProperty(userPropContants.LOGIN_URL);
    resp.userName = guserProperties.getProperty(userPropContants.USER_NAME);

    return resp;
}

function ValidateUser(appUrl, username, password) {
    try {

        Logger.log("ValidateUser: " + appUrl + "\r\n" + username);
        if (username != '' && password != ''){
            return LoginApi(appUrl, username, password);
        }
        else
            return appConstants.LOGIN_FAILED;
    }
    catch (err) {
        showExceptionMessage(err);
        return err.message;
    }
}

function getListOfUrls(){
 
  var appUrlListJson = guserProperties.getProperty(userPropContants.App_URL_LIST);
  var appUrlList = null;
  
  if(appUrlListJson != null && appUrlListJson != undefined){
      appUrlList = JSON.parse(appUrlListJson);
  }

  if (appUrlList == null) {
      appUrlList = new Array();
  }

  return appUrlList;
}

function LoginApi(appUrl, username, pwd) {
    var data = {
        'Client': 'neon',
        'Username': username,
        'Password': pwd,
        'NewPassword': '',
        'ConfirmPassword': ''
    };
    
    guserProperties.setProperty(userPropContants.APP_DOMAIN, appUrl);
    guserProperties.setProperty(userPropContants.USER_NAME, username);

    return apiHandler.fetch('/login', apiHandler.POST, data, onLoginSuccess, onLoginFailure, false);
}

function onLoginFailure(response) {
    return response.message;
}

function onLoginSuccess(response) {
    var headers = response.getAllHeaders();
    var cookies = headers['Set-Cookie'];

    if (cookies == undefined) {
        var parsedData = JSON.parse(response.getContentText());
        if (parsedData.status == false) {
            return parsedData.message;
        }
    }

    Logger.log(cookies);
    var savedCookie = cookies;

    if (200 == response.getResponseCode()) {
        Logger.log("saved cookie : " + savedCookie);

        Logger.log("ContentText: " + response.getContentText());

        var parsedData = JSON.parse(response.getContentText());

        var messages = parsedData["message"];
        var xcsrf = messages["X-CSRF"];
        Logger.log("xcsrf: " + xcsrf);

        // cookie can be an array
        guserProperties.setProperty(userPropContants.COOKIE, savedCookie.toString());
        guserProperties.setProperty(userPropContants.XCSRF, xcsrf);

        saveLoginURL();
        LaunchTenantScreen();

        return "";
    }

    return appConstants.LOGIN_FAILED;
}

function clearAppUrlList() {
    guserProperties.deleteProperty(userPropContants.App_URL_LIST);
}

function saveLoginURL() {
    try {
        var currentAppDomain = guserProperties.getProperty(userPropContants.LOGIN_URL);
        var appUrlList = getListOfUrls();
        appUrlList.unshift(currentAppDomain);
        
        appUrlList = filterUrlDisplayList(appUrlList);
        guserProperties.setProperty(userPropContants.App_URL_LIST, JSON.stringify(appUrlList));
    } catch (err) {
        showExceptionMessage(err);
    }
}

function filterUrlDisplayList(arr) {
  arr = arr.filter((item,
      index) => arr.indexOf(item) === index);

  while(arr.length > appConstants.URL_LIST_COUNT){
    arr.pop();
  }

  return arr;
}

function selectApplication(response) {
    Logger.log("Entered selectApplication");

    return apiHandler.fetch('/secure/application', apiHandler.GET, null, onAppSelectionSuccess, onAppSelectionFailed, false);

    function onAppSelectionSuccess(response) {
        var xcsrf = null;

        Logger.log("Entered onAppSelectionSuccess");
        if (response != false) {
            //Get the date
            var html = response.getContentText().trim();
            var subs = html.substring(0, 1811).trim();

            Logger.log("Extracted HTML: " + subs);

            xcsrf = subs.substring(subs.length - 36);

            Logger.log("Extracted HTML: " + xcsrf);
        }
        return xcsrf;
    }

    function onAppSelectionFailed(response) {
        Logger.log("Entered onAppSelectionFailed");

        return "";
    }
}

function LaunchTenantScreen() {
    var form = HtmlService.createTemplateFromFile('AppTenantSelection').evaluate().setTitle("Spotlight Tenant Selection");
    SpreadsheetApp.getUi().showSidebar(form);
}

function handleLogin(appUrl, data){
    Logger.log("Entered handleLogin() data :" + JSON.stringify(data));

    guserProperties.setProperty(userPropContants.LOGIN_URL, appUrl);
    saveLoginURL();
    let pathArray = appUrl.split( '/' );
    let domain = pathArray[0] + '//' + pathArray[2];
    guserProperties.setProperty(userPropContants.APP_DOMAIN, domain);
    guserProperties.setProperty(userPropContants.AUTH_TOKEN, data.params[userPropContants.AUTH_TOKEN]);
    let decodedApiUrl = decodeURIComponent(data.params[userPropContants.API_URL]);
    guserProperties.setProperty(userPropContants.API_URL, decodedApiUrl);
    guserProperties.setProperty(userPropContants.XCSRF, data.params[userPropContants.XCSRF]);
    guserProperties.setProperty(userPropContants.IS_PCR_ORIGIN, data.params[userPropContants.IS_PCR_ORIGIN]? data.params[userPropContants.IS_PCR_ORIGIN] : '');
} 

function launchHomePage(response) {
    getUser(response);
    LaunchHomePage();
}
