
    function getSearchItemsHttp(currentSelectedRepo, searchedKeyword) {
        const data = {
            "mode": "run",
            "filter": "contains",
            "parentId": "",
            "repositoryType": currentSelectedRepo,
            "searchById": false,
            "search": searchedKeyword
        };

        http.fetch(
            apiUrls.fileCabinet.searchItems,
            
            http.POST,
            data,
            (res) => {
                returnSearchBack(res)
            },
            (err) => console.log("Entered  failed callback for search items: ", err)
        )
    }

    function refreshViewHttp({ data, type }) {
        let endpoint = ""
        if (type === appConstants.ADHOC_VIEW) {
            endpoint = apiUrls.views.adhoc.refresh
        } else if (type === appConstants.ESM_VIEW) {
            endpoint = apiUrls.views.esm.refresh
        }
        http.fetch(
            endpoint,
            
            http.POST,
            data,
            (res) => {
                OnAdhocViewHttpSuccessResponse(res, type)
            },
            (err) => {
                OnAdhocViewHttpFailureResponse(err)
            }
        );
    }

    function openAnalyzeViewHttp(id, text, models, typeOfAnalyze) {
        const data = {
            "id": id,
            "name": text,
            "params": {
                "models": models
            }
        }
        google.script.run.setTypeOfAnalyzeViewToOpen(typeOfAnalyze)


        let endpoint = ""
        if (typeOfAnalyze === appConstants.ADHOC_VIEW) {
            endpoint = apiUrls.views.adhoc.open
        } else if (typeOfAnalyze === appConstants.ESM_VIEW) {
            endpoint = apiUrls.views.esm.open
        }

        http.fetch(
            endpoint,
            
            http.POST,
            data,
            (res) => {
                OnAdhocViewHttpSuccessResponse(res, typeOfAnalyze)
            },
            (err) => {
                OnAdhocViewHttpFailureResponse(err)
            }
        )


    }

    function getFileCabinetHttp(repoType, cb) {

        let data = {
            'mode': 'run',
            'parentId': '',
            'repositoryType': repoType,
        };

        http.fetch(
            apiUrls.fileCabinet.getItems,
            http.POST,
            data,
            (res) => {
                google.script.run
                    .withSuccessHandler(fileTypeSuccessHandler)
                    .onGetFileCabinetSuccess(repoType, res)
            },
            (err) => console.log("Error in GetItems: ", err)
        )


        function allFetchResolved(fetchMap) {
            return Object.values(fetchMap).every(x => x)
        }

        function returnBack(files) {
            cb(files)
        }

        function fileTypeSuccessHandler(args) {
            if (args.repositoryType === 'executive') {

                let intervalId = null
                let fetchMap = args.ids.reduce((acc, id) => ({ [id]: false, ...acc }), {})

                var result = args.result

                function waitUntilFetchIsComplete() {
                    if (allFetchResolved(fetchMap)) {
                        clearInterval(intervalId)
                        return returnBack(result)
                    } else {
                        if (!intervalId) {
                            intervalId = setInterval(waitUntilFetchIsComplete, 500)
                        }
                    }

                }

                args.ids.forEach(function (id) {
                    var param = {
                        'mode': 'run',
                        'parentId': id,
                        'repositoryType': 'executive',
                        "isDroppable": true
                    }

                    http.fetch(
                        apiUrls.fileCabinet.getItems,
                        
                        http.POST,
                        param,
                        (res) => {
                            google.script.run.withSuccessHandler((data) => {
                                result = [...result, ...data]
                                fetchMap[id] = true
                            }).OnSuccessCabinets(id, res)
                        },
                        (err) => console.log("Error in GetItems: ", err)
                    )
                })

                // This will wait until all request are completed
                waitUntilFetchIsComplete()

            } else {
                returnBack(args)
            }
        }
    }


    function gsZoomOutTopLevel_HTTP(params, type) {
        google.script.run.withSuccessHandler((data) => {
            var requestPayload = {
                'id': params.id,
                'params': {
                    '{SELECTED_CELL}': {
                        'C': data.colNum,
                        'R': data.rowNum
                    },
                    'zoomOptions': {
                        parentRetention: "top",
                        symmetric: true,
                        zoomType: "root"
                    }
                },
                'state': params.state,
                'options': params.options,
                'ranges': params.ranges
            };
            http.fetch(
                apiUrls.views.adhoc.zoomOutEnhanced,
                
                http.POST,
                requestPayload,
                (res) => {
                    OnAdhocViewHttpSuccessResponse(res, type);
                },
                (err) => {
                    OnAdhocViewHttpFailureResponse(err);
                }
            )
        }).getActivelCellRowColNum();
    }


    function gsZoomOutParentLevel_HTTP(params, type) {
        google.script.run.withSuccessHandler((data) => {
            var requestPayload = {
                'id': params.id,
                'params': {
                    '{SELECTED_CELL}': {
                        'C': data.colNum,
                        'R': data.rowNum
                    }
                },
                'state': params.state,
                'options': params.options,
                'ranges': params.ranges
            };
            http.fetch(
                apiUrls.views.adhoc.zoomOut,
                
                http.POST,
                requestPayload,
                (res) => {
                    OnAdhocViewHttpSuccessResponse(res, type);
                },
                (err) => {
                    OnAdhocViewHttpFailureResponse(err);
                }
            )
        }).getActivelCellRowColNum();
    }

    function gsKeepOnly_HTTP(params, type) {
        google.script.run.withSuccessHandler((requestPayload) => {
            http.fetch(
                apiUrls.views.adhoc.keepOnly,
                http.POST,
                requestPayload,
                (res) => {
                    OnAdhocViewHttpSuccessResponse(res, type);
                },
                (err) => {
                    OnAdhocViewHttpFailureResponse(err);
                }
            )
        }).gsGetCommonInputParamsForKeepRemove(params);
    }


    function gsRemoveOnly_HTTP(params, type) {
        google.script.run.withSuccessHandler((requestPayload) => {
            http.fetch(
                apiUrls.views.adhoc.removeOnly,
                http.POST,
                requestPayload,
                (res) => {
                    OnAdhocViewHttpSuccessResponse(res, type);
                },
                (err) => {
                    OnAdhocViewHttpFailureResponse(err);
                }
            )
        }).gsGetCommonInputParamsForKeepRemove(params);
    }

    function gsZoomIn_HTTP(params, documentType, requestFor) {
        var endpoint = "";
        switch (requestFor) {
            case "children":
                endpoint = apiUrls.views.adhoc.zoomIn;
                break;
            case "allChildren":
                endpoint = apiUrls.views.adhoc.zoomInAll;
                break;
            case "dataLeaves":
                endpoint = apiUrls.views.adhoc.zoomInDataLeaves;
                break;
            case "leaves":
                endpoint = apiUrls.views.adhoc.zoomInBottom;
                break;
        }
        google.script.run.withSuccessHandler((requestPayload) => {
            http.fetch(
                endpoint,
                http.POST,
                requestPayload,
                (res) => {
                    OnAdhocViewHttpSuccessResponse(res, documentType);
                },
                (err) => {
                    OnAdhocViewHttpFailureResponse(err);
                }
            )
        }).gsGetCommonInputParamsForZoom(params);

    }

    function gsPivot_HTTP(params, documentType) {

        var requestPayload = {
            'id': params.id,
            'params': {
            },
            'state': params.state,
            'options': params.options,
            'ranges': params.ranges
        };
        http.fetch(
            apiUrls.views.adhoc.pivot,
            http.POST,
            requestPayload,
            (res) => {
                OnAdhocViewHttpSuccessResponse(res, documentType);
            },
            (err) => {
                OnAdhocViewHttpFailureResponse(err);
            }
        )
    }

    function gsPivotToRow_HTTP(params, documentType) {
        google.script.run.withSuccessHandler((activeCell) => {
            var requestPayload = {
                'id': params.id,
                'params': {
                    '{AXIS}': 'Row',
                    '{SELECTED_CELL}': {
                        'C': activeCell.colNum,
                        'R': activeCell.rowNum
                    }
                },
                'state': params.state,
                'options': params.options,
                'ranges': params.ranges
            };
            http.fetch(
                apiUrls.views.adhoc.pivot,
                http.POST,
                requestPayload,
                (res) => {
                    OnAdhocViewHttpSuccessResponse(res, documentType);
                },
                (err) => {
                    OnAdhocViewHttpFailureResponse(err);
                }
            )
        }).getActivelCellRowColNum();
    }

    function gsPivotToColumn_HTTP(params, documentType) {
        google.script.run.withSuccessHandler((activeCell) => {
            var requestPayload = {
                'id': params.id,
                'params': {
                    '{AXIS}': 'Column',
                    '{SELECTED_CELL}': {
                        'C': activeCell.colNum,
                        'R': activeCell.rowNum
                    }
                },
                'state': params.state,
                'options': params.options,
                'ranges': params.ranges
            };
            http.fetch(
                apiUrls.views.adhoc.pivot,
                http.POST,
                requestPayload,
                (res) => {
                    OnAdhocViewHttpSuccessResponse(res, documentType);
                },
                (err) => {
                    OnAdhocViewHttpFailureResponse(err);
                }
            )
        }).getActivelCellRowColNum();
    }

    function gsPivotToPage_HTTP(params, documentType) {
        google.script.run.withSuccessHandler((activeCell) => {
            var requestPayload = {
                'id': params.id,
                'params': {
                    '{AXIS}': 'Page',
                    '{SELECTED_CELL}': {
                        'C': activeCell.colNum,
                        'R': activeCell.rowNum
                    }
                },
                'state': params.state,
                'options': params.options,
                'ranges': params.ranges
            };
            http.fetch(
                apiUrls.views.adhoc.pivot,
                http.POST,
                requestPayload,
                (res) => {
                    OnAdhocViewHttpSuccessResponse(res, documentType);
                },
                (err) => {
                    OnAdhocViewHttpFailureResponse(err);
                }
            )
        }).getActivelCellRowColNum();
    }

    function gsApplyDisplay_HTTP(params, displayOption, documentType) {
        var requestPayload = {
            'id': params.id,
            'params': {},
            'state': params.state,
            'options': params.options,
            'ranges': params.ranges
        };
        let dOption = (displayOption === 1) ? "name" : "code";
        requestPayload.options.display = dOption;
        requestPayload.options.runtimeDisplayOptions.displayOption = displayOption;

        requestPayload.ranges.forEach(function (cellData) {
            var type = cellData.type;
            if (type == appConstants.RANGE_TYPE_DROPDOWN) {
                cellData.maps.display = dOption;
            }
        });
        http.fetch(
            apiUrls.views.adhoc.refresh,
            http.POST,
            requestPayload,
            (res) => {
                OnAdhocViewHttpSuccessResponse(res, documentType);
            },
            (err) => {
                OnAdhocViewHttpFailureResponse(err);
            }
        )
    }

    function gsIndentRow_HTTP(params, indentOption, documentType) {
        var requestPayload = {
            'id': params.id,
            'params': {},
            'state': params.state,
            'options': params.options,
            'ranges': params.ranges
        };
        requestPayload.options.runtimeDisplayOptions.indent = indentOption;
        http.fetch(
            apiUrls.views.adhoc.refresh,
            http.POST,
            requestPayload,
            (res) => {
                OnAdhocViewHttpSuccessResponse(res, documentType);
            },
            (err) => {
                OnAdhocViewHttpFailureResponse(err);
            }
        )
    }

    function gsApplyNumFormat_HTTP(params, format, documentType) {
        var requestPayload = {
            'id': params.id,
            'params': {},
            'state': params.state,
            'options': params.options,
            'ranges': params.ranges
        };

        requestPayload.options.runtimeDisplayOptions.format = format;
        http.fetch(
            apiUrls.views.adhoc.refresh,
            http.POST,
            requestPayload,
            (res) => {
                OnAdhocViewHttpSuccessResponse(res, documentType);
            },
            (err) => {
                OnAdhocViewHttpFailureResponse(err);
            }
        )
    }

    function gsSuppressColumn_HTTP(params, suppressOption, documentType) {
        var requestPayload = {
            'id': params.id,
            'params': {},
            'state': params.state,
            'options': params.options,
            'ranges': params.ranges
        };

        requestPayload.options.runtimeDisplayOptions.suppressColumns = suppressOption;
        http.fetch(
            apiUrls.views.adhoc.refresh,
            http.POST,
            requestPayload,
            (res) => {
                OnAdhocViewHttpSuccessResponse(res, documentType);
            },
            (err) => {
                OnAdhocViewHttpFailureResponse(err);
            }
        )
    }

    
    function gsSuppressRow_HTTP(params, suppressOption, documentType) {
        var requestPayload = {
            'id': params.id,
            'params': {},
            'state': params.state,
            'options': params.options,
            'ranges': params.ranges
        };

        requestPayload.options.runtimeDisplayOptions.suppressRows = suppressOption;
        http.fetch(
            apiUrls.views.adhoc.refresh,
            http.POST,
            requestPayload,
            (res) => {
                OnAdhocViewHttpSuccessResponse(res, documentType);
            },
            (err) => {
                OnAdhocViewHttpFailureResponse(err);
            }
        )
    }


