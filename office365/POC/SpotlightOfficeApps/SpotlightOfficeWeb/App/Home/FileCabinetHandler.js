function getFileCabinet(repoType) {
    var html = HtmlService.createHtmlOutputFromFile("FileCabinet").getContent();

    return html;
}


function OnSuccessCabinets(parentId, CabinetsResponse) {
    var cabinets = CabinetsResponse;
    var result = []
    cabinets.map(function (each) {
        var node = {
            id: each.id, parent: each.parentId,
            text: each.name, type: each.type,
            data: {
                "isApiCalled": false,
                "isDroppable": each.attributes.isDroppable,
                "hasChildren": each.hasChildren,
                "models": each.attributes.models,
                "repository_type": each.attributes.type
            }
        }
        if (parentId === "FileCabinet_Snapshot_ID") {
          node.data.repository_type = each.type;
        }
        if(each.hasChildren){
            var child_data ={
                id: each.id + "_Children" , parent: each.id,
                text: '<i class="fa fa-spinner fa-spin"></i>',
                data: {
                    "repository_type": node.data.repository_type
                },
                type: "LoadingChildrenType",
                "li_attr":{
                  "class":"loadingChildrenNodeClass"
                }
            }
            result.push(child_data);
        }
        result.push(node);
    })

    return result
}


function onGetFileCabinetSuccess(repotype, response) {
    if (repotype === "adhoc") {
        // var adhocCabinets = JSON.parse(response.getContentText());
        var adhocCabinets = response
        var result = [];
        var fav_array = [];
        var recent_array = [];
        var adhoc_array = [];
        var esm_array = [];
        adhocCabinets.forEach(function (adhoc) {

            var oneData =
            {
                id: adhoc.id, parent: "#",
                text: adhoc.name, type: adhoc.attributes.type,
                data: {
                    "isApiCalled": false,
                    "isDroppable": true,
                    "repository_type": adhoc.attributes.type,
                    "hasChildren": adhoc.hasChildren
                }
            };
            if (adhoc.attributes.isEsmArtifact) {
                oneData.type = "esmModel";
            }
            if(adhoc.hasChildren){
                var child_data ={
                    id: adhoc.id + "_Children" , parent: adhoc.id,
                    text: '<i class="fa fa-spinner fa-spin"></i>',
                    data: {
                        "repository_type": adhoc.attributes.type
                    },
                    type: "LoadingChildrenType",
                    "li_attr":{
                      "class":"loadingChildrenNodeClass"
                    }
                }

                adhoc_array.push(child_data);
            }
            adhoc_array.push(oneData);

        });
        result = result.concat(fav_array);
        result = result.concat(recent_array);
        result = result.concat(adhoc_array);
        result = result.concat(esm_array);
        return result;
    }
    else {
        var ids = [];
        var result = [];
        var cabinetsIds = response
        // var cabinetsIds = JSON.parse(response.getContentText());
        cabinetsIds.forEach(function (cabinet) {
            ids.push(cabinet.id);
            var node = {
                id: cabinet.id, parent: "#",
                text: cabinet.name, type: cabinet.attributes.type,
                data: {
                    "isApiCalled": true,
                    "isSubFolder": cabinet.attributes.isSubFolderCreatable,
                    "hasChildren": cabinet.hasChildren,
                    "models": cabinet.attributes.models,
                    "repository_type": cabinet.attributes.type,
                    "isDroppable": true
                }
            }
            result.push(node);
        })

        return { ids, result, repositoryType: 'executive' }

    }
}



function gsGetFileCabinet(repotype) {
    var data = {
        'mode': 'run',
        'parentId': '',
        'repositoryType': repotype,
    };

    return apiHandler.fetch(apiUrls.fileCabinet.getItems, apiHandler.POST, data, OnSuccess, OnFailure);

    function OnSuccess(response) {
        if (repotype === "adhoc") {
            var adhocCabinets = JSON.parse(response.getContentText());
            var result = [];
            var fav_array = [];
            var recent_array = [];
            var adhoc_array = [];
            var esm_array = [];
            adhocCabinets.forEach(function (adhoc) {

                var oneData =
                {
                    id: adhoc.id, parent: "#",
                    text: adhoc.name, type: adhoc.attributes.type,
                    data: {
                        "isApiCalled": false,
                        "isDroppable": true,
                        "repository_type": adhoc.attributes.type,
                        "hasChildren": adhoc.hasChildren
                    }
                };
                if (adhoc.attributes.isEsmArtifact) {
                    oneData.type = "esmModel";
                }
                if(adhoc.hasChildren){
                    var child_data ={
                        id: adhoc.id + "_Children" , parent: adhoc.id,
                        text: '<i class="fa fa-spinner fa-spin"></i>',
                        data: {
                            "repository_type": adhoc.attributes.type
                        },
                        type: "LoadingChildrenType",
                        "li_attr":{
                          "class":"loadingChildrenNodeClass"
                        }
                    }

                    adhoc_array.push(child_data);
                }
                adhoc_array.push(oneData);

            });
            result = result.concat(fav_array);
            result = result.concat(recent_array);
            result = result.concat(adhoc_array);
            result = result.concat(esm_array);
            return result;
        }
        else {
            var ids = [];
            var result = [];
            var cabinetsIds = JSON.parse(response.getContentText());
            cabinetsIds.forEach(function (cabinet) {
                ids.push(cabinet.id);
                var node = {
                    id: cabinet.id, parent: "#",
                    text: cabinet.name, type: cabinet.attributes.type,
                    data: {
                        "isApiCalled": true,
                        "isSubFolder": cabinet.attributes.isSubFolderCreatable,
                        "hasChildren": cabinet.hasChildren,
                        "models": cabinet.attributes.models,
                        "repository_type": cabinet.attributes.type,
                        "isDroppable": true
                    }
                }
                result.push(node);
            })


            ids.forEach(function (id) {
                var param = {
                    'mode': 'run',
                    'parentId': id,
                    'repositoryType': 'executive',
                    "isDroppable": true
                };
                apiHandler.fetch(apiUrls.fileCabinet.getItems, apiHandler.POST, param, OnSuccessCabinets, OnFailure);
                function OnSuccessCabinets(CabinetsResponse) {
                    var cabinets = JSON.parse(CabinetsResponse.getContentText());
                    cabinets.map(function (each) {
                        var node = {
                            id: each.id, parent: each.parentId,
                            text: each.name, type: each.type,
                            data: {
                                "isApiCalled": false,
                                "isDroppable": each.attributes.isDroppable,
                                "hasChildren": each.hasChildren,
                                "models": each.attributes.models,
                                "repository_type": each.attributes.type
                            }
                        }
                        if (id === "FileCabinet_Snapshot_ID") {
                          node.data.repository_type = each.type;
                        }
                        if(each.hasChildren){
                            var child_data ={
                                id: each.id + "_Children" , parent: each.id,
                                text: '<i class="fa fa-spinner fa-spin"></i>',
                                data: {
                                    "repository_type": node.data.repository_type
                                },
                                type: "LoadingChildrenType",
                                "li_attr":{
                                  "class":"loadingChildrenNodeClass"
                                }
                            }
                            result.push(child_data);
                        }
                        result.push(node);
                    })
                }

            })
            return result;

        }
    }

    function OnFailure(failureResponse) {
        Logger.log("Entered getItems failed callback for filecabinet: \r\n" + failureResponse);
       

        return "";
    }
}

function getitemsforParent(parentId, repoType) {

    var data = {
        'mode': 'run',
        'parentId': parentId,
        'repositoryType': repoType,
    };
    return apiHandler.fetch(apiUrls.fileCabinet.getItems, apiHandler.POST, data, OnSuccess, OnFailure);

    function OnSuccess(response) {
        var result = JSON.parse(response.getContentText());

        return result;
    }

    function OnFailure(response) {
        Logger.log("Entered failed callback for children items for respective parent : \r\n" + response);

        return "";
    }
}


function getSearchItems(type, textToSearch) {


    var data = {
        "mode": "run",
        "filter": "contains",
        "parentId": "",
        "repositoryType": type,
        "searchById": false,
        "search": textToSearch
    };
    return apiHandler.fetch(apiUrls.fileCabinet.searchItems, apiHandler.POST, data, OnSuccess, OnFailure);

    function OnSuccess(response) {
        var searchedCabinets = JSON.parse(response.getContentText());
        return searchedCabinets;
    }

    function OnFailure(response) {
        Logger.log("Entered  failed callback for search items: \r\n" + response);

        return "";
    }
}
