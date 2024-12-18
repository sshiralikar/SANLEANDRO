try {

    var parcels = aa.parcel.getParcelByCapId(capId, null).getOutput();
    parcels = parcels.toArray();
    var pciValue = 0;
    var pciField = "PCI_EXTRAPOLATED";
    for(var i in parcels) {
        var parcelObj = parcels[i];
        var parcelNum = parcelObj.parcelNumber;
        logDebug(parcelNum);

        var endpoint = "https://services.arcgis.com/nFaSPZoTjS78xXjw/ArcGIS/rest/services/Parcels/FeatureServer/1/query?where=APNGIS='{parcelNum}'&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&resultType=none&distance=0.0&units=esriSRUnit_Meter&relationParam=&returnGeodetic=false&outFields=*&returnGeometry=true&returnCentroid=false&returnEnvelope=false&featureEncoding=esriDefault&multipatchOption=xyFootprint&maxAllowableOffset=&geometryPrecision=&outSR=&defaultSR=&datumTransformation=&applyVCSProjection=false&returnIdsOnly=false&returnUniqueIdsOnly=false&returnCountOnly=false&returnExtentOnly=false&returnQueryGeometry=false&returnDistinctValues=false&cacheHint=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&having=&resultOffset=&resultRecordCount=&returnZ=false&returnM=false&returnTrueCurves=false&returnExceededLimitFeatures=true&quantizationParameters=&sqlFormat=none&f=pjson&token="
        var encodedURL = encodeURI(endpoint.replace("{parcelNum}", String(parcelNum)));
        logDebug(encodedURL);
        var response = aa.httpClient.get(encodedURL);
        if(!response.getOutput()) {
            logDebug("No data returned from GIS call");
            continue;
        }
        var data = JSON.parse(response.getOutput());
        if(!data) {
            logDebug("No data parsed");
            continue;
        }
        var features = data.features[0];
        if(!features) {
            logDebug("No features returned!");
            continue;
        }
        var geometry = features.geometry;
        if(!geometry) {
            logDebug("No geometry returned!");
            continue;
        }

        //%7B%22rings%22%3A%5B%5B%5B6086056.86800948%2C2090093.32997257%5D%2C%5B6086001.17094238%2C2090075.20107181%5D%2C%5B6085951.53783955%2C2090227.53705323%5D%2C%5B6086007.24901421%2C2090245.61510105%5D%2C%5B6086056.86800948%2C2090093.32997257%5D%5D%5D%7D
        endpoint = "https://services.arcgis.com/nFaSPZoTjS78xXjw/ArcGIS/rest/services/PavementConditionIndex/FeatureServer/0/query?where=&fullText=&objectIds=&time=&geometry={geometry}&geometryType=esriGeometryPolygon&inSR=&spatialRel=esriSpatialRelIntersects&resultType=none&distance=10.0&units=esriSRUnit_Meter&relationParam=&returnGeodetic=false&outFields=*&returnGeometry=true&returnEnvelope=false&featureEncoding=esriDefault&multipatchOption=xyFootprint&maxAllowableOffset=&geometryPrecision=&outSR=&defaultSR=&datumTransformation=&applyVCSProjection=false&returnIdsOnly=false&returnUniqueIdsOnly=false&returnCountOnly=false&returnExtentOnly=false&returnQueryGeometry=false&returnDistinctValues=false&cacheHint=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&having=&resultOffset=&resultRecordCount=&returnZ=false&returnM=false&returnTrueCurves=false&returnExceededLimitFeatures=true&quantizationParameters=&sqlFormat=none&f=pjson&token="
        encodedURL = encodeURI(endpoint.replace("{geometry}", JSON.stringify(geometry)));
        logDebug(encodedURL);
        var response = aa.httpClient.get(encodedURL);
        if(!response.getOutput()) {
            logDebug("No data returned from GIS call");
            continue;
        }
        var data = JSON.parse(response.getOutput());
        if(!data) {
            logDebug("No data parsed");
            continue;
        }
        var features = data.features[0];
        if(!features) {
            logDebug("No features returned!");
            continue;
        }
        var attributes = features.attributes;
        if(!attributes) {
            logDebug("No attributes returned!");
            continue;
        }
        logDebug(pciField + " : " + attributes[pciField]);
        if(attributes[pciField]) {
            pciValue = attributes[pciField];
        }
    }

    editAppSpecific("Pavement Condition Index", pciValue, capId);
    var pciGrades = [];
    var flagForRestoration = false;

    if(pciValue > 85) {
        var restorationText = "PCI is greater than 85 and will require a larger area of restoration";
        var workDescResult = aa.cap.getCapWorkDesByPK(capId);
        if (workDescResult.getSuccess()) {
            var workDesScriptObj = workDescResult.getOutput();
            if (workDesScriptObj) {
                workDesObj = workDesScriptObj.getCapWorkDesModel();
                var currentWorkDescription = workDesObj.getDescription();
                var newWorkDes = (currentWorkDescription ? currentWorkDescription : "") + "\n\n" + restorationText;
                workDesObj.setDescription(newWorkDes);
                var result = aa.cap.editCapWorkDes(workDesObj);
                if(result.getSuccess()) {
                    logDebug("Successfully updated work description to " + newWorkDes);
                } else {
                    logDebug("Failed to update work description: " + result.getErrorType() + " " + result.getErrorMessage());
                }
                addStdCondition("Engineering", "High PCI Grade", capId);
            }
        }
    }
} catch (err) {
    slackError("Error with PCI call for GIS " + err + " " + err.lineNumber);
    slackError(debug);
}

function slackError(msg) {

    if(msg.indexOf("<BR>") >= 0) {
        msg = msg.replace(/<BR>/g, "\n");
    }

    var headers=aa.util.newHashMap();

    headers.put("Content-Type","application/json");

    var body = {};
    body.text = aa.getServiceProviderCode() + ":" + "TEST" + ": " + msg;

    //GQ Slack
    // var SLACKURL = "https://hooks.slack.com/services/";
    // SLACKURL = SLACKURL + "T5BS1375F/";
    // SLACKURL = SLACKURL + "BG09GQ3RS/NUs694ouyawHoAFK4jJXwn1p";

    //Your slack
    var SLACKURL = "https://hooks.slack.com/services/";
    SLACKURL = SLACKURL + "T02GGPNQ6DN/";
    SLACKURL = SLACKURL + "B02G5QX2649/jcb5fbduFzmtCvjLg1cfKEaQ";

    var apiURL = SLACKURL;  // from globals
    var result = aa.httpClient.post(apiURL, headers, JSON.stringify(body));

    if (!result.getSuccess()) {
        logDebug("Slack get anonymous token error: " + result.getErrorMessage());
    } else {
        aa.print("Slack Results: " + result.getOutput());
    }
}