function gsGetRecentViews() {
    Logger.log("Executing gsGetRecentViews");

    var data = {
        'mode': 'run',
        'parentId': 'FileCabinet_Recent_ID',
        'repositoryType': 'adhoc',
    };

    return apiHandler.fetch(apiUrls.fileCabinet.getItems, apiHandler.POST, data, OnSuccess, OnFailure);

    function OnSuccess(response) {
        Logger.log("Entered gsGetRecentViews success callback");
        return response.getContentText();
    }

    function OnFailure(response) {
        Logger.log("Entered gsGetRecentViews failed callback: \r\n" + response);

        return "";
    }
}

function setTypeOfAnalyzeViewToOpen(typeOfAnalyze) {
    guserProperties.setProperty("typeOfAnalyzeViewToOpen", typeOfAnalyze);
}

function gsOpenAnalyzeView(id, text, models, typeOfAnalyze) {
    guserProperties.setProperty("typeOfAnalyzeViewToOpen", typeOfAnalyze);
    Logger.log("Entered gsOpenView, selectedView: " + text);
    var data = {
        "id": id,
        "name": text,
        "params": {
            "models": models
        }
    };
    var response = null;
    if (typeOfAnalyze === appConstants.ADHOC_VIEW) {
        response = apiHandler.fetch(apiUrls.views.adhoc.open, apiHandler.POST, data, OnAdhocViewSuccessResponse, OnAdhocViewFailureResponse);
    }
    else if (typeOfAnalyze === appConstants.ESM_VIEW) {
        response = apiHandler.fetch(apiUrls.views.esm.open, apiHandler.POST, data, OnAdhocViewSuccessResponse, OnAdhocViewFailureResponse);
    }
    response.type = typeOfAnalyze;
    return response;
}


function getPayloadDataForViewRefresh(parsedData) {
    let viewRanges = {}
    let type = ""
   
    if (parsedData.state.source.options !== null && parsedData.state.source.options !== undefined) {
        viewRanges = ReadfromSheetAndUpdateRange(parsedData, parsedData.state.source.options.indent);
        type = appConstants.ADHOC_VIEW

    } else {
        viewRanges = ReadfromSheetAndUpdateRange(parsedData, false);
        type = appConstants.ESM_VIEW
    }

    let data = {
        'id': parsedData["id"],
        'params': {},
        'state': parsedData["state"],
        'options': parsedData["options"],
        'ranges': viewRanges
    };

    return  { data, type }

}

function gsRefreshView(parsedData) {
    Logger.log("Entered gsRefreshView");
    var response;
    if (parsedData.state.source.options !== null && parsedData.state.source.options !== undefined) {
        var viewRanges = ReadfromSheetAndUpdateRange(parsedData, parsedData.state.source.options.indent);
        var data = {
            'id': parsedData["id"],
            'params': {},
            'state': parsedData["state"],
            'options': parsedData["options"],
            'ranges': viewRanges
        };
        response = apiHandler.fetch(apiUrls.views.adhoc.refresh, apiHandler.POST, data, OnAdhocViewSuccessResponse, OnAdhocViewFailureResponse);

    } else {
        var viewRanges = parsedData["ranges"];
        var data = {
            'id': parsedData["id"],
            'params': {},
            'state': parsedData["state"],
            'options': parsedData["options"],
            'ranges': viewRanges
        };
        response = apiHandler.fetch(apiUrls.views.esm.refresh, apiHandler.POST, data, OnAdhocViewSuccessResponse, OnAdhocViewFailureResponse);

    }

    return response;
}

function gsGetCommonInputParamsForZoom(parsedData) {
    var sheet = SpreadsheetApp.getActiveSpreadsheet();
    var cols = sheet.getActiveCell().getColumn();
    var rows = sheet.getActiveCell().getRow();

    var data = {
        'id': parsedData["id"],
        'params': {
            '{SELECTED_CELL}': {
                'C': cols,
                'R': rows
            }
        },
        'state': parsedData["state"],
        'options': parsedData["options"],
        'ranges': parsedData["ranges"]
    };

    return data;
}

function getActivelCellRowColNum() {

    var sheet = SpreadsheetApp.getActiveSpreadsheet();
    var cols = sheet.getActiveCell().getColumn();
    var rows = sheet.getActiveCell().getRow();
    var data ={
        colNum:cols,
        rowNum: rows
    }

    return data;
    
}
function gsGetCommonInputParamsForKeepRemove(parsedData) {
    var sheet = SpreadsheetApp.getActiveSpreadsheet();
    var ranges = sheet.getActiveRangeList().getRanges();
    var range = ranges[0];
    const startRow = range.getRow();
    const endRow = startRow + range.getNumRows() - 1;
    const startColumn = range.getColumn();
    const endColumn = startColumn + range.getNumColumns() - 1;
    const selectedCells = []
    for (var r = startRow; r <= endRow; r++) {
        for (var c = startColumn; c <= endColumn; c++) {
            selectedCells.push({ 'C': c, 'R': r });
        }
    }

    var data = {
        'id': parsedData["id"],
        'params': {
            '{MULTIPLE_SELECTED_CELLS}': selectedCells
        },
        'state': parsedData["state"],
        'options': parsedData["options"],
        'ranges': parsedData["ranges"]
    };
    return data;
}

function gsGetCommonInputParams(parsedData) {
    var data = {
        'id': parsedData["id"],
        'params': {},
        'state': parsedData["state"],
        'options': parsedData["options"],
        'ranges': parsedData["ranges"]
    };
    return data;
}

function gsZoomOutParentLevel(activeAdhocViewData) {
    var data = gsGetCommonInputParamsForZoom(activeAdhocViewData);
    var response = apiHandler.fetch(apiUrls.views.adhoc.zoomOut, apiHandler.POST, data, OnAdhocViewSuccessResponse, OnAdhocViewFailureResponse);
    return response;
}

function gsZoomOutTopLevel(activeAdhocViewData) {
    var data = gsGetCommonInputParamsForZoom(activeAdhocViewData);
    data.params.zoomOptions = {};
    data.params.zoomOptions.parentRetention = "top";
    data.params.zoomOptions.symmetric = true;
    data.params.zoomOptions.zoomType = "root";

    var response = apiHandler.fetch(apiUrls.views.adhoc.zoomOutEnhanced, apiHandler.POST, data, OnAdhocViewSuccessResponse, OnAdhocViewFailureResponse);
    return response;
}

function gsZoomInChildren(activeAdhocViewData) {
    var data = gsGetCommonInputParamsForZoom(activeAdhocViewData);
    var response = apiHandler.fetch(apiUrls.views.adhoc.zoomIn, apiHandler.POST, data, OnAdhocViewSuccessResponse, OnAdhocViewFailureResponse);
    return response;
}

function gsZoomInAllChildren(activeAdhocViewData) {
    var data = gsGetCommonInputParamsForZoom(activeAdhocViewData);
    var response = apiHandler.fetch(apiUrls.views.adhoc.zoomInAll, apiHandler.POST, data, OnAdhocViewSuccessResponse, OnAdhocViewFailureResponse);
    return response;
}

function gsZoomInDataLeaves(activeAdhocViewData) {
    var data = gsGetCommonInputParamsForZoom(activeAdhocViewData);
    var response = apiHandler.fetch(apiUrls.views.adhoc.zoomInDataLeaves, apiHandler.POST, data, OnAdhocViewSuccessResponse, OnAdhocViewFailureResponse);
    return response;
}

function gsZoomInLeaves(activeAdhocViewData) {
    var data = gsGetCommonInputParamsForZoom(activeAdhocViewData);
    var response = apiHandler.fetch(apiUrls.views.adhoc.zoomInBottom, apiHandler.POST, data, OnAdhocViewSuccessResponse, OnAdhocViewFailureResponse);
    return response;
}

function gsPivotToRow(parsedData) {
    var sheet = SpreadsheetApp.getActiveSpreadsheet();
    var cols = sheet.getActiveCell().getColumn();
    var rows = sheet.getActiveCell().getRow();

    var data = {
        'id': parsedData["id"],
        'params': {
            '{AXIS}': 'Row',
            '{SELECTED_CELL}': {
                'C': cols,
                'R': rows
            }
        },
        'state': parsedData["state"],
        'options': parsedData["options"],
        'ranges': parsedData["ranges"]
    };

    var response = apiHandler.fetch(apiUrls.views.adhoc.pivot, apiHandler.POST, data, OnAdhocViewSuccessResponse, OnAdhocViewFailureResponse);
    return response;
}

function gsPivotToColumn(parsedData) {
    var sheet = SpreadsheetApp.getActiveSpreadsheet();
    var cols = sheet.getActiveCell().getColumn();
    var rows = sheet.getActiveCell().getRow();

    var data = {
        'id': parsedData["id"],
        'params': {
            '{AXIS}': 'Column',
            '{SELECTED_CELL}': {
                'C': cols,
                'R': rows
            }
        },
        'state': parsedData["state"],
        'options': parsedData["options"],
        'ranges': parsedData["ranges"]
    };

    var response = apiHandler.fetch(apiUrls.views.adhoc.pivot, apiHandler.POST, data, OnAdhocViewSuccessResponse, OnAdhocViewFailureResponse);
    return response;
}

function gsPivotToPage(parsedData) {
    var sheet = SpreadsheetApp.getActiveSpreadsheet();
    var cols = sheet.getActiveCell().getColumn();
    var rows = sheet.getActiveCell().getRow();

    var data = {
        'id': parsedData["id"],
        'params': {
            '{AXIS}': 'Page',
            '{SELECTED_CELL}': {
                'C': cols,
                'R': rows
            }
        },
        'state': parsedData["state"],
        'options': parsedData["options"],
        'ranges': parsedData["ranges"]
    };

    var response = apiHandler.fetch(apiUrls.views.adhoc.pivot, apiHandler.POST, data, OnAdhocViewSuccessResponse, OnAdhocViewFailureResponse);
    return response;
}

function gsPivot(parsedData) {
    var data = {
        'id': parsedData["id"],
        'params': {
        },
        'state': parsedData["state"],
        'options': parsedData["options"],
        'ranges': parsedData["ranges"]
    };

    var response = apiHandler.fetch(apiUrls.views.adhoc.pivot, apiHandler.POST, data, OnAdhocViewSuccessResponse, OnAdhocViewFailureResponse);
    return response;
}

function gsKeepOnly(activeAdhocViewData) {
    var data = gsGetCommonInputParamsForKeepRemove(activeAdhocViewData);
    var response = apiHandler.fetch(apiUrls.views.adhoc.keepOnly, apiHandler.POST, data, OnAdhocViewSuccessResponse, OnAdhocViewFailureResponse);
    return response;
}

function gsRemoveOnly(activeAdhocViewData) {
    var data = gsGetCommonInputParamsForKeepRemove(activeAdhocViewData);
    var response = apiHandler.fetch(apiUrls.views.adhoc.removeOnly, apiHandler.POST, data, OnAdhocViewSuccessResponse, OnAdhocViewFailureResponse);
    return response;
}

function gsSuppressRow(activeAdhocViewData, suppressOption) {
    var data = gsGetCommonInputParams(activeAdhocViewData);
    data.options.runtimeDisplayOptions.suppressRows = suppressOption;

    var response = apiHandler.fetch(apiUrls.views.adhoc.refresh, apiHandler.POST, data, OnAdhocViewSuccessResponse, OnAdhocViewFailureResponse);
    return response;
}

function gsSuppressColumn(activeAdhocViewData, suppressOption) {
    var data = gsGetCommonInputParams(activeAdhocViewData);
    data.options.runtimeDisplayOptions.suppressColumns = suppressOption;

    var response = apiHandler.fetch(apiUrls.views.adhoc.refresh, apiHandler.POST, data, OnAdhocViewSuccessResponse, OnAdhocViewFailureResponse);
    return response;
}

function gsIndentRow(activeAdhocViewData, indentOption) {
    var data = gsGetCommonInputParams(activeAdhocViewData);
    data.options.runtimeDisplayOptions.indent = indentOption;

    var response = apiHandler.fetch(apiUrls.views.adhoc.refresh, apiHandler.POST, data, OnAdhocViewSuccessResponse, OnAdhocViewFailureResponse);
    return response;
}

function gsApplyDisplay(activeAdhocViewData, option) {
    var data = gsGetCommonInputParams(activeAdhocViewData);

    let dOption = (option === 1) ? "name" : "code";

    data.options.display = dOption;
    data.options.runtimeDisplayOptions.displayOption = option;

    data.ranges.forEach(function (cellData) {
        var type = cellData.type;
        if (type == appConstants.RANGE_TYPE_DROPDOWN) {
            cellData.maps.display = dOption;
        }
    });

    var response = apiHandler.fetch(apiUrls.views.adhoc.refresh, apiHandler.POST, data, OnAdhocViewSuccessResponse, OnAdhocViewFailureResponse);
    return response;
}

function gsApplyNumFormat(activeAdhocViewData, format) {
    var data = gsGetCommonInputParams(activeAdhocViewData);

    data.options.runtimeDisplayOptions.format = format;

    var response = apiHandler.fetch(apiUrls.views.adhoc.refresh, apiHandler.POST, data, OnAdhocViewSuccessResponse, OnAdhocViewFailureResponse);
    return response;
}

function GetViewName(parsedData) {
    if (parsedData.state.source.properties.name === undefined || parsedData.state.source.properties.name === null) {
        parsedData.state.source.properties.name = "Default";
    }
    return parsedData.state.source.properties.name;
}

function ReadfromSheetAndUpdateRange(parsedData, isIndentPresent) {
    var activeSS = SpreadsheetApp.getActiveSpreadsheet();
    //  var valueRange = activeSS.getRange('A1:C4').getValues();
    //activeSS.getRange('E1:G4').setValues(valueRange);
    //activeSS.getRange('I1:K3').setValues([['A', 'B', 'C'], ['E', 'F', 'G'], ['H', 'I', 'J']]);
    var viewRanges = parsedData['ranges'];
    for (var i = 0; i < viewRanges.length; i++) {
        var colCount = viewRanges[i].endColumn - viewRanges[i].startColumn + 1;
        var rowCount = viewRanges[i].endRow - viewRanges[i].startRow + 1;
        var startColumn = viewRanges[i].startColumn;
        var startRow = viewRanges[i].startRow;
        var values = viewRanges[i].values;
        var type = viewRanges[i].type;

        if (type == appConstants.RANGE_TYPE_FIXED || type == appConstants.RANGE_DYNAMIC_ROW || type == appConstants.RANGE_DYNAMIC_COLUMN || type == appConstants.RANGE_TYPE_FLOATING_ROW) {
            var cellLable1 = getCellLabel(startRow, startColumn);
            var cellLable2 = getCellLabel(startRow + rowCount - 1, startColumn + colCount - 1);

            var cellRange = `${cellLable1}:${cellLable2}`;

            var range = activeSS.getRange(cellRange);
            var newValues = range.getDisplayValues();
            if (isIndentPresent) {
                var newIndentedVal = [];
                newValues.map(function (each) {
                    var miniVal = [];
                    each.map(function (params) {
                        miniVal.push(params.trim());
                    });
                    newIndentedVal.push(miniVal);
                });
                newValues = newIndentedVal
            }
            var arr1d = [].concat(...newValues);

            viewRanges[i].values = arr1d;
        }
        else if( type == appConstants.RANGE_TYPE_DROPDOWN){
          
            var cellLable1 = getCellLabel(startRow, startColumn);
            var cellLable2 = getCellLabel(startRow + rowCount - 1, startColumn + colCount - 1);
            var cellRange = `${cellLable1}:${cellLable2}`;
            var range = activeSS.getRange(cellRange);
            var newValues = range.getValue();
            var array =  newValues.split(',');
          
            if(array.length > 1){
                var mapsSelectionArrayVal = [];
                for(let i=0;i<array.length ; i++){
                    mapsSelectionArrayVal.push({
                        "member": array[i]
                    });
                }
                viewRanges[i].maps.selection = mapsSelectionArrayVal;
            }else{
                viewRanges[i].maps.selection =  [
                  {
                      "member": range.getValue()
                  }
                ];
            }
        }
    }

    return viewRanges;
}

function PopulateGridForAdhocView(parsedData) {
    typeOfAnalyzeViewToOpen =  appConstants.ADHOC_VIEW;
    return new Promise(function(resolve, reject){
        Excel.run(function(context) {
            try {
                //var context =   Office.context;
                var activeWorkbook = context.workbook;
                var activeSS = activeWorkbook.worksheets.getActiveWorksheet();

                var showUpdateSelectionBtn = false;
                //const typeOfAnalyzeViewToOpen = guserProperties.getProperty("typeOfAnalyzeViewToOpen");
                //createSpotlightSheet(appConstants.ANALYZE_SHEET);

                var openedDocName = parsedData.state.source.properties.name;
                if (openedDocName === undefined || openedDocName === null) {
                    openedDocName = "Default";
                }
                var rangeMapDimension = new Map();
     
                var viewRanges = parsedData["ranges"];
                var formatRange = [];
      
                viewRanges.forEach(function (cellData) {
                    try{

                        var colCount = cellData.endColumn - cellData.startColumn + 1;
                        var rowCount = cellData.endRow - cellData.startRow + 1;
                        var startColumn = cellData.startColumn;
                        var startRow = cellData.startRow;
                        var values = cellData.values;
                        var type = cellData.type;

                        var sheetCellVal = [];

                        if (type == appConstants.RANGE_TYPE_FIXED || type == appConstants.RANGE_DYNAMIC_ROW || type == appConstants.RANGE_DYNAMIC_COLUMN || type == appConstants.RANGE_TYPE_FLOATING_ROW) {
                            var fillByCol = colCount > 1;
                            for (var j = 0; j < values.length; j++) {
                                var sValue ='\'' + values[j];
                                if (fillByCol) {
                                    sheetCellVal.push(sValue);
                                }
                                else {
                                    var larray = [];
                                    larray.push(sValue);
                                    sheetCellVal.push(larray);
                                }
                            }

                            var cellLable1 = getCellLabel(startRow, startColumn);
                            var cellLable2 = getCellLabel(startRow + rowCount - 1, startColumn + colCount - 1);

                            var cellRange = `${cellLable1}:${cellLable2}`;
                        

                            var range = activeSS.getRange(cellRange);
                            if (typeOfAnalyzeViewToOpen == appConstants.ADHOC_VIEW && type == appConstants.RANGE_TYPE_FIXED) {
                                range.values = sheetCellVal;
                            }
                            else if (typeOfAnalyzeViewToOpen == appConstants.ESM_VIEW && type == appConstants.RANGE_TYPE_FIXED) {
                                range.values = sheetCellVal;
                            }
                            else if (type == appConstants.RANGE_DYNAMIC_COLUMN) {
                                range.values = [sheetCellVal];

                            }
                            else if (type == appConstants.RANGE_DYNAMIC_ROW || type == appConstants.RANGE_TYPE_FLOATING_ROW) {
                                range.values = sheetCellVal;
                            }
                        }
                        else if (typeOfAnalyzeViewToOpen == appConstants.ADHOC_VIEW && type == appConstants.RANGE_TYPE_DYNAMIC_GRID) {
                            const rows = rowCount;
                            const cols = colCount;

                            const nestedArray = Array.from({ length: rows }, () =>
                                Array.from({ length: cols }, () => '')
                            );

                            var k = 0;
                            for (var i = 0; i < rows; i++) {
                                for (var j = 0; j < cols; j++) {
                                    nestedArray[i][j] = values[k];
                                    k++;
                                }
                            }

                            var cellLable1 = getCellLabel(startRow, startColumn);
                            var cellLable2 = getCellLabel(startRow + rowCount - 1, startColumn + colCount - 1);


                            var cellRange = `${cellLable1}:${cellLable2}`;

                            var range = activeSS.getRange(cellRange);
                            range.values = nestedArray;
                            // activeSS.getRange(cellRange).setValues(nestedArray);

                        }
                        else if (type == appConstants.RANGE_TYPE_DROPDOWN) {
                            var cellLable1 = getCellLabel(startRow, startColumn);
                            var cellLable2 = getCellLabel(startRow + rowCount - 1, startColumn + colCount - 1);
                            var cellRangeLabel = `${cellLable1}:${cellLable2}`;
                            var selectionMapVal = "";
                            var node = {
                                openedDocumentName: openedDocName,
                                rootMember: cellData.maps.dimension,
                                maps: cellData.maps
                            }
                            var range = activeSS.getRange(cellRangeLabel);
                            if(cellData.startRow == cellData.endRow && cellData.startColumn == cellData.endColumn){
                                cellData.maps.selection.map((m)=> 
                                    selectionMapVal == "" ? selectionMapVal = selectionMapVal + m.member : 
                                    selectionMapVal = selectionMapVal+ " , " + m.member);
                                selectionMapVal = "\'" + selectionMapVal ;
                                range= activeSS.getRange(cellRangeLabel);
                                range.values= [[selectionMapVal]];
                    
                            }
                
                            var key = cellLable1 + ":" + cellLable2;
                            if(Array.isArray(values) && values.length > 0) {
                                node.rootMember = values[0];
                                values = values.map(x => (x) )
                            }else if(Array.isArray(values) && values.length == 0) {
                                values.push(activeSS.getRange(cellRangeLabel).getValue());
                            }

                            range.dataValidation.clear();
                            range.dataValidation.rule = {
                                list: {
                                    inCellDropDown: true,
                                    source: values.map(function(value) { return "\'"  + value; }).join(",")
                                }
                            };
                            range.dataValidation.errorTitle = "Invalid Value";
                            range.dataValidation.errorMessage = "Please select a value from the dropdown list.";
                            range.dataValidation.errorStyle = "stop";
      
                            range.format.autofitColumns();
                            range.format.autofitRows();

            
                            rangeMapDimension.set(key, node);

                            //CreateCellList(cellRangeLabel,values,activeSS, 400,selectionMapVal);            
            
                            if(cellData.maps.type != null && cellData.maps.type != undefined){
                                showUpdateSelectionBtn = true;
                            }
                        }
                        else if (type == appConstants.RANGE_TYPE_FORMAT) {
                            formatRange.push(cellData);
                        }
                    }
                    catch (err) {
                        console.log(err.message);
                    }
                })

                RenderAnalyzeFormat(formatRange, activeSS);
                //SheetWrapStrategy();
            }
            catch (err) {
                console.log(err.message);
            }

            return context.sync().then(function() {
                resolve("Range updated successfully");
            }).catch(function(error) {
                reject("Error updating range: " + error.message);
            });
        });
    });
   
}

function setRowColumnDimension(dimension, activeSS,[range, startIndex], valueInPx) {
    /*
    * We cannot set any dimension to "0px" in sheet as it will not be able to render in DOM 
    and throws Exception. 
    Hence we use hideRow/hideColumn Actions to achieve the same results
    */
       
    if(dimension === "height"){
        if(valueInPx <= 0) {
            activeSS.hideRow(range)
        }else {
            activeSS.setRowHeight(startIndex, valueInPx);
        }

    }else if(dimension === "width") {
        if(valueInPx <= 0) {
            activeSS.hideColumn(range)
        }else {
            activeSS.setColumnWidth(startIndex, valueInPx);
        }
    }

}


    function RenderAnalyzeFormat(formatRange, activeSheet) {
        var isIndentationApplied = false;
        if (formatRange == null)
            return;

        var activeSS = activeSheet;

        formatRange.forEach(function (cellData) {
            var cellLoc = getRowColCount(cellData);

            var colCount = cellLoc.colCount;
            var rowCount = cellLoc.rowCount;
            var startColumn = cellData.startColumn;
            var startRow = cellData.startRow;

            var cellLable1 = getCellLabel(startRow, startColumn);
            var cellLable2 = getCellLabel(startRow + rowCount - 1, startColumn + colCount - 1);
            var cellRange = `${cellLable1}:${cellLable2}`;

            var format_map = cellData.maps;

            // Logger.log("FormatInfo:" + format_map);

            var applyRange = activeSS.getRange(cellRange);
            if (format_map.hasOwnProperty('background_long')) {
                setBgLongToHex(applyRange, format_map.background_long);
            }
            if (format_map.hasOwnProperty('width')) {       
                const widthInPx = (7 * parseInt(format_map.width) + 5)
                //setRowColumnDimension('width', activeSS, [applyRange, startColumn], widthInPx)
                range.format.columnWidth = widthInPx;
            }
            if (format_map.hasOwnProperty('bold')) {
                if (format_map.bold) {
                    applyRange.setFontWeight("bold");
                }
            }
           
            applyNumberFormat(applyRange, format_map);
        })
  
        guserProperties.setProperty("isIndentationApplied", isIndentationApplied);
    }

    function SheetWrapStrategy() {
        var activeSS = SpreadsheetApp.getActiveSpreadsheet();
        activeSS.getDataRange().setWrapStrategy(SpreadsheetApp.WrapStrategy.OVERFLOW);
    }

    function OnAdhocViewFailureResponse(response) {
        Logger.log("Entered OnAdhocViewFailureResponse failed callback: \r\n" + response);
        const responseCode = response.getResponseCode();
        return { responseCode, errorMessage: msg.message }
    }

    function OnAdhocViewSuccessResponse(response) {
        var uiResponse = {};

        Logger.log("Entered OnAdhocViewSuccessResponse success callback");
        const responseCode = response.getResponseCode();

        uiResponse.code = responseCode;
        if (responseCode === 200) {
            var data = response.getContentText();
            var parsedData = JSON.parse(data);
            PopulateGridForAdhocView(parsedData);
            uiResponse.output = parsedData;
        }
        else {
            var msg = JSON.parse(response.getContentText());
            uiResponse.errorMessage = msg.message;
        }

        return uiResponse;
    }