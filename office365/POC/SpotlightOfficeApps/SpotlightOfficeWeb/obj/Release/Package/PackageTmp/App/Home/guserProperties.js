
const guserProperties = {
  getUserProperties(){
    return PropertiesService.getUserProperties();
  },

  initialize(){
    var value = '';
    Object.keys(userPropContants).forEach(item => {
       Logger.log("initialize:" + "key: " + item + "\r\n" + "Value: " + value);
       if(item !== userPropContants.APP_DOMAIN && 
          item !== userPropContants.API_URL &&
          item !== userPropContants.USER_NAME &&
          item !== userPropContants.LOGIN_URL)
        {
          this.getUserProperties().setProperty(item, value);
        }
    })
  },

  setProperty(key, value){
     Logger.log("setProperty:" + "key: " + key + "\r\n" + "Value: " + value);
     this.getUserProperties().setProperty(key, value);
  },

  getProperty(key){
    var value = this.getUserProperties().getProperty(key);
    Logger.log("getProperty:" + "key: " + key + "\r\n" + "Value: " + value);

    return value;
  },

  deleteProperty(key){
     Logger.log("deleteProperty:" + "key: " + key);
     this.getUserProperties().deleteProperty(key);
  },

  getUrl(path){
    return this.composeUrl(guserProperties.getProperty(userPropContants.APP_DOMAIN),path);
  },

  getApiUrl(path){
    return this.composeUrl(guserProperties.getProperty(userPropContants.API_URL), path);
  },

  composeUrl(base, path){
    var url = base;
     if(path.startsWith('/')){
      if(base.endsWith('/')){ 
        url = base.slice(0, appUrl.lastIndexOf('/')).concat(path);
      }
      else
      {
        url += path;
      }
    }
    else
    {
      if(base.endsWith('/')){ 
        url +=path;
      }
      else
      {
        url = base.concat('/',path);
      }
    }
    return url;
  }
}

const userPropContants = {
  API_URL :"API_URL",
  AUTH_TOKEN : "AUTH_TOKEN",
  XCSRF : "XCSRF",
  COOKIE : "COOKIE",
  APP_DOMAIN : "APP_DOMAIN",
  USER_NAME : "USER_NAME",
  TENANT_NAME : "TENANT_NAME",
  NAME: "NAME",
  ROLE: "ROLE",
  VERSION: "VERSION",
  EMAIL: "EMAIL",
  GROUPS: "GROUPS",
  USER_DETAILS : "USER_DETAILS",
  App_URL_LIST : "APP_URL_LIST",
  IS_LOGGEDIN: "IS_LOGGEDIN",
  LOGIN_URL: "LOGIN_URL",
  IS_PCR_ORIGIN: "IS_PCR_ORIGIN"
};