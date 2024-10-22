const APP_VERSION = "23.5.0.1";

var activeAdhocViewData = "";
var activeReportData = "";
var activeReportDoc =  {};
var currentSelectedRepo = "";
var fileCabinetExist = false;
var searchedKeyword;
var typeOfDocumentOpened = "";
var pt2pxMultiplier = 1;
var typeOfDocumentOpened = '';
var iterationCompleted = 0;
var globalRange = [];
var formatRange = [];
var chartRange = [];
var appliedformats = 0;
var viewHasDropdownValues = false;
var  tempMap = {};

$(document).ready(function () {
    $('#menuPage').hide();
    $('#accountInfo').hide();
    creatingCabinet('adhoc');
    $('.fileCabinetSearchInput').keyup(function () {
        var tempKeyWord = $(this).val();
        if(searchedKeyword !== tempKeyWord){
            searchedKeyword = tempKeyWord;
            $(".fileCabinetSearchBoxIcon").html('<i class="fa fa-spinner fa-spin"></i>');
            // google.script.run.withSuccessHandler(returnSearchBack).getSearchItems(currentSelectedRepo, searchedKeyword);

            getSearchItemsHttp(currentSelectedRepo, searchedKeyword)
        }
    });
        
    // Update the pt2pxMultiplier
    let tempSpan = $("<span></span>"),
      fontSizeInPx;
    tempSpan.css({
        "font-size": "96pt",
        "display": "none"
    });
    tempSpan.appendTo($(document.body));
    fontSizeInPx = tempSpan.css("font-size");
    if (fontSizeInPx.indexOf("px") !== -1) {
        let fontSizeInPxNumber = parseFloat(fontSizeInPx);
        pt2pxMultiplier = fontSizeInPxNumber / 96;
    } else {
        // when browser have not convert pt to px, use 96 DPI.
        pt2pxMultiplier = 72 / 96;
    }

    // google.script.run.withSuccessHandler(returnBack1).getInfo("version");
    function returnBack1(files) {
        document.getElementById("version").innerHTML = files;
    }

    //  google.script.run.withSuccessHandler(returnBack2).getInfo("app");
    function returnBack2(files) {
        document.getElementById("app").innerHTML = files;
    }

    //   google.script.run.withSuccessHandler(returnBack3).getInfo("role");
    function returnBack3(files) {
        document.getElementById("role").innerHTML = files;
    }

    //  google.script.run.withSuccessHandler(returnBack4).getInfo("userName");
    function returnBack4(files) {
        document.getElementById("userName").innerHTML = files;
        document.getElementById("avatar").innerHTML = files.charAt(0);
    }

    //  google.script.run.withSuccessHandler(returnBack5).getInfo("userEmail");
    function returnBack5(files) {
        document.getElementById("userEmail").innerHTML = files;
    }

    //document.getElementById("addinVersion").innerHTML = APP_VERSION;

    addIframeListeners();
});

function addIframeListeners() {
    if (window.addEventListener) {
        window.addEventListener("message", iframeListener);
    } else {
        window.attachEvent("message", iframeListener);
    }
}

function iframeListener(event) {
    if(event.data.command == 'onLogout'){
        logoutWindow.close(); 
    } 
}


    
function handleViewResponse(result){
    updateLoadingIcon();
    $("#fileCabinetDiv").show();
    show_updateMemBtnDiv();
    $("#dimensionMembersDiv").hide();
    $("#cancel_Select_DM_btn_div").hide();
    saveActiveViewResponse(result);
    if (result.code !== 200){
        handleNotification("Planful Spotlight ",result.errorMessage);
    }
}
function CreateLineChart(){
    //CreateTestChart("ColumnClustered");
    return CreateTestChart("line");
}

function CreateColumnChart(){
    return CreateTestChart("ColumnClustered");
}

function CreateTestChart(chartType){
    return new Promise(function(resolve, reject){
        Excel.run(function(context) {
            try {
                //var context =   Office.context;
                var activeWorkbook = context.workbook;
                var activeSS = activeWorkbook.worksheets.getActiveWorksheet();

                //const dataRange = activeSS.getSelectedRange();
                const dataRange = context.workbook.getSelectedRange();
                let MyChart = activeSS.charts.add(chartType, dataRange, "auto");

                let chart = workbook.charts.getItem("MyChart" + chartType);

                // Modify chart properties such as position, titles, colors, sizes, and more
                chart.setPosition("A15", "F30");
                chart.title.text = chartType;
                chart.legend.position = "right"
                chart.legend.format.fill.setSolidColor("white");
                chart.dataLabels.format.font.size = 15;
                chart.dataLabels.format.font.color = "black";
            }
            catch(err){
                console.log(err);
            }

            return context.sync().then(function() {
                resolve("Chart updated successfully");
            }).catch(function(error) {
                reject("Error: " + error.message);
            });
        });
    });;
}

    
function adhocGetData(){
    // updateLoadingIcon(true);
    var mydata = JSON.parse(adhocViewRD);
    console.log(mydata.id);

    PopulateGridForAdhocView(mydata);
    // google.script.run.withSuccessHandler(refreshViewHttp).getPayloadDataForViewRefresh(activeAdhocViewData);
}

function viewZoomInChildren(){
    updateLoadingIcon(true);
    gsZoomIn_HTTP(activeAdhocViewData,typeOfDocumentOpened , "children");
}

function viewZoomInAllChildren(){
    updateLoadingIcon(true);
    gsZoomIn_HTTP(activeAdhocViewData,typeOfDocumentOpened , "allChildren");
}

function viewZoomInDataLeaves(){
    updateLoadingIcon(true);
    gsZoomIn_HTTP(activeAdhocViewData,typeOfDocumentOpened , "dataLeaves");
}

function viewZoomInLeaves(){
    updateLoadingIcon(true);
    gsZoomIn_HTTP(activeAdhocViewData,typeOfDocumentOpened , "leaves");
}

function viewZoomOutTopLevel(){
    updateLoadingIcon(true);
    gsZoomOutTopLevel_HTTP(activeAdhocViewData,typeOfDocumentOpened);
}

function viewZoomOutParentLevel(){
    updateLoadingIcon(true);
    gsZoomOutParentLevel_HTTP(activeAdhocViewData,typeOfDocumentOpened);
}

function pivotToRow(){
    updateLoadingIcon(true);
    gsPivotToRow_HTTP(activeAdhocViewData , typeOfDocumentOpened);
}

function pivotToColumn(){
    updateLoadingIcon(true);
    gsPivotToColumn_HTTP(activeAdhocViewData , typeOfDocumentOpened);
}

function pivotToPage(){
    updateLoadingIcon(true);
    gsPivotToPage_HTTP(activeAdhocViewData , typeOfDocumentOpened);
}

function pivot(){
    updateLoadingIcon(true);
    gsPivot_HTTP(activeAdhocViewData , typeOfDocumentOpened);
}

function keepOnly(){
    updateLoadingIcon(true);
    gsKeepOnly_HTTP(activeAdhocViewData, typeOfDocumentOpened);
}

function removeOnly(){
    updateLoadingIcon(true);
    gsRemoveOnly_HTTP(activeAdhocViewData, typeOfDocumentOpened);

}

function suppressRow(suppressOpt){
    updateLoadingIcon(true);
    gsSuppressRow_HTTP(activeAdhocViewData, suppressOpt , typeOfDocumentOpened);
}

function suppressColumn(suppressOpt){
    updateLoadingIcon(true);
    gsSuppressColumn_HTTP(activeAdhocViewData, suppressOpt , typeOfDocumentOpened);
}

function indentRow(indentOpt){
    updateLoadingIcon(true);
    gsIndentRow_HTTP(activeAdhocViewData, indentOpt , typeOfDocumentOpened);
}

function applyDisplay(displayOpt){
    updateLoadingIcon(true);
    gsApplyDisplay_HTTP(activeAdhocViewData, displayOpt , typeOfDocumentOpened);
}

function applyNumFormat(format){
    updateLoadingIcon(true);
    gsApplyNumFormat_HTTP(activeAdhocViewData, format , typeOfDocumentOpened);
}

function creatingCabinet(repoType) {
    $('.fileCabinetSearchInput').val("");
    $("#fileCabinetDiv").show();
    $("#dimensionMembersDiv").hide();
    $("#noFilesFound").hide();
    $('#divJsTreeExample').show();
    currentSelectedRepo = repoType;
    if ((repoType === "adhoc" && viewHasDropdownValues && (typeOfDocumentOpened === "esmView" || typeOfDocumentOpened === "adhoc"))  || 
    (repoType === "executive") && !$(".report-functional-nav-item").hasClass("disabled") && typeOfDocumentOpened === "executive") {
        show_updateMemBtnDiv();
    } else {
        hide_updateMemBtnDiv();
    }
    if(fileCabinetExist){
        $('#divJsTreeExample').jstree(true).destroy();
    }
    if(repoType === "executive"){
        $("#analyze-home-tab").removeClass("active");
        $("#report-home-tab").addClass("active");
        $("#analyze-home").hide();
        $("#reports-home").show();
    } else if(repoType === "adhoc"){
        $("#analyze-home-tab").addClass("active");
        $("#report-home-tab").removeClass("active");
        $("#reports-home").hide();
        $("#analyze-home").show();
    }

    var jsTree = createJsonTree(repoType).bind('ready.jstree', function (e, data) {
        $('#divJsTreeExample').jstree('close_all');
        $('#divJsTreeExample').jstree().hide_stripes();
        $('#divJsTreeExample').jstree().hide_dots();
        fileCabinetExist = true;
    });
            
    if(jsTree !== undefined){
        jsTree.bind("click.jstree", function (event) {
            var tree = $(this).jstree();
            var node = tree.get_node(event.target);
            if (!node.data.isApiCalled && node.data.hasChildren) {
                node.data.isApiCalled = true;
                // google.script.run.withSuccessHandler(updateCabinetFiles).getitemsforParent(node.id, repoType);

                getitemsforParentHttp(node.id, repoType)
                    
                function getitemsforParentHttp(parentId, repoType){
                    var data = {
                        'mode': 'run',
                        'parentId': parentId,
                        'repositoryType': repoType,
                    };

                    http.fetch(
                        apiUrls.fileCabinet.getItems,
                        http.POST,
                        data,
                        (data) => updateCabinetFiles(data),
                        (err) => console.log(err)
                    );
                }
                    
                function updateCabinetFiles(files) {
                    var i = 0;
                    while (i < files.length) {
                        if ($('#divJsTreeExample').jstree().get_node(files[i].id) === false) {
                            $('#divJsTreeExample').jstree().create_node(node.id,
                                { id: files[i].id, parent: node.id, text: files[i].name, type: files[i].attributes.type, data: { "models": files[i].attributes.models, "isApiCalled": false, "hasChildren": files[i].hasChildren, "repository_type": files[i].attributes.type } },
                                "last", function (childNode) {
                                    
                                    if(childNode.data.hasChildren){
                                        $('#divJsTreeExample').jstree().create_node(childNode.id, 
                                        {id: childNode.id + "_Children" , parent: childNode.id, type: "LoadingChildrenType" , text: '<i class="fa fa-spinner fa-spin"></i>',data: {"repository_type": files[i].attributes.type },
                                            "li_attr" : {"class": "LoadingChildrenClass"} } )
                                    }
                                })
                        }
                        i = i + 1;
                    }
                    $('#divJsTreeExample').jstree().delete_node($('#divJsTreeExample').jstree().get_node(node.id + "_Children"));
                }
            }
        }).bind("dblclick.jstree", function (event) {
            var tree = $(this).jstree();
            var node = tree.get_node(event.target);
            if (node.data.repository_type === "adhoc" || node.data.repository_type === "esmView" ) {
                updateLoadingIcon(true);
                // google.script.run.withSuccessHandler(responseForOpenedAdhocView).gsOpenAnalyzeView(node.id, node.text, node.data.models , node.data.repository_type);
                openAnalyzeViewHttp(node.id, node.text, node.data.models , node.data.repository_type)
            }
            else if(node.data.repository_type === "executive" || node.data.repository_type === "snapshot"){
                updateLoadingIcon(true);
                activeReportDoc.id = node.id;
                // google.script.run.withSuccessHandler(responseForOpenedReport).gsOpenReport(node.id, node.text, node.data.repository_type, pt2pxMultiplier);
                // console.time("Opening Report [Total]: ")
                openReportHttp(node.id, node.text, node.data.repository_type, pt2pxMultiplier)
            }

        });
    }
                
}

function saveActiveViewResponse(result){
    if (result != undefined && result.code == 200){
        typeOfDocumentOpened = result.type;
        activeAdhocViewData = result.output;
    }
}

function handleResponseFailure(msg) {
    updateLoadingIcon()
    $('#updateMemBtnDiv').hide();
    handleNotification("Planful Spotlight ",msg);
}
    
function OnAdhocViewHttpSuccessResponse(res, type) {
    typeOfDocumentOpened = type;
    google.script.run
    .withSuccessHandler((funcResponse) => responseForOpenedAdhocView({
        code: 200,
        output: res,
        type: type,
        showUpdateSelectionBtn: funcResponse.showUpdateSelectionBtn
    }))
    .PopulateGridForAdhocView(res)
}

function OnAdhocViewHttpFailureResponse(err) {
    console.log("Error in opening view: ", err)
    handleResponseFailure(JSON.parse(err.message)?.message)
}

function OnReportHttpSuccessResponse(res, type) {
        
    // console.timeEnd("Opening Report [Server]: ")
    const reportData ={
        code: 200,
        output: res,
        typeOfReport: type
    }
    activeReportDoc.type = type;
    saveActiveReportResponse(reportData);
    google.script.run.withSuccessHandler(updateTheRanges).createSpotlightSheet(appConstants.REPORT_SHEET);
}


function updateTheRanges(){
    var upperIndex = 0 ; iterationCompleted = 0; globalRange = [];formatRange = [] ; chartRange =[];appliedformats =0 , tempMap = {};
    const res = JSON.parse(JSON.stringify(activeReportData));
    var ranges = res.ranges;
    var totalLength = res.ranges.length;
    var currentBatch = 1 ;
    var halfLength = Math.floor(totalLength/2);
    var lowerIndex = halfLength;

    var firstRange = ranges.slice(0, lowerIndex);
    res.ranges = firstRange;
        
    google.script.run
    .withSuccessHandler(applyReportFormatsAfterRanges)
    .PopulateReportGridForUI(res,currentBatch)
    while(currentBatch <= (appConstants.TOTAL_BATCHES -1 )){
        upperIndex = Math.floor(((totalLength - halfLength)/  (appConstants.TOTAL_BATCHES -1) ));
        upperIndex = upperIndex + lowerIndex +1;
        const updatedRange = ranges.slice(lowerIndex, upperIndex);
        res.ranges = updatedRange;
        google.script.run
        .withSuccessHandler(applyReportFormatsAfterRanges)
        .PopulateReportGridForUI(res,currentBatch)
        
        lowerIndex = upperIndex;
        currentBatch = currentBatch + 1;
    }

}

function applyReportFormatsAfterRanges(data){
    iterationCompleted = iterationCompleted + 1;
    globalRange = globalRange.concat(...data.globalRange);
    formatRange = formatRange.concat(...data.formatRange);
    chartRange = chartRange.concat(...data.chartRange);
        
    for (var i in data.rangeMapDimensions){
        tempMap[i] = data.rangeMapDimensions[i];
    }

    if(iterationCompleted ===  appConstants.TOTAL_BATCHES){
        google.script.run.withSuccessHandler(reportLoaded)
        .RenderFormats(formatRange);
        google.script.run.withSuccessHandler(reportLoaded)
        .ApplyRowColumnGroup_Charts_GlobalRange(globalRange , JSON.stringify(tempMap),chartRange);
    }

}

function reportLoaded() {
    appliedformats = appliedformats + 1;
    if(appliedformats === 2){
        // console.timeEnd("Opening Report [Total]: ")

        const reportData ={
            code: 200,
            output: activeReportData,
            typeOfReport: activeReportDoc.type
        }
        responseForOpenedReport(reportData);

    }
            
        
}

function OnReportHttpFailureResponse(err) {
    console.log("Error in opening report: ", err)
    handleResponseFailure(JSON.parse(err.message)?.message)
}

function responseForOpenedAdhocView(result) {
    updateLoadingIcon();
    if(result !== undefined){
        viewHasDropdownValues= result.showUpdateSelectionBtn;
        if(viewHasDropdownValues){
            show_updateMemBtnDiv();
        }else{
            hide_updateMemBtnDiv();
        }
        saveActiveViewResponse(result);
        if (result.code == 200 && result.type == "adhoc") {
            $(".report-functional-nav-item").addClass("disabled");
            $(".analyze-functional-nav-item").removeClass("disabled");
        }
        else if (result.code === 200 && result.type === "esmView") {
            $(".report-functional-nav-item").addClass("disabled");
            $(".analyze-functional-nav-item").addClass("disabled");
            $(".getData-nav-item").removeClass("disabled");
                
        }
        else if (result.code !== 200){
            hide_updateMemBtnDiv();
            handleNotification("Planful Spotlight ",result.errorMessage);
        }
    }
}

function saveActiveReportResponse(result){
    if (result != undefined && result.code == 200){
        typeOfDocumentOpened = result.typeOfReport;
        activeReportData = result.output;
    }
}

function responseForOpenedReport(result) {
    updateLoadingIcon();
    if(result !== undefined){
        if(result.code === 200 && result.typeOfReport === "executive"){
            $(".analyze-functional-nav-item").addClass("disabled");
            $(".report-functional-nav-item").removeClass("disabled");
            show_updateMemBtnDiv();
        }
        else if(result.code === 200 && result.typeOfReport === "snapshot"){
            $(".analyze-functional-nav-item").addClass("disabled");
            $(".report-functional-nav-item").removeClass("disabled");
            hide_updateMemBtnDiv();
        }
        else if (result.code !== 200){
            handleNotification("Planful Spotlight ",result.errorMessage);
            hide_updateMemBtnDiv();
        }
    }
}

function returnSearchBack(values) {
    if(values.length <=0){
        $("#noFilesFound").show();
        $('#divJsTreeExample').hide();
        $(".input-group-text").html('<i class="fa fa-search" aria-hidden="true"></i>');
    }
    else{
        $("#noFilesFound").hide();
        $('#divJsTreeExample').show();
        var i = 0;
        while (i < values.length) {
            if (values[i].parentId !== "" && $('#divJsTreeExample').jstree().get_node(values[i].id) === false) {
                var node = $('#divJsTreeExample').jstree().get_node(values[i].parentId);
                $('#divJsTreeExample').jstree().create_node(node.id,
                    { id: values[i].id, parent: node.id, text: values[i].name, type: values[i].attributes.type, data: { "models": values[i].attributes.models, "isApiCalled": false, "hasChildren": values[i].hasChildren, "repository_type": values[i].attributes.type } },
                "last", function (node) { })
            }
            i = i + 1;
        }
        $(".input-group-text").html('<i class="fa fa-search" aria-hidden="true"></i>');
        $('#divJsTreeExample').jstree(true).show_all();
        $('#divJsTreeExample').jstree('search', searchedKeyword);
        $(".loadingChildrenNodeClass").hide();
        $(".loadingChildrenNodeClass").html("");
    }
}
function createJsonTree(repoType) {

    const OurTee = $('#divJsTreeExample').jstree({
        "core": {
            "check_callback": true,
            "data": function (node, cb) {
                // google.script.run.withSuccessHandler(returnBack).gsGetFileCabinet(repoType);
                getFileCabinetHttp(repoType, cb)
                    
            }
        },
        "types": {
            "adhoc": {
                "icon": "adhoc-icon"
            },
            "esmView": {
                "icon": "adhoc-icon"
            },
            "favorite": {
                "icon": "favorite-icon"
            },
            "recent": {
                "icon": "recent-icon"
            },
            "esm": {
                "icon": "esm_svg_try"
            },
            "folder": {
                "icon": "folder-icon"
            },
            "executive": {
                "icon": "executiveReport-icon"
            },
            "snapshot": {
                "icon": "snapshotReport-icon"
            },
            "esmModel": {
                "icon": "esmModel-icon"
            }, "model": {
                "icon": "cube-icon"
            },
            "LoadingChildrenType":{
                "icon": "LoadingChildrenTypeIcon"
            }
        },
        "search": {
            "case_sensitive": false,
            "show_only_matches": true
        },
        "plugins": [ "types", "search", "sort"],
        "sort": function sort(a, b) {
            if (this.get_node(a).parent === "#" || this.get_node(b).parent === "#") {
                return;
            }else if (this.get_node(a).parent === "FileCabinet_Recent_ID" || this.get_node(b).parent === "FileCabinet_Recent_ID" || this.get_node(a).parent === "FileCabinet_Favorite_ID" || this.get_node(b).parent === "FileCabinet_Favorite_ID" ) {
                return;
            }
                
            if(currentSelectedRepo === "executive"){
                var textA = this.get_node(a).text, textB = this.get_node(b).text,
                type_A = this.get_node(a).data.repository_type,
                type_B = this.get_node(b).data.repository_type;
                var priorityTerms = ["folder", "executive"];
                var indexOfTextA = priorityTerms.indexOf(type_A),
                    indexOfTextB = priorityTerms.indexOf(type_B);
            }
            else if(currentSelectedRepo === "adhoc"){
                var textA = this.get_node(a).text, textB = this.get_node(b).text,
                type_A = this.get_node(a).data.repository_type,
                type_B = this.get_node(b).data.repository_type;;
                var priorityTerms = ['<i class="fa fa-spinner fa-spin"></i>' , "folder", "adhoc"];
                var indexOfTextA = priorityTerms.indexOf(type_A),
                    indexOfTextB = priorityTerms.indexOf(type_B);

                if(textA === "Default") indexOfTextA = 0;
                else if(textB === "Default") indexOfTextB = 0;

            }

            return (indexOfTextA > -1 && indexOfTextB > -1) ? (indexOfTextA > indexOfTextB) ? 1 :
            (indexOfTextA === indexOfTextB) ? 1 : -1
                : (indexOfTextA > -1) ? -1 : (indexOfTextB > -1) ? 1
                    : (textA > textB) ? 1 : -1 // default alpha sort
        },
        "contextmenu": {
            "items": function ($node) {
                return {
                    "Add to Favorites": {
                        "separator_before": false,
                        "separator_after": true,
                        "label": "Add to Favorites",
                        "action": function (obj) {
                        },
                    },
                    "Rename": {
                        "separator_before": true,
                        "separator_after": true,
                        "label": "Rename",
                        "action": function (obj) {
                            $('#divJsTreeExample').jstree().rename_node($node, "Vivek");
                        }
                    },
                    "Delete": {
                        "separator_before": true,
                        "separator_after": false,
                        "label": "Delete",
                        "action": function (obj) {
                            $('#divJsTreeExample').jstree().delete_node($node);
                        }
                    }
                }
            }
        }
    });
    return OurTee;
}

    
function toggleAccountmenu() {
    $('#menuPage').toggle();
    $('#container').toggle();
}

var logoutWindow = null;

function handleLogoutClick() {
    updateLoadingIcon(true);    

    google.script.run.withSuccessHandler(invalidatePCRSession).getInfo("pcrInfo");
    function invalidatePCRSession(pcrInfo) {
        if(pcrInfo.isPcrOrigin === "true"){             
            let windowFeatures = 'popup,resizable=1,left=200,top=100,width=700,height=500';
            if (logoutWindow == null || logoutWindow.closed) {
                logoutWindow = window.open(pcrInfo.pcrLogoutUrl, 'logout', windowFeatures);
            }
        }
    }
    this.logoutfromModeling();
}

function logoutfromModeling()
{
    http.fetch(
        apiUrls.user.logIn,
        http.DELETE,
        null,
        (res) => {
            google.script.run.withSuccessHandler(updateLoadingIcon).handleLogout();
        },
        (err) => {
            google.script.run.withSuccessHandler(updateLoadingIcon).handleLogout();

        }
        )
}

function openFileCabinetForReportTab(){
    $("#cancel_Select_DM_btn_div").hide();
    $('#menuPage').toggle();
    $('#container').toggle();
    $("#nav-analyze").removeClass("active");
    $("#nav-analyze-tab").removeClass("active");
    $("#nav-report-tab").addClass("active");
    $("#nav-report").addClass("active");
    creatingCabinet('executive');
}

function openFileCabinetForAnalyzeTab(){
    $("#cancel_Select_DM_btn_div").hide();
    $('#menuPage').toggle();
    $('#container').toggle();
    $("#nav-report").removeClass("active");
    $("#nav-report-tab").removeClass("active");
    $("#nav-analyze-tab").addClass("active");
    $("#nav-analyze").addClass("active");
    creatingCabinet('adhoc');
}

function toggleAccountInfo() {
    $('#menuPage').toggle();
    $('#accountInfo').toggle();

    var myArray = ['red', 'green', 'blue'];
    var rand = myArray[Math.floor(Math.random() * myArray.length)];
    document.getElementById("avatar").style.backgroundColor = rand;

    var value = document.getElementById("userEmail").innerHTML;
    if (document.getElementById("avatar").innerHTML == "") {
        document.getElementById("avatar").innerHTML = value.charAt(0).toUpperCase();
    }
}

function updateLoadingIcon(addLoadingIcnClass = false){
    $('#loadingPlace').toggle();
    if(addLoadingIcnClass){
        $('#loadingPlace').addClass('loading');
    }
    else{
        $('#loadingPlace').removeClass('loading');
    }
}

    

    function refreshReport(){
        updateLoadingIcon(true);
        //   google.script.run.withSuccessHandler(responseForRefreshingReport).gsRefreshReport(activeReportData,activeReportDoc);
        google.script.run.withSuccessHandler(refreshReportHttp).getPayloadDataForReportRefresh(activeReportData,activeReportDoc);
    }

    function responseForRefreshingReport(response){
        updateLoadingIcon();
        $("#fileCabinetDiv").show();
        show_updateMemBtnDiv();
        $("#dimensionMembersDiv").hide();
        $("#cancel_Select_DM_btn_div").hide();
        if(response.code !== 200){
            handleNotification("Planful Spotlight ",result.errorMessage);
        }
    }

    function show_updateMemBtnDiv(){
        $('#updateMemBtnDiv').slideDown(200, function(){
            $('#MainPageBelowHeader').css("max-height","calc(100% - 168px)");
        });
    }

    function hide_updateMemBtnDiv(){
        $("#updateMemBtnDiv").hide(0,function(){
            $('#MainPageBelowHeader').css("max-height","calc(100% - 70px)");
        });
    }
