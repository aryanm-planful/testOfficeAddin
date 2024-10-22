    function openReportHttp(id, text, typeOfReport, pt2pxMultiplier) {
        // let pt2pxConverter = pt2pxMultiplier;
        let payload = {}
        let endpoint = ""

        if (typeOfReport == appConstants.EXECUTIVE_REPORT) {
            payload = {
                "id": id,
                "params": {
                    "{SELECTED_DROPDOWNS}": {
                        "name": text
                    }
                }
            }

            endpoint = apiUrls.reports.open
        }
        else if (typeOfReport == appConstants.SNAPSHOT_REPORT) {
            payload = {
                "params": {
                    "snapshotId": id
                }
            }

            endpoint = apiUrls.snapshot.open
        }

        // console.time("Opening Report [Server]: ")
        http.fetch(
            endpoint,
            http.POST,
            payload,
            (res) => {

                OnReportHttpSuccessResponse(res, typeOfReport)
            },
            (err) => {
                OnReportHttpFailureResponse(err)
            }
        )
    }

    function refreshReportHttp({ data, type }) {
        let endpoint = ""
        if (type === appConstants.EXECUTIVE_REPORT) {
            endpoint = apiUrls.reports.open
        } else if (type === appConstants.SNAPSHOT_REPORT) {
            endpoint = apiUrls.snapshot.open
        }
        http.fetch(
            endpoint,
            http.POST,
            data,
            (res) => {
                OnReportHttpSuccessResponse(res, type)
            },
            (err) => {
                OnReportHttpFailureResponse(err)
            }
        );
    }

