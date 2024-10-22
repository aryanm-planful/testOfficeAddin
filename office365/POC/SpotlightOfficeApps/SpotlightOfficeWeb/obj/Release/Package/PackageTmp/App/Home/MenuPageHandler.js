function getInfo(field){
  switch(field) {
    case "version":
        return guserProperties.getProperty(userPropContants.VERSION);
    case "app":
        return guserProperties.getProperty(userPropContants.TENANT_NAME);
    case "role":
        return guserProperties.getProperty(userPropContants.ROLE);
    case "userName":
        return guserProperties.getProperty(userPropContants.NAME);
    case "userEmail":
        return guserProperties.getProperty(userPropContants.EMAIL);
    case "pcrInfo":
      return {
        'pcrLogoutUrl': guserProperties.getUrl('/Utilities/Logout.aspx'),
        'isPcrOrigin': guserProperties.getProperty(userPropContants.IS_PCR_ORIGIN)
      };    
  }

  return "";
}

function handleLogout() {
  Logger.log("Logging out!!!");
 
  resetProperties();
  LaunchSpotlightLogin();
}

function resetProperties(){
  guserProperties.deleteProperty(userPropContants.AUTH_TOKEN);
  guserProperties.deleteProperty(userPropContants.VERSION);
  guserProperties.deleteProperty(userPropContants.TENANT_NAME);
  guserProperties.deleteProperty(userPropContants.ROLE);
  guserProperties.deleteProperty(userPropContants.NAME);
  guserProperties.deleteProperty(userPropContants.EMAIL);
  guserProperties.setProperty(userPropContants.IS_LOGGEDIN, false);
}