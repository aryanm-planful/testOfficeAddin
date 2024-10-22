const IDENTITY = value => value;

function composeUrl(base, path){
    var url = base;
    if(path.startsWith('/')){
        if(base.endsWith('/')){ 
            url = base.slice(0, appUrl.lastIndexOf('/')).concat(path);
        }
        else{
         url += path;
        }
    }
    else{
      if(base.endsWith('/')){ 
        url +=path;
      }
      else{
        url = base.concat('/',path);
      }
    }
    return url;
}

const http = {

    POST: "POST",
    GET: "GET",
    DELETE: "DELETE",

    fetch: (route = '', method = "GET", body = {},
        onSuccessHandler, onFailureHandler, useApiUrl = true ) => {
            
          
    }
}

