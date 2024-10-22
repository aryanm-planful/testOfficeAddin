
var parentForSelection;
function createDimensionMemberHierarchyTree() {
  var parentNode = [];
  Logger.log("creating tree for Dimension Member Parent");

  var active_cell = SpreadsheetApp.getActiveSheet().getActiveCell();
  var active_row = active_cell.getRow();
  var active_column = active_cell.getColumn();
  var cellLable = getCellLabel(active_row, active_column);
  var rangeWithDimensions = new Map(Object.entries(JSON.parse(guserProperties.getProperty("cellRangeMapsToDimension"))));

  var response ={
    data:""
  }
  if(active_cell.getDataValidation() == null || active_cell.getDataValidation() == undefined){
    response.data = null;
    return response;
  }
  else{  
    var activeSS = SpreadsheetApp.getActiveSpreadsheet();
    for (let [key, value] of rangeWithDimensions) {
      var range = activeSS.getRange(key);
      var startRow = range.getRow();
      var startColumn = range.getColumn();
      var endRow = range.getLastRow();
      var endColumn = range.getLastColumn();
      
      if((startRow <= active_row && startColumn <= active_column) && (endRow >= active_row && endColumn >= active_column)){
        if(value.maps.type == null || value.maps.type == undefined){
          response.data = null;
          return response;
        }
        if(startRow != endRow && startColumn == endColumn){
          guserProperties.setProperty("isRowDimension", true);
        }else{
          guserProperties.setProperty("isRowDimension", false);
        }
        var dimensionName = value.rootMember;
        var miniDimensionName = dimensionName + "_Children";
        var node = {
          id: dimensionName, parent: '#',
          text: dimensionName,
          data: {
            "dimension": value.maps.dimension,
            "display": value.maps.display,
            "filter": "children",
            "model": value.maps.model,
            "isApiCalled": false
          }
        };
        var node2 = {
          id: miniDimensionName, parent: dimensionName,
          text: '<i class="fa fa-spinner fa-spin"></i>'
        }
        parentNode.push(node);
        parentNode.push(node2);

        response.cellLable = cellLable;
        response.openedDocumentName = value.openedDocumentName;
        response.selectedDimension = dimensionName;
        response.data =parentNode;
        return response;
      }
    }
    response.data = null;
    return response;
  }
}



function getDimensionMembersForParent(id, cellData) {

  var payload = {
    "dimension": cellData.dimension,
    "display": cellData.display,
    "filter": "children",
    "member": id,
    "model": cellData.model
  }
  var response = apiHandler.fetch(apiUrls.views.adhoc.members, apiHandler.POST, payload, OnDimensionMemberSuccessResponse, OnDimensionMemberFailureResponse);

  return response;
}



function searchDimensionMember(cellDataPayload, searchInput) {
  var payload = {
    "dimension": cellDataPayload.dimension,
    "display": cellDataPayload.display,
    "filter": "contains",
    "member": "",
    "model": cellDataPayload.model,
    "search": searchInput
  }
  var response = apiHandler.fetch(apiUrls.views.adhoc.memberSearch, apiHandler.POST, payload, OnDimensionMemberSuccessResponse, OnDimensionMemberFailureResponse);
   if(response.code == 200){
    response.data = addSearchedDataToTree(response.data);
  }
  return response;
}

function addSearchedDataToTree(data) {
  var seachedTreeData=[];
  data.map(function (each) {
    var node = {
      id: each.code, parent: '#',
      text: each.code,
      data: {
        "lineage": each.lineage
      }
    }
    seachedTreeData.push(node);
  });
  return seachedTreeData;
}

function updateTheDropdownValueInCell(val , indentationLength) {
  var activeSS = SpreadsheetApp.getActiveSpreadsheet();
  var isIndentationRequired = guserProperties.getProperty("isIndentationApplied");
  var activeCell = SpreadsheetApp.getActiveSheet().getActiveCell();
  var isRowDimension = guserProperties.getProperty("isRowDimension");
  
  var active_row = activeCell.getRow();
  var active_column = activeCell.getColumn();
  var cellLable = getCellLabel(active_row, active_column);

  if (activeCell.getDataValidations !== null) {
    var rule = activeCell.getDataValidation();
      if (rule != null) {
          var criteria = rule.getCriteriaType();
          var criteriaValues = rule.getCriteriaValues();
          var dropdownValues = criteriaValues[0];

          if(!dropdownValues.includes(val) && criteria == "VALUE_IN_LIST"){
            if(dropdownValues.length >= 500){
              dropdownValues = dropdownValues.slice(0,-1);
            }
            dropdownValues = [...dropdownValues, val];
            CreateCellList(cellLable, dropdownValues, activeSS, 500);
          }
      }
  }

  if ((isIndentationRequired && JSON.parse(isIndentationRequired)) && (isRowDimension && JSON.parse(isRowDimension)))
  {
    let space = String.fromCharCode(160).repeat(2);
    activeCell.setValue("\'"  + (space.repeat( (indentationLength - 1) ) + val));
  }else{
    activeCell.setValue("\'" + val);
  }
}


function OnDimensionMemberSuccessResponse(response) {
  Logger.log("Entered OnReportSuccessResponse success callback");
  var uiResponse = {};

  const responseCode = response.getResponseCode();
  uiResponse.code = responseCode;

  if (200 == responseCode) {
    var json_reponse = response.getContentText();
    json_reponse = JSON.parse(json_reponse);
    uiResponse.data = json_reponse;
  }
  else {
    var msg = JSON.parse(response.getContentText());
    uiResponse.errorMessage = msg.message;
  }
  return uiResponse;
}

function OnDimensionMemberFailureResponse(response) {
  Logger.log("Entered OnReportFailureResponse failed callback: \r\n" + response);
  SpreadsheetApp.getActiveSpreadsheet().toast(response.message, "Error:");
  return "";
}
