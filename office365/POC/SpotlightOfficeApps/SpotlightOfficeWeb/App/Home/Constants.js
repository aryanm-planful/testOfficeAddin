const apiUrls = {
    user: {
      userInformation: "api/security/user",
      logIn: "api/login"
    },
    views: {
      adhoc: {
        dapDrillThroughExport: "api/drillthrough/dap/export",
        dapDrillThroughMetadata: "api/drillthrough/dap/metaData",
        dapDrillThroughSourceTypes: "api/drillthrough/dap/sourceTypes",
        dapDrillThroughData: "api/drillthrough/dap/data",
        dataCellInfo: "api/ui/adhoc/dataCellInfo",
        drillThrough: "api/ui/adhoc/drillThrough",
        keepOnly: "api/ui/adhoc/keepOnly",
        open: "api/ui/adhoc/open",
        pivot: "api/ui/adhoc/pivot",
        removeOnly: "api/ui/adhoc/removeOnly",
        rename: "api/ui/adhoc/rename",
        refresh: "api/ui/adhoc/refresh",
        saveData: "api/ui/adhoc/save",
        zoomIn: "api/ui/adhoc/zoomIn",
        zoomInBottom: "api/ui/adhoc/zoomInBottom",
        zoomInAll: "api/ui/adhoc/zoomInAll",
        zoomInDataLeaves: "api/ui/adhoc/zoomInDataLeafLevels",
        zoomInEnhanced: "api/ui/adhoc/zoomInEnhanced",
        zoomOut: "api/ui/adhoc/zoomOut",
        zoomOutEnhanced: "api/ui/adhoc/zoomOutEnhanced",
        members: "api/ui/member/getMembers",
        memberSearch: "api/ui/member/search"
      },
      esm: {
        open: "api/ui/esmView/open",
        refresh: "api/ui/esmView/refresh"
  
      }
    },
    fileCabinet: {
      addFolder: "api/ui/fileCabinet/addFolder",
      addFavorite: "api/ui/fileCabinet/addFavorite",
      deleteFolder: "api/ui/fileCabinet/deleteFolder",
      getItems: "api/ui/fileCabinet/getItems",
      moveItem: "api/ui/fileCabinet/moveItem",
      removeFavorite: "api/ui/fileCabinet/removeFavorite",
      renameFolder: "api/ui/fileCabinet/renameFolder",
      searchItems: "api/ui/fileCabinet/searchItems"
    },
    reports: {
      open: "api/ui/report/run",
      delete: "api/ui/report/delete",
      rename: "api/ui/report/rename",
      povModel: "api/reporting/povModel",
      dap: {
        drillThroughMetadata: "api/drillthrough/dap/report/metaData",
        drillThroughSourceTypes: "api/drillthrough/dap/report/sourceTypes"
      }
    },
    snapshot: {
      open: "api/ui/snapshot/get"
    }
  }

  const appConstants = {
    ANALYZE_SHEET: "Analyze",
    REPORT_SHEET: "Report",
    LOGIN_SUCCESS: "Login Success",
    LOGIN_FAILED: "Login failed",
    URL_LIST_COUNT: 2,
    ESM_VIEW : "esmView",
    ADHOC_VIEW : "adhoc",
    RANGE_TYPE_FIXED: "FIXED",
    RANGE_DYNAMIC_ROW: "DYNAMIC_ROW",
    RANGE_DYNAMIC_COLUMN: "DYNAMIC_COLUMN",
    RANGE_TYPE_DYNAMIC_GRID : "DYNAMIC_GRID",
    RANGE_TYPE_DROPDOWN: "DROPDOWN",
    RANGE_TYPE_FORMAT : "FORMAT",
    RANGE_TYPE_GLOBAL : "GLOBAL",
    RANGE_TYPE_CHART: "CHART",
    EXECUTIVE_REPORT: "executive",
    SNAPSHOT_REPORT: "snapshot",
    ROW: "row",
    COLUMN: "column",
    TOTAL_BATCHES : 5
};