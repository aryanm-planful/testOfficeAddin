function onInstall(e){
    resetProperties();
    onOpen(e);
}

function onOpen(e) {
    var menu = SpreadsheetApp.getUi().createAddonMenu(); 
    menu.addItem('Start', 'Launch');

    if (e?.authMode !== ScriptApp.AuthMode.NONE) {
        addMenu();
    } 

    menu.addToUi();
}

function addMenu() {
     SpreadsheetApp.getUi()
    .createMenu('Spotlight')
            .addItem('Start', 'Launch')
          .addToUi();

}

function Launch(){
    var isLoggedIn = guserProperties.getProperty(userPropContants.IS_LOGGEDIN);
    if(isLoggedIn && JSON.parse(isLoggedIn)){
        LaunchHomePage();
    }
    else{
        LaunchSpotlightLogin();
    }

    
}

function LaunchSpotlightLogin()
{ 
    guserProperties.initialize();
    var form = HtmlService.createTemplateFromFile('AppLogin').evaluate().setTitle("Spotlight");
    SpreadsheetApp.getUi().showSidebar(form);
}

function LaunchTenantScreen(){
   var form = HtmlService.createTemplateFromFile('AppTenantSelection').evaluate().setTitle("Spotlight");
    SpreadsheetApp.getUi().showSidebar(form);
}

function SpotlightLogout()
{ 
   var txt = "Logging out for " + guserProperties.getProperty(userPropContants.USER_NAME);
   guserProperties.initialize();
   SpreadsheetApp.getUi().alert(txt);
}

function LaunchHomePage()
{ 
    var html = HtmlService.createTemplateFromFile("HomePage").evaluate().setTitle("Spotlight");
    SpreadsheetApp.getUi().showSidebar(html);
}

function createSpotlightSheet(sheetName) {
 var ss = SpreadsheetApp.getActiveSpreadsheet();

  var sheet = ss.insertSheet(ss.getNumSheets());
  var delSheet = ss.getSheetByName(sheetName);
  if (delSheet) {
    ss.deleteSheet(delSheet);
  }

  sheet.setName(sheetName);
  sheet.activate(); 
}

function include(fileName){
    return HtmlService.createHtmlOutputFromFile(fileName).getContent(); 
}

function getCellLabel(row, col){
    var colName = columnToLetter(col);
    var cellLabel = `${colName}${row}`;
    return cellLabel;  
}

function columnToLetter(column)
{
    var temp, letter = '';
    while (column > 0)
    {
        temp = (column - 1) % 26;
        letter = String.fromCharCode(temp + 65) + letter;
        column = (column - temp - 1) / 26;
    }
    return letter;
}

function letterToColumn(letter)
{
    var column = 0, length = letter.length;
    for (var i = 0; i < length; i++)
    {
        column += (letter.charCodeAt(i) - 64) * Math.pow(26, length - i - 1);
    }
    return column;
}

function CreateCellList(cellRange,values,activeSS, limit = 500, currentValue = null) {

  if(Array.isArray(values) && (values.length > 0) && cellRange && activeSS) {

    // `DataValidation` Rule only supports upto 500 values form the list

    if(values.length > limit){
      values = values.slice(0,limit);
    }
    if(!values.includes(currentValue) && currentValue){
      values = [...values, currentValue];
    }
    
    var rule = SpreadsheetApp.newDataValidation().requireValueInList(values).setAllowInvalid(true).build();

    activeSS.getRange(cellRange).setDataValidation(rule);

  }

}

function applyNumberFormat(applyRange, format_map) {
  let formatter = "";
  let commaFormatter = "#,##0", plainFormatter = "##0";
  if (format_map.hasOwnProperty('decimal_place')) {
      if (format_map.decimal_place > 0) {
          let decimals = "";
          for (let i = 1; i <= format_map.decimal_place; i++) {
              decimals = decimals + "0";
          }
          formatter = "." + decimals;
      }
  }
  if (format_map.hasOwnProperty('numeric_format')) {

      switch (format_map.numeric_format) {
          case "Number":
              formatter = commaFormatter + formatter;
              format_map.numeric_format_type = format_map.numeric_format_type || "red_bracket";
              break;
          case "Percent":
              formatter = plainFormatter + formatter + "%";
              break;
          case "Currency":
              formatter = "$" + commaFormatter + formatter;
              format_map.numeric_format_type = format_map.numeric_format_type || "red_bracket";
              break;
          default:
              formatter = "##0" + formatter;
              break;
      }

      switch (format_map.numeric_format_type) {
          case "red_bracket":
              formatter = formatter + ";" + "[Red](" + formatter + ")";
              break;
          case "black_bracket":
              formatter = formatter + ";" + "(" + formatter + ")";
              break;
          case "red":
              formatter = formatter + ";" + "[Red]" + formatter + "";
              break;
      }

      applyRange.numberFormat  = formatter;
  }


  return formatter;
}

