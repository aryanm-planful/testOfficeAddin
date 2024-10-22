let support = {
  'c-4098': '3d-column',
  'c78': '3d-column',
  'c79': '3d-column',
  'c60': '3d-bar',
  'c61': '3d-bar', //3d Stacked Bar
  'c62': '3d-bar', //3d Stacked Percentage Bar
  'c-4100': '3d-column',
  'c54': '3d-column', // 3D Column Multi Series
  'c55': '3d-column', // 3d Stacked Column
  'c56': '3d-column', //3d Stacked Percentage Column
  'c-4101': '3d-line',
  'c-4102': '3d-pie',
  'c70': '3d-pie',
  'c1': '2d-area', //2d area multi series
  'c76': '2d-area', //2D Stacked Area
  'c77': '2d-area', //100% 2D Stacked Area
  'c57': '2d-bar', //2D Multi Series Bar
  'c71': '2d-pie',
  'c58': '2d-bar', //2D Stacked Bar
  'c59': '2d-bar', //2D Stacked Percentage Bar
  'c15': '2d-column',
  'c87': '2d-column',
  'c51': '2d-column', //2D Column Multi Series
  'c52': '2d-column', //2D Stacked Column
  'c53': '2d-column', //2D Stacked Percentage Column
  'c102': '2d-bar',
  'c103': '2d-bar',
  'c104': '2d-bar',
  'c105': '2d-column',
  'c99': '2d-column',
  'c100': '2d-column',
  'c101': '2d-column',
  'c95': '2d-bar',
  'c96': '2d-bar',
  'c97': '2d-bar',
  'c98': '2d-column',
  'c92': '2d-column',
  'c93': '2d-column',
  'c94': '2d-column',
  'c-4120': '2d-pie',
  'c80': '2d-column',
  'c4': '2d-line',
  'c65': '2d-line', //Line with markers
  'c66': '2d-line', //Stacked Line with markers
  'c67': '2d-line', //Stacked Line with markers
  'c63': '2d-line', //Stacked Line
  'c64': '2d-line', //Stacked Line
  'c5': '2d-pie',
  'c69': '2d-pie',
  'c68': '2d-pie',
  'c109': '2d-bar',
  'c110': '2d-bar',
  'c111': '2d-bar',
  'c112': '2d-column',
  'c106': '2d-column',
  'c107': '2d-column',
  'c108': '2d-column',
  'c-4151': '2d-column',
  'c82': '2d-column',
  'c81': '2d-column',
  'c88': '2d-column',
  'c89': '2d-column',
  'c90': '2d-column',
  'c91': '2d-column',
  'c83': '2d-column',
  'c85': '2d-column',
  'c86': '2d-column',
  'c84': '2d-column',
  'c-4169': '2d-scatter',
  'c74': '2d-column',
  'c75': '2d-column',
  'c72': '2d-column',
  'c73': '2d-column',
  'ccolumn': '2d-column',
  'cbar': '2d-bar',
  'cline': '2d-line',
  'cpie': '2d-pie'
};

let pt2pxConverter = 1;

function gsOpenReport(id, text, typeOfReport, pt2pxMultiplier) {
  pt2pxConverter = pt2pxMultiplier;
  var response = null;
  if (typeOfReport == appConstants.EXECUTIVE_REPORT) {
      var payload = {
          "id": id,
          "params": {
              "{SELECTED_DROPDOWNS}": {
                  "name": text
              }
          }
      }
      response = apiHandler.fetch(apiUrls.reports.open, apiHandler.POST, payload, OnReportSuccessResponse, OnReportFailureResponse);
  }
  else if (typeOfReport == appConstants.SNAPSHOT_REPORT) {
      var payload = {
          "params": {
              "snapshotId": id
          }
      }
      response = apiHandler.fetch(apiUrls.snapshot.open, apiHandler.POST, payload, OnReportSuccessResponse, OnReportFailureResponse);
  }
  response.typeOfReport = typeOfReport;
  return response;
}

function PopulateReportGridForUI(parsedData) {
  try {
      var openedDocName = parsedData.state.source.properties.name;
      if (openedDocName === undefined || openedDocName === null) {
          openedDocName = "Default";
      }

      var activeSS = SpreadsheetApp.getActiveSpreadsheet();
      var viewRanges = parsedData["ranges"];
      var chartRange = [], formatRange = [], globalRange = [];
      var rangeMapDimension = new Map();

      viewRanges.forEach(function (cellData) {
          var rowColCount = getRowColCount(cellData);
          var colCount = rowColCount.colCount;
          var rowCount = rowColCount.rowCount;

          var startColumn = cellData.startColumn;
          var startRow = cellData.startRow;
          var values = cellData.values;
          var type = cellData.type;
          if (type === appConstants.RANGE_TYPE_GLOBAL) {
              globalRange.push(cellData);
          }
          else if (type == appConstants.RANGE_TYPE_FIXED) {
            var cellLable1 = getCellLabel(startRow, startColumn);
            var cellLable2 = getCellLabel(startRow + rowCount - 1, startColumn + colCount - 1);
            var cellRange = `${cellLable1}:${cellLable2}`;
            var data_maps = cellData.maps;
            if(data_maps !== null && !cellData.maps.data){
                const formattedValues = values.map(value => ["\'"+value]);
                activeSS.getRange(cellRange).setValues(formattedValues);
            }
            else{
                const formattedValues = values.map(value => [value]);
                activeSS.getRange(cellRange).setValues(formattedValues);
            }
            
          }
          else if (type == appConstants.RANGE_TYPE_DROPDOWN) {
              var cellLable1 = getCellLabel(startRow, startColumn);
              var cellLable2 = getCellLabel(startRow + rowCount - 1, startColumn + colCount - 1);
              var cellRange = `${cellLable1}:${cellLable2}`;

              if(Array.isArray(values) && values.length > 0) {
                  var node = {
                    maps: cellData.maps,
                    rootMember: values[0],
                    openedDocumentName: openedDocName
                  }
                  var key = cellLable1 + ":" + cellLable2;
                  rangeMapDimension.set(key, node);
              }
              values = values.map(x => ("\'" + x) )
              CreateCellList(cellRange, values, activeSS, 400);
          }
          else if (type == appConstants.RANGE_TYPE_FORMAT) {
              formatRange.push(cellData);
          }
          else if (type == appConstants.RANGE_TYPE_CHART) {
              chartRange.push(cellData);
          }

      });
      
    return ({
        "globalRange": globalRange,
        "formatRange": formatRange,
        "chartRange": chartRange,
        "rangeMapDimensions": Object.fromEntries(rangeMapDimension)
    })
  }
  catch (err) {
      Logger.log("PopulateReportGridForUI:\r\n" + err.message);
      SpreadsheetApp.getActiveSpreadsheet().toast(err.message, "Error:");
  }
}

function ApplyRowColumnGroup_Charts_GlobalRange(globalRange , rangeMapDimensions , chartsRange) {
  guserProperties.setProperty("cellRangeMapsToDimension", rangeMapDimensions);
  if (chartsRange !== null && chartsRange.length > 0)
    RenderCharts(chartsRange);;
  if (globalRange === null || globalRange === undefined || globalRange.length <= 0)
  return;

  var globalRangeData = globalRange[0];
  var globalMaps = globalRangeData.maps;
  if (globalMaps=== undefined || globalMaps === null || globalMaps.length <= 0) 
    return;

  var pageSetupRowColumnGroups = globalMaps.pageSetupRowColumnGroups ;
  if (pageSetupRowColumnGroups=== undefined || pageSetupRowColumnGroups === null || pageSetupRowColumnGroups.length <= 0) 
    return;

  var rowColumnGroups = JSON.parse(pageSetupRowColumnGroups);
  var rowGroup = rowColumnGroups.m_mapRowGroups;
  var columnGroup = rowColumnGroups.m_mapColumnGroups;
  applyCellGrouping(rowGroup, appConstants.ROW);
  applyCellGrouping(columnGroup, appConstants.COLUMN);
}

function applyCellGrouping(groupData, type) {
  let levels = Object.keys(groupData),
    maxLevel = Math.max(...levels), i;

  var activeSS = SpreadsheetApp.getActiveSpreadsheet();
  var sh = activeSS.getActiveSheet();

  for (i = maxLevel; i >= 2; i--) {
      let curentLevel = groupData[i];

      if (Array.isArray(curentLevel)) {
          curentLevel.forEach(group => {
              if (type === appConstants.ROW) {
                  var cellLable1 = getCellLabel(group.m_iStart, 1);
                  var cellLable2 = getCellLabel(group.m_iEnd, 1);
                  var cellRange = `${cellLable1}:${cellLable2}`;
                  var applyRange = activeSS.getRange(cellRange);
                  applyRange.shiftRowGroupDepth(i - 1);
                  if (!group.m_bExpanded) {
                      applyRange.collapseGroups();
                  }
                  if (group.m_bSummaryOnTheRightOrBelow) {
                      sh.setRowGroupControlPosition(SpreadsheetApp.GroupControlTogglePosition.AFTER);
                  }
              }
              else if (type === appConstants.COLUMN) {
                  var cellLable1 = getCellLabel(1, group.m_iStart);
                  var cellLable2 = getCellLabel(1, group.m_iEnd);
                  var cellRange = `${cellLable1}:${cellLable2}`;
                  var applyRange = activeSS.getRange(cellRange);
                  applyRange.shiftColumnGroupDepth(i - 1);
                  if (!group.m_bExpanded) {
                      applyRange.collapseGroups();
                  }
                  if (group.m_bSummaryOnTheRightOrBelow) {
                      sh.setColumnGroupControlPosition(SpreadsheetApp.GroupControlTogglePosition.AFTER);
                  }
              }
          });
      }
  }
}

function getRowColCount(cellData) {
  var rowColCount = {};

  rowColCount.colCount = cellData.endColumn - cellData.startColumn + 1;
  rowColCount.rowCount = cellData.endRow - cellData.startRow + 1;

  return rowColCount;
}

function RenderFormats(formatRange) {
  if (formatRange == null || formatRange.length <= 0)
      return;

  var activeSS = SpreadsheetApp.getActiveSpreadsheet();

  formatRange.forEach(function (cellData) {
      var cellLoc = getRowColCount(cellData);

      var colCount = cellLoc.colCount;
      var rowCount = cellLoc.rowCount;
      var startColumn = cellData.startColumn;
      var startRow = cellData.startRow;

      var format_map = cellData.maps;
      var cellLable1 = getCellLabel(startRow, startColumn);
      var cellLable2 = getCellLabel(startRow + rowCount - 1, startColumn + colCount - 1);
      var cellRange = `${cellLable1}:${cellLable2}`;
      var applyRange = activeSS.getRange(cellRange);

      if (format_map.hasOwnProperty('align')) {
          applyRange.setHorizontalAlignment(format_map.align);
      }
      if (format_map.hasOwnProperty('background')) {
          var bgrgb = format_map.background;
          applyRange.setBackgroundRGB(bgrgb[0], bgrgb[1], bgrgb[2]);
      }
      if (format_map.hasOwnProperty('background_long')) {
          setBgLongToHex(applyRange, format_map.background_long);
      }
      if (format_map.hasOwnProperty('width')) {         
        const widthInPx = (7 * parseInt(format_map.width) + 5)
        setRowColumnDimension('width', activeSS, [applyRange, startColumn], widthInPx)
      }
      if (format_map.hasOwnProperty('height')) {          
        const heightInPx =  (4 * parseInt(format_map.height) / 3)
        setRowColumnDimension('height', activeSS, [applyRange, startRow], heightInPx) 
      }
      if (format_map.hasOwnProperty('bold')) {
          if (format_map.bold) {
              applyRange.setFontWeight("bold");
          }
      }
      if (format_map.hasOwnProperty('italic')) {
          if (format_map.italic) {
              applyRange.setFontStyle("italic");
          }
      }
      if (format_map.hasOwnProperty('font_size')) {
          applyRange.setFontSize(parseInt(format_map.font_size));
      }
      if (format_map.hasOwnProperty('color')) {
          applyRange.setFontColor(getHexCode(format_map.color));
      }

      if (format_map.hasOwnProperty('read_only')) {
          if (format_map.read_only) {
              applyRange.protect().setWarningOnly(true);
          }
      }

      if (format_map.hasOwnProperty('border_top')) {
          var border_config = JSON.parse(format_map.border_top);
          applyRange.setBorder(true, null, null, null, true, true, longToHex(border_config.color), getBorderStyle(border_config.lineStyle, border_config.weight));
      }

      if (format_map.hasOwnProperty('border_right')) {
          var border_config = JSON.parse(format_map.border_right);
          applyRange.setBorder(null, null, null, true, null, null, longToHex(border_config.color), getBorderStyle(border_config.lineStyle, border_config.weight));
      }

      if (format_map.hasOwnProperty('border_bottom')) {
          var border_config = JSON.parse(format_map.border_bottom);
          applyRange.setBorder(null, null, true, null, true, true, longToHex(border_config.color), getBorderStyle(border_config.lineStyle, border_config.weight));
      }

      if (format_map.hasOwnProperty('border_left')) {
          var border_config = JSON.parse(format_map.border_left);
          applyRange.setBorder(null, true, null, null, null, null, longToHex(border_config.color), getBorderStyle(border_config.lineStyle, border_config.weight));
      }
      applyNumberFormat(applyRange, format_map);

  })
}

function RenderCharts(chartRange) {
  if (chartRange == null)
      return;

  chartRange.forEach(function (cellData) {
      var cellLoc = getRowColCount(cellData);

      var colCount = cellLoc.colCount;
      var rowCount = cellLoc.rowCount;
      var startColumn = cellData.startColumn;
      var startRow = cellData.startRow;

      var cellLable1 = getCellLabel(startRow, startColumn);
      var cellLable2 = getCellLabel(startRow + rowCount - 1, startColumn + colCount - 1);
      var cellRange = `${cellLable1}:${cellLable2}`;

      var chart_map = cellData.maps;
      CreateChart(chart_map, cellRange);

  });
}

function Set3DChart(chart){
    if(chart === null || chart === undefined)
        return chart;
    try{
      chart = chart.setOption('is3D', true)
    }
    catch(err){
        Logger.log("Set3DChart:\r\n" + err.message);
    }
    return chart;
}

function fillColor(chart_map, chart, chartType) {
    let index = 0, point = {}, color, pointIndex = 0;
    try {
      for (const [key, seriesProperty] of Object.entries(chart_map.seriesProperties)) {
        if (seriesProperty.m_arPoints) {
          color = parseInt(seriesProperty.m_arPoints[pointIndex].m_rgbFormatFillForecolor, 10);
          if (color >= 0) {
            point.color = longToHex(color);
          } else {
            color = parseInt(seriesProperty.m_arPoints[pointIndex].m_rgbFormatLineForecolor, 10);
            if (color >= 0) {
              point.color = longToHex(color);
            }
          } 
          let opt = 'series.' + index + '.color';
          chart = chart.setOption(opt, point.color);

          index++;
          if(chartType === '2d-pie' || chartType === '3d-pie')
          {
              pointIndex++;
          }
        }
      }
    }
    catch (err) {
        Logger.log("fillColor: \r\n"  + err.message);
    }

    return chart;
  }

function CreateChart(chart_map, cellRange) {
  try {
      var spreadsheet = SpreadsheetApp.getActive();
      var sheet = spreadsheet.getActiveSheet();

      var type = "c" + (chart_map.rangeChartType || chart_map.type.toLowerCase());
      var title = chart_map.rangeChartTitle || chart_map.title;

      var chart = sheet.newChart()
      .addRange(sheet.getRange(cellRange))
      .setMergeStrategy(Charts.ChartMergeStrategy.MERGE_COLUMNS)
      .setNumHeaders(1)
      .setHiddenDimensionStrategy(Charts.ChartHiddenDimensionStrategy.IGNORE_BOTH)
      .setOption('bubble.stroke', '#000000')
      .setOption('isStacked', 'false')
      .setOption('title', title)
      .setOption('annotations.domain.textStyle.color', '#808080')
      .setOption('textStyle.color', '#000000')
      .setOption('legend.textStyle.color', '#1a1a1a')
      .setOption('legend', 'bottom')
      .setOption('titleTextStyle.color', '#757575')
      .setOption('titleTextStyle.alignment', 'center')
      .setOption('annotations.total.textStyle.color', '#808080')
      .setOption('width', chart_map.rangeChartWidth * pt2pxConverter)
      .setOption('height', chart_map.rangeChartHeight * pt2pxConverter)
      .setOption('useFirstColumnAsDomain', true);

      if (chart_map.rangeChartPlotBy == 1) {
          chart = chart.setTransposeRowsAndColumns(true);
      }
      else {
          chart = chart.setTransposeRowsAndColumns(false);
      }

      switch (support[type]) {
          case '2d-column':
          case '3d-column':
              {
                  chart = chart.asColumnChart();
                  if(support[type] == '3d-column'){
                    chart = Set3DChart(chart);
                  }
                  if (chart_map.rangeChartType === 52) {
                      chart = chart.setOption('isStacked', 'absolute').asColumnChart();
                  }
                  if (chart_map.rangeChartType === 53) {
                      chart = chart.setOption('isStacked', 'percent').asColumnChart();
                  }
                  if (chart_map.rangeChartType === 55) {
                      chart = chart.setOption('isStacked', 'absolute').asColumnChart();
                  }  
                  if (chart_map.rangeChartType === 56) {
                      chart = chart.setOption('isStacked', 'percent').asColumnChart();
                  } 
                  break;
              }

          case '2d-line':
          case '3d-line':
              {
                  chart = chart.asLineChart()
                          .setOption('treatLabelsAsText', true);
                  if(support[type] == '3d-line'){
                    chart = Set3DChart(chart);
                  }
                  if (chart_map.rangeChartType === 63) {
                      chart = chart.setOption('isStacked', 'absolute');
                  }
                  if (chart_map.rangeChartType === 64) {
                      chart = chart.setOption('isStacked', 'absolute');
                  }
                  if (chart_map.rangeChartType === 65 || chart_map.rangeChartType === 66 ||
                        chart_map.rangeChartType === 67 || chart_map.rangeChartType === -4101) {
                      chart = chart.setPointStyle(Charts.PointStyle.TINY);
                  }
                  break;
              }

          case '2d-bar':{
            chart = chart.asBarChart();
              if (chart_map.rangeChartType === 58) {
                chart = chart.setOption('isStacked', 'absolute');
              }
              if (chart_map.rangeChartType === 59) {
                chart = chart.setOption('isStacked', 'percent');
              }
          }
          case '3d-bar': {
              chart = chart.asBarChart();
              if (chart_map.rangeChartType === 61) {
                chart = chart.setOption('isStacked', 'absolute');
              }
              if (chart_map.rangeChartType === 62) {
                chart = chart.setOption('isStacked', 'percent');
              }
              if(support[type] == '3d-bar'){
                chart = Set3DChart(chart);
              }
              break;
          }

          case '2d-pie':
              {
                  chart = chart.asPieChart();
                  if (chart_map.rangeChartType === -4120) {
                      chart = chart.setOption('pieHole', 0.4);
                  }
                  break;
              }

          case '3d-pie':
              {
                  chart = chart.asPieChart();
                  chart = Set3DChart(chart);
                  break;
              }

          case '2d-scatter':
              {
                  chart = chart.asScatterChart();
                  break;
              }

          case '2d-area': {
              chart = chart.asAreaChart();
              if (chart_map.rangeChartType === 76) {
                  chart = chart.setOption('isStacked', 'absolute').asAreaChart();
              }
              if (chart_map.rangeChartType === 77) {
                  chart = chart.setOption('isStacked', 'percent').asAreaChart();
              }
               
              break;
          }

          default:
              chart = chart.asColumnChart().setTitle("Displaying Default Chart");
              break;
      }
    
      chart = fillColor(chart_map, chart, support[type]);
      chart = chart.setPosition(chart_map.rangeStartRow, chart_map.rangeStartColumn, 10, 10).build();
      sheet.insertChart(chart);
  }
  catch (err) {
      Logger.log(err.message);
  }
};

function setBgLongToHex(range, color) {
  let cr = parseInt((color % 256), 10),
    cg = parseInt(((color / 256) % 256), 10),
    cb = parseInt(((color / 256 / 256) % 256), 10);
  range.setBackgroundRGB(cr, cg, cb);
}

function longToHex(color) {
  let r = parseInt((color % 256), 10),
    g = parseInt(((color / 256) % 256), 10),
    b = parseInt(((color / 256 / 256) % 256), 10);
  return rgbToHex(r, g, b);
}

function rgbToHex(r, g, b) {
  let componentToHex = function (c) {
      let hex = c.toString(16);
      return hex.length === 1 ? "0" + hex : hex;
  };
  return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

function getBorderStyle(lineStyle, weight) {
  let borderStyle = SpreadsheetApp.BorderStyle.SOLID;
  switch (lineStyle) {
      case 1:
          switch (weight) {
              case 1:
              case 2:
                  borderStyle = SpreadsheetApp.BorderStyle.SOLID;
                  break;
              case -4138:
                  borderStyle = SpreadsheetApp.BorderStyle.SOLID_MEDIUM;
                  break;
              case 4:
                  borderStyle = SpreadsheetApp.BorderStyle.SOLID_THICK;
                  break;
          }
          break;
      case -4115:
          borderStyle = SpreadsheetApp.BorderStyle.DASHED;
          break;
      case 4:
      case 5:
      case 13:
      case -4118:
          borderStyle = SpreadsheetApp.BorderStyle.DOTTED;
          break;
      case -4119:
          borderStyle = SpreadsheetApp.BorderStyle.DOUBLE;
          break;
  }

  return borderStyle;
}

function componentToHex(c) {
  let hex = c.toString(16);
  return hex.length === 1 ? "0" + hex : hex;
};

function getHexCode(color) {
  return "#" + componentToHex(color[0]) + componentToHex(color[1]) + componentToHex(color[2]);
}

function getPayloadDataForReportRefresh(activeReportData, activeReportDoc) {  
    let rangesUpdated = ReadfromSheetAndUpdateRange(activeReportData);
    let data = {}

    if (activeReportDoc.type == "executive") {
            data = {
            id: activeReportData.id,
            params:
            {
                "{SELECTED_DROPDOWNS}": {
                    "name": activeReportData.state.source.properties.name
                }
            },
            ranges: rangesUpdated,
            state: activeReportData.state
        }
    } else {
            data = {
            "params": {
                "snapshotId": activeReportDoc.id
            }
        }
    }

    return { data, type: activeReportDoc.type }
  
  }

function gsRefreshReport(activeReportData, activeReportDoc) {
  Logger.log("Refreshing the report");
  var response = null;
  var rangesUpdated = ReadfromSheetAndUpdateRange(activeReportData);
  if (activeReportDoc.type == "executive") {
      var payload = {
          id: activeReportData.id,
          params:
          {
              "{SELECTED_DROPDOWNS}": {
                  "name": activeReportData.state.source.properties.name
              }
          },
          ranges: rangesUpdated,
          state: activeReportData.state
      }

      response = apiHandler.fetch(apiUrls.reports.open, apiHandler.POST, payload, OnReportSuccessResponse, OnReportFailureResponse);

  } else {
      var payload = {
          "params": {
              "snapshotId": activeReportDoc.id
          }
      }
      response = apiHandler.fetch(apiUrls.snapshot.open, apiHandler.POST, payload, OnReportSuccessResponse, OnReportFailureResponse);
  }

  return response;
}


function OnReportSuccessResponse(response) {
  var uiResponse = {};

  const responseCode = response.getResponseCode();
  Logger.log("Entered OnReportSuccessResponse success callback");

  uiResponse.code = responseCode;
  if (responseCode === 200) {
      var jsonText = response.getContentText();
      json_reponse = JSON.parse(jsonText)
      uiResponse.output = json_reponse;
    
      PopulateReportGridForUI(json_reponse);
  }
  else {
      var msg = JSON.parse(response.getContentText());
      uiResponse.errorMessage = msg.message;
  }
  return uiResponse;
}

function OnReportFailureResponse(response) {
  const responseCode = response.getResponseCode();
  Logger.log("Entered OnReportFailureResponse failed callback: \r\n" + response);
  return { responseCode, errorMessage: response.message }
}