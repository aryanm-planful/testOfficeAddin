const RANGE_TYPE_DYNAMIC_GRID = "DYNAMIC_GRID";
const RANGE_TYPE_FIXED = "FIXED";
const RANGE_TYPE_DYNAMIC_COLUMN = "DYNAMIC_COLUMN";
const RANGE_TYPE_DYNAMIC_ROW = "DYNAMIC_ROW";
const RANGE_MAPKEY_DROPDOWN_DIMENSION = "dimension";
const RANGE_TYPE_DROPDOWN = "DROPDOWN";
function CaptureAdhocData() {
   var ss = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet()
    var data = guserProperties.getProperty(ss.getName());
    var parsedData = JSON.parse(data);
    Logger.log("ReadData from Adhoc: " + data);

    var model = parsedData.state.source.properties.model;
    Logger.log("ModelName: " + model);
    //returns array of dimensions
    var dimensions = getDimensionNames(model);
    var ranges = parsedData["ranges"];
    var outputInfo = [];
    // get data range from adhoc object
    for (var i = 0; i < ranges.length; i++) {
        var uiSourceRange = ranges[i];

        if (uiSourceRange.type == RANGE_TYPE_DYNAMIC_GRID ||
            (uiSourceRange.type == RANGE_TYPE_FIXED && uiSourceRange.dimension != undefined) ||
            uiSourceRange.type == RANGE_TYPE_DYNAMIC_COLUMN ||
            uiSourceRange.type == RANGE_TYPE_DYNAMIC_ROW) {
            var cellInfo = extractCellFormulas(uiSourceRange, parsedData, model, dimensions);
            pasteCellFormulas(uiSourceRange.startRow, uiSourceRange.startColumn, cellInfo);
          
          
            var cellData = {};
            cellData.startRow = uiSourceRange.startRow;
            cellData.startColumn = uiSourceRange.startColumn;
            cellData.oCellFormulas = cellInfo;

            outputInfo.push(cellData);
        }
    }


    // var savedData = JSON.stringify(outputInfo);
    //Logger.log("Saving data: " + savedData);

    // var savedData = JSON.stringify(parsedData);
    //userProperties.setProperty('getOpenedView', savedData);

    //Logger.log("Saving data: " + savedData);
}

function extractCellFormulas(oSourceRange, reportObject, modelName, dimensions)
{
    let oCellFormulas = {};
    oCellFormulas.m_arFormulas = [];
    oCellFormulas.m_iColumnCount = ((oSourceRange.endColumn - oSourceRange.startColumn) + 1);
    let sDisplayOption = "code";
    let dimensionRanges = {}
    let sDimension = oSourceRange.dimension;

    Logger.log("SDimension: " + sDimension + "\r\n" + "Type: " + oSourceRange.type);
   
    // Warning!!! Lambda constructs are not supported
    switch (oSourceRange.type) {
        case RANGE_TYPE_DYNAMIC_GRID:
            let dimensionRanges = {};
            for(var i=0;i<reportObject.ranges.length;i++){
                var range = reportObject.ranges[i];
                if (dimensions.indexOf(range.dimension) > -1) {
                    var rangeInfo = {};
                    rangeInfo.m_oFixedRange = range;
                    rangeInfo.m_oDropdownRange = null;
                    
                    var sDimension1 = range.dimension;
                    dimensionRanges[sDimension1] =  rangeInfo;
                }
            }

            Logger.log("DIMCHECK: " + JSON.stringify(dimensionRanges));

            for(var i=0;i<reportObject.ranges.length;i++){
                var range = reportObject.ranges[i];
                if(range.type == RANGE_TYPE_DROPDOWN && 
                   range.maps != undefined && 
                   range.maps[RANGE_MAPKEY_DROPDOWN_DIMENSION] != undefined){
                    if (dimensions.indexOf(range.maps[RANGE_MAPKEY_DROPDOWN_DIMENSION]) > -1){
                        var ddDimension = range.maps[RANGE_MAPKEY_DROPDOWN_DIMENSION];
                        dimensionRanges[ddDimension].m_oDropdownRange =  range;
                    }
                }
            }

            Logger.log("Length: " + dimensionRanges.length + "\r\n" + "DIMCHECK2: " + JSON.stringify(dimensionRanges));

            for (var currentRow = oSourceRange.startRow; currentRow <= oSourceRange.endRow; currentRow++) {
                for (var currentColumn = oSourceRange.startColumn; currentColumn <= oSourceRange.endColumn; currentColumn++) {
                    //  get neon cell formula
                    //  fixed range is POV
                    //  find member for row and column range base on row and column values
                    let oDataPoint = {};
                    oDataPoint.model = modelName;
                    oDataPoint.type =  "@Data";
                    oDataPoint.display = sDisplayOption;
                    oDataPoint.members = [];

                    for (var key of Object.keys(dimensionRanges)) {
                        Logger.log(key + " -> " + dimensionRanges[key])
                    }

                    for (var key of Object.keys(dimensionRanges)) {
                        let oDimInfo = dimensionRanges[key];
                        let sMember = "";
                        if (oDimInfo.m_oFixedRange.type ==  RANGE_TYPE_FIXED) {
                              sMember = oDimInfo.m_oFixedRange.values[0];
                        }
                        else if (((oDimInfo.m_oFixedRange.startRow <= currentRow)
                            && (currentRow <= oDimInfo.m_oFixedRange.endRow))) {
                            sMember = oDimInfo.m_oFixedRange.values[(currentRow - oDimInfo.m_oFixedRange.startRow)];
                        }
                        else if (((oDimInfo.m_oFixedRange.startColumn <= currentColumn)
                            && (currentColumn <= oDimInfo.m_oFixedRange.endColumn))) {
                            sMember = oDimInfo.m_oFixedRange.values[(currentColumn - oDimInfo.m_oFixedRange.startColumn)];
                        }
                        //  else error
                         var memberObj = {};
                        memberObj[key] =  sMember;

                        oDataPoint.members.push(memberObj);
                    }

                    Logger.log("Data DataPoint :" + JSON.stringify(oDataPoint));

                    oCellFormulas.m_arFormulas.push(oDataPoint);
                }
            }
            break;
        case RANGE_TYPE_DYNAMIC_ROW:
        case RANGE_TYPE_DYNAMIC_COLUMN:
            for (var i=0; i< oSourceRange.values.length; i++) {
                let oDataPoint = {};
                oDataPoint.model = modelName;
                oDataPoint.type = "@Member";
                oDataPoint.display = sDisplayOption;
                var memberObj = {};
                memberObj[oSourceRange.dimension] =  oSourceRange.values[i];

                oDataPoint.members = [];
                oDataPoint.members.push(memberObj);

                oCellFormulas.m_arFormulas.push(oDataPoint);

                Logger.log("DataPoint :" + JSON.stringify(oDataPoint));
            }
            break;
        case RANGE_TYPE_FIXED:
            for (let iMember = 0; iMember < oSourceRange.values.length; iMember++) {
                let sMember = oSourceRange.values[iMember];
                let iCol = oSourceRange.startColumn;
                let iRow = (oSourceRange.startRow + iMember);
                var listDropdowns = [];
                for(var i=0;i<reportObject.ranges.length;i++){
                    var oRange = reportObject.ranges[i];
                    if(oRange.type == RANGE_TYPE_DROPDOWN  && oRange.startColumn == iCol && oRange.startRow == iRow)               {
                        listDropdowns.push(oRange);
                    }
                }
               
                let oDropdownRange = listDropdowns[0];
                
                let oDataPoint = {};
                oDataPoint.model = modelName;
                oDataPoint.type = "@POV";
                oDataPoint.display = sDisplayOption;
                var memberObj = {};
                memberObj[oSourceRange.dimension] = sMember;

                oDataPoint.members = [];
                oDataPoint.members.push(memberObj);

                Logger.log("DataPoint :" + JSON.stringify(oDataPoint));


                oCellFormulas.m_arFormulas.push(oDataPoint);
            }
            break;
    }
    Logger.log("CellFormulas Length: " + JSON.stringify(oCellFormulas.m_arFormulas));
    return oCellFormulas;
}

function getDimensionNames(model) {
    return GetModelDetails(model, null);
}


function GetModelDetails(modelName, createType) {
    const dimVal = new Map();

    var url = guserProperties.getProperty(userPropContants.API_URL) + 'api/modeldesigner/modelLight/' + modelName;
    //{"mode":"run","parentId":"","repositoryType":"adhoc"}
    /*    var data = {
            'mode': 'run',
            'parentId': 'FileCabinet_Recent_ID',
            'repositoryType': 'adhoc',
        };*/

    var op2 = {
        'method': 'get',
        'contentType': 'application/json',
        //'payload': JSON.stringify(data),
        "headers": {
            "X-AUTH-TOKEN": guserProperties.getProperty(userPropContants.AUTH_TOKEN),
            "X-CLIENT": "excel",
            "X-CLIENT-VERSION": m_xlComp,
            "Cookie": guserProperties.getProperty(userPropContants.COOKIE),
            "X-CSRF": guserProperties.getProperty(userPropContants.XCSRF)
        }
    };

    Logger.log(url);
    Logger.log(op2);
    var response = UrlFetchApp.fetch(url, op2);
    var data = response.getContentText();
    Logger.log(data);

    var parsedData = JSON.parse(data);
    var dimArr = parsedData["dimensionNames"];
    Logger.log("DimArr: " + dimArr);
    return dimArr;
}

function display(values, key) {
    Logger.log(values + " " + key + "<br>");
}

function getDimMember(modelName, dimValue) {
    var url = guserProperties.getProperty(userPropContants.API_URL) + 'api/ui/member/getMembers/';
    //{"mode":"run","parentId":"","repositoryType":"adhoc"}
    var data = {};
    data.dimension = dimValue;
    data.display = "name";
    data.filter = "default";
    data.model = modelName;
    Logger.log(data);

    var op2 = {
        'method': 'post',
        'contentType': 'application/json',
        'payload': JSON.stringify(data),
        "headers": {
            "X-AUTH-TOKEN": guserProperties.getProperty(userPropContants.AUTH_TOKEN),
            "X-CLIENT": "excel",
            "X-CLIENT-VERSION": m_xlComp,
            "Cookie": guserProperties.getProperty(userPropContants.COOKIE),
            "X-CSRF": guserProperties.getProperty(userPropContants.XCSRF)
        }
    };

    Logger.log(url);
    Logger.log(op2);
    var response = UrlFetchApp.fetch(url, op2);
    var data = response.getContentText();
    Logger.log("getDimMember:\r\n" + data);

    var parsedData = JSON.parse(data);
    var code = parsedData[0].code;

    Logger.log("code:\r\n" + code);
    return code;
}

function pasteCellFormulas(selectCellRow,selectCellColumn, oCellFormulas)
{
    var activeSS = SpreadsheetApp.getActiveSpreadsheet();

    var addRow = 0;
    var addColumn = 0;
    var iFormulaCount = oCellFormulas.m_arFormulas.length;
    for( var i = 0; i < iFormulaCount; i++ )
    {
        var cellLabel = getCellLabel(selectCellRow + addRow, selectCellColumn + addColumn);
        var cellRange = `${cellLabel}:${cellLabel}`;
        Logger.log("\r\ncellRange: " + cellRange);

        var range = activeSS.getRange(cellRange);

        var oNeonFormula = oCellFormulas.m_arFormulas[i];
        range.setNote(JSON.stringify(oNeonFormula));

        addColumn++;

        if( addColumn == oCellFormulas.m_iColumnCount )
        {
            addColumn = 0;
            addRow++;
        }
    }
}