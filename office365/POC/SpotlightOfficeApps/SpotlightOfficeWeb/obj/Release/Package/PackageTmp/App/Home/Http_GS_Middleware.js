function getHeadersJSON() {
    return ({
        "Content-Type": 'application/json',
        "cookie": guserProperties.getProperty(userPropContants.COOKIE),
        "X-CSRF": guserProperties.getProperty(userPropContants.XCSRF),
        "X-AUTH-TOKEN": guserProperties.getProperty(userPropContants.AUTH_TOKEN),
        "X-API-URI" : guserProperties.getProperty(userPropContants.API_URL),
        "X-CLIENT": 'web'
      })
}
  
function getAppDomainAndApiUrl() {
    return {
      APP_DOMAIN: guserProperties.getProperty(userPropContants.APP_DOMAIN),
      API_URL: guserProperties.getProperty(userPropContants.API_URL),
      AUTH_TOKEN : guserProperties.getProperty(userPropContants.AUTH_TOKEN)
    }
}
  
  
function getHeadersAndUserProperties() {
    return { 
      headers: getHeadersJSON(),
      props: getAppDomainAndApiUrl()
    }
}
  
function handleAuthError(msg){
    LaunchSpotlightLogin();
    SpreadsheetApp.getActiveSpreadsheet().toast(msg, "Error:");
}