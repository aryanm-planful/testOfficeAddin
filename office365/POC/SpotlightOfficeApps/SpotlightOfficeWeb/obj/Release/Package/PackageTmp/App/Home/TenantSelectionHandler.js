function getListOfTenants(){
    Logger.log("Entered getListOfTenants");
    return apiHandler.fetch("/secure/api/security/tenantdetails", apiHandler.GET, null, OnSuccess, OnFailure, false);

    function OnSuccess(response){
      Logger.log("Entered getListOfTenants success callback");
      const apiResponse = {};
      apiResponse.status = true;
      apiResponse.data = response.getContentText();

      var lastTenant = apiHandler.fetch("/secure/api/security/lastLogInTenant", apiHandler.GET, null, null, null, false);
      if(lastTenant != null && 200.0 == lastTenant.getResponseCode()){
        Logger.log("Last Selected tenant: " + lastTenant.getContentText());
        apiResponse.lastTenant = JSON.parse(lastTenant.getContentText());
      }

      return apiResponse;
    }

    function OnFailure(apiResponseStatus){
      const apiResponse = {};
      apiResponse.status = false;
      apiResponse.data = apiResponseStatus.message;

      Logger.log("Entered getListOfTenants failed callback");

      return apiResponseStatus;
    }
}

function ProceedToLogin(tenantName){
    Logger.log("Entered ProceedToLogin(): Selected TenantName" + tenantName);

    var tenantRespCode = selectTenant(tenantName);
    if (tenantRespCode == 204.0) {
        if(openApplicationpage()){
          if(getUser()){
              LaunchHomePage();
          }
        }
        else{
          Logger.log("Issue with tenant");
        }
    }
}

function getUser(resp) {
    Logger.log("Entered getUser()");

    guserProperties.setProperty(userPropContants.USER_DETAILS, resp);
    guserProperties.setProperty(userPropContants.VERSION, resp.version);
    guserProperties.setProperty(userPropContants.NAME, resp.name);
    guserProperties.setProperty(userPropContants.ROLE, resp.roleDescription);
    guserProperties.setProperty(userPropContants.EMAIL, resp.email);
    guserProperties.setProperty(userPropContants.GROUPS, resp.groups);
    guserProperties.setProperty(userPropContants.USER_NAME, resp.email);
    guserProperties.setProperty(userPropContants.TENANT_NAME, resp.tenant);
    guserProperties.setProperty(userPropContants.IS_LOGGEDIN, true);

    var txt = resp.email + " is successfully logged in!"
    SpreadsheetApp.getActive().toast(txt);
}

function selectTenant(tenantName) {
    guserProperties.setProperty(userPropContants.TENANT_NAME, tenantName);

    var data = {
        'tenant': tenantName,
        'loginMode': 'NATIVE',
    };

    var response = apiHandler.fetch('/secure/api/security/switchTenant', apiHandler.POST, data, null ,null,  false);
    return response.getResponseCode();
}


function openApplicationpage() {
    Logger.log("Entered openApplicationpage()");

    var response = apiHandler.fetch('/secure/analyze', apiHandler.GET, null , null, null, false);
    if(response.getResponseCode() != 200.0){
      return false;
    }

    var headers = response.getAllHeaders();
    
    Logger.log("openApplicationpage(): Headers: " + JSON.stringify(headers));

    var cky = headers['Set-Cookie'];
    Logger.log(cky[0]);
    Logger.log(cky[1]);
    var xauth = (cky[0].split('; '))[0].split('=');
    var authToken = xauth[1];
    Logger.log("AuthToken: " + authToken);

    var apiURLEq = (cky[1].split('; '))[0].split('=');
    var apiUrl = apiURLEq[1];
    Logger.log("APIURL: " + apiUrl);

    let decodedApiUrl = decodeURIComponent(apiUrl);
    guserProperties.setProperty(userPropContants.AUTH_TOKEN, authToken);
    guserProperties.setProperty(userPropContants.API_URL, decodedApiUrl);

    return true;
}

