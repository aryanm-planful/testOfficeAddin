  var jsTreeloaded;
  var cellDataPayload;
  var searchJsTreeExist;
  var openedDocument = "";
  var lastSearchedText = "";
  var currentMemberSelectedForCellValue = null;
  var currentMemberSelectedParentsSize = 1;
  $(document).ready(function () {
    jsTreeloaded = false;
    searchJsTreeExist = false;
  });

  function debounce(func, timeout = 500) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => { func.apply(this, args); }, timeout);
    };
}
  $('.dmSearchInput').keyup(debounce(function () {
    var filter, ul, li, a, i, txtValue;
    var searchedKeyword = $('.dmSearchInput').val();
    if (lastSearchedText !== searchedKeyword) {
      lastSearchedText = searchedKeyword;
      $("#noMemberFound").hide();
      if (searchedKeyword.trim() !== "") {
        $(".dmSearchInputLabel").html('<i class="fa fa-spinner fa-spin"></i>');
        $("#dimensionMemberJsTree").hide();
        $("#dimensionMemberSearchJsTree").show();
        if (searchJsTreeExist) {
          $('#dimensionMemberSearchJsTree').jstree(true).destroy();
        }
        var payload = {
          "dimension": cellDataPayload.dimension,
          "display": cellDataPayload.display,
          "filter": "contains",
          "member": "",
          "model": cellDataPayload.model,
          "search": searchedKeyword
        }

        http.fetch(
          apiUrls.views.adhoc.memberSearch,
          http.POST,
          payload,
          (res) => {
            dmSerachCallBack(res);
          },
          (err) => {
            OnAdhocViewHttpFailureResponse(err);
          }
        );
      } else {
        $("#noMemberFound").hide();
        $("#dimensionMemberSearchJsTree").hide();
        $("#dimensionMemberJsTree").show();
      }
    }

  }));

  function dmSerachCallBack(response) {
    var seachedTreeData = [];
    if (response.length <= 0) {
      $("#noMemberFound").show();
      $("#dimensionMemberSearchJsTree").hide();
      }else{
      $("#noMemberFound").hide();
      $("#dimensionMemberSearchJsTree").show();
      response.map(function (each) {
        var node = {
          id: each.code, parent: '#',
          text: each.code,
          data: {
            "lineage": each.lineage
          }
        }
        seachedTreeData.push(node);
      });
    }
    dmSearchJsTree(seachedTreeData);
  }


  function openDimensionMemberHierarchy(){
    updateLoadingIcon(true);
    $("#dmApplyBtn").addClass('dmApplyBtndisabled');
    google.script.run.withSuccessHandler(returnBackDMHierarchyData).createDimensionMemberHierarchyTree();
  }

  function returnBackDMHierarchyData(response){
    if(response.data !== null){
      if (jsTreeloaded) {
        $('#dimensionMemberJsTree').jstree(true).destroy();
      }
      $('#openedViewName').html(response.openedDocumentName);
      creatingDMSelection(response.data);
      $("#dimensionNameWithRange").html(response.selectedDimension + " ( " + response.cellLable + " ) ");
      $('#fileCabinetDiv').hide();
      show_dimensionMembersDiv();
      hide_updateMemBtnDiv();
      $("#cancel_Select_DM_btn_div").show();
    }
    updateLoadingIcon();
  }
  
  function show_dimensionMembersDiv(){
      $('#dimensionMembersDiv').slideDown(200, function(){
          $('#MainPageBelowHeader').css("max-height","calc(100% - 168px)");
    });
  }

  function creatingDMSelection(jsonData) {
    createDimensionMemberJsTree(jsonData).bind('ready.jstree', function (e, data) {
      $('#dimensionMemberJsTree').jstree().hide_stripes();
      $('#dimensionMemberJsTree').jstree().hide_dots();
      $('#dimensionMemberJsTree').jstree().hide_icons();
      jsTreeloaded = true;

    }).bind("click.jstree", function (event) {
      var tree = $(this).jstree();
      var node = tree.get_node(event.target);
      $("#dmApplyBtn").removeClass('dmApplyBtndisabled');
      currentMemberSelectedForCellValue = node.text;
      currentMemberSelectedParentsSize = node.parents.length;

    }).bind("dblclick.jstree", function (event) {
      var tree = $(this).jstree();
      var node = tree.get_node(event.target);
      updateLoadingIcon(true);
      google.script.run.withSuccessHandler(responseOfUpdatingCellVal).updateTheDropdownValueInCell(node.text , node.parents.length);
    }).bind("open_node.jstree",function(e,data){
      var node = data.node;
      if (!node.data.isApiCalled) {
        $('#dimensionMemberJsTree').jstree().open_node(node);
        node.data.isApiCalled = true;
        

        var payload = {
          "dimension": cellDataPayload.dimension,
          "display": cellDataPayload.display,
          "filter": "children",
          "member": node.id,
          "model": cellDataPayload.model
        }

        http.fetch(
          apiUrls.views.adhoc.members,
          http.POST,
          payload,
          (res) => {
            returnBackDMTreeData(res);
          },
          (err) => {
            OnAdhocViewHttpFailureResponse(err)
          }
        );
      }
      
      function returnBackDMTreeData(response) {
        var i = 0;
        var childrenData = response;
        while (i < childrenData.length) {
          var custom_Class = "hasChildren_" + childrenData[i].hasChildren;
          $('#dimensionMemberJsTree').jstree().create_node(
            node.id,
            {
              id: childrenData[i].code, parent: node.id, text: childrenData[i].code,
              data: {
                "dimension": node.data.dimension,
                "display": node.data.display,
                "filter": "children",
                "model": node.data.model,
                "isApiCalled": !childrenData[i].hasChildren,
                "hasChildren": childrenData[i].hasChildren
              }
            }, "last",
            function (childNode) {
              if (childNode.data.hasChildren) {
                $('#dimensionMemberJsTree').jstree().create_node(childNode.id, { id: childNode.id + "_Children", text: '<i class="fa fa-spinner fa-spin"></i>', parent: childNode.id });
              }
            });
          i = i + 1;
        } 
        $('#dimensionMemberJsTree').jstree(true).delete_node($("#dimensionMemberJsTree").jstree().get_node(node.id + "_Children"));
        
      }

    });
  }

  function createDimensionMemberJsTree(jsonData) {
    lastSearchedText = '';
    cellDataPayload = jsonData[0].data;
    const OurTee = $('#dimensionMemberJsTree').jstree({
      "core": {
        "check_callback": true,
        "data": jsonData
      },
      "search": {
        "case_sensitive": false,
        "show_only_matches": true
      },
      "plugins": ["types", "search"]
    });
    return OurTee;
  }

  function updateTheValueInCellOnSelectClicked(){
    google.script.run.withSuccessHandler(responseOfUpdatingCellVal).updateTheDropdownValueInCell(currentMemberSelectedForCellValue , currentMemberSelectedParentsSize);
  }

  function responseOfUpdatingCellVal(){
    $('.dmSearchInput').val('');
    lastSearchedText = '';
    $('#dimensionMemberSearchJsTree').hide();
    $('#dimensionMemberJsTree').show();
    backToFileCabinetFromDM();
    updateLoadingIcon();
  }

  function backToFileCabinetFromDM() {
    $('.dmSearchInput').val('');
    lastSearchedText = '';
    $('#dimensionMemberSearchJsTree').hide();
    $('#dimensionMemberJsTree').show();
    $('#dimensionMembersDiv').hide();
    $('#fileCabinetDiv').show();
    show_updateMemBtnDiv();
    $("#cancel_Select_DM_btn_div").hide();

  }


  function dmSearchJsTree(jsonData) {
    createDMSearchJsTree(jsonData).bind('ready.jstree', function (e, data) {
      $('#dimensionMemberSearchJsTree').jstree().hide_stripes();
      $('#dimensionMemberSearchJsTree').jstree().hide_dots();
      $('#dimensionMemberSearchJsTree').jstree().hide_icons();
      $(".dmSearchInputLabel").html('<i class="fa fa-search" aria-hidden="true"></i>');

    }).bind("click.jstree", function (event) {
      var tree = $(this).jstree();
      var node = tree.get_node(event.target);
      currentMemberSelectedForCellValue = node.text;
      currentMemberSelectedParentsSize = node.parents.length;
      $("#dmApplyBtn").removeClass('dmApplyBtndisabled');
    }).bind("dblclick.jstree", function (event) {
      var tree = $(this).jstree();
      var node = tree.get_node(event.target);
      google.script.run.withSuccessHandler(responseOfUpdatingCellVal).updateTheDropdownValueInCell(node.text , node.parents.length);
    });
  }


  function createDMSearchJsTree(jsonData) {
    searchJsTreeExist = true;
    return $('#dimensionMemberSearchJsTree').jstree({
      "core": {
        "check_callback": true,
        "data": jsonData
      },
      "search": {
        "case_sensitive": false,
        "show_only_matches": true
      },
      "plugins": ["types", "search"]
    });

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
