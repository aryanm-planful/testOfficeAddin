const apiHandler = {
    POST : 'POST',
    GET : 'GET',
    DELETE: 'DELETE',

    fetch (path, method, body = {}, onSuccess = null, onFailure = null, useApiUrl = true){
      let apiResponseStatus = {};
      apiResponseStatus.apiException = false;

      var response = {};
      Logger.log("FETCH(): Path: " + path + "; method: " + method);
      try{
            
            var headers = {};
            
            const authToken = guserProperties.getProperty(userPropContants.AUTH_TOKEN);
            if (authToken !== null) {
            headers["X-AUTH-TOKEN"] = authToken;
            }
            
            headers["X-CLIENT"] = 'web';
            
            var options = {
                'method': method,
                'contentType': 'application/json',
                "headers": headers
            };

            if(method == 'POST'){
                options.payload = JSON.stringify(body);
            }

            options.muteHttpExceptions = true;

            var apiUrl = null;
            if(useApiUrl == false){
                apiUrl = guserProperties.getUrl(path);
            }
            else{
                apiUrl = guserProperties.getApiUrl(path);
            }

            response = UrlFetchApp.fetch(apiUrl, options);
            Logger.log("Fetch(): APIURL: " + apiUrl + "\r\nOptions:" + JSON.stringify(options) + "\r\n Api response: " + response.getResponseCode());
      }
      catch(err){
          apiResponseStatus.apiException = true;
          var msg = err.message;
          apiResponseStatus.message = msg;

          Logger.log("Exception in FetchAPI:\r\n" + msg);
      }
      finally{
          apiResponseStatus.response = response;

          if(response != undefined && apiResponseStatus.apiException == false){
              if(response.getResponseCode() == 401){
                  LaunchSpotlightLogin();
                  var resp = JSON.parse(response.getContentText());
                  SpreadsheetApp.getActiveSpreadsheet().toast(resp.message, "Error:");
              }
              else{
                  if(onSuccess != null){
                      return onSuccess(response);
                  }
                  else{
                      return response;
                  }
              }
          }
          else{
              if(onFailure != null){
                  return onFailure(apiResponseStatus);
              }
              else{
                  return apiResponseStatus;
              }
          }
      }
  }
}
