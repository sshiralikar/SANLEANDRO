/***** Global Variables For Accela Functions *******/
var useAppSpecificGroupName = false
debugLevel = "1"
useLogDebug = true;
showDebug = true;
message = ""
debug = ""
br = "<br>"
currentUserID = "ADMIN";
sysDate = aa.date.getCurrentDate();
systemUserObj = aa.person.getUser("ADMIN").getOutput();
capId = null;

/***** Include Scripts *******/
eval(getScriptText("INCLUDES_ACCELA_FUNCTIONS", null, false));
eval(getScriptText("INCLUDES_CUSTOM", null, false));
// aa.print("Script 1 " + getScriptText("INCLUDES_ACCELA_FUNCTIONS", null, false));
// aa.print("Script 2 " + getScriptText("INCLUDES_CUSTOM", null, false));

// var data = [
//      {
//          licNum: String(licNum),
//          pinsId: String(insuredObj.id)
//      }
// ]
// aa.env.setValue("pinsData", JSON.stringify(data));
slackLocal("Executed GQ_PINS_UPDATE_REFERENCE_CONTRACTOR");
try {

    var pinsData = aa.env.getValue("pinsData");
    slackLocal("Pins Data: " + pinsData);
    if(pinsData) {
        pinsData = JSON.parse(pinsData);
        aa.print("Updating " + pinsData.length);
        slackLocal("Pins Data: " + pinsData.length);
        pinsData.forEach(function (pinsObj) {
            var licNum = pinsObj.licNum;
            var pinsId = pinsObj.pinsId;
            updateLPAttribute(licNum, "PINS Reference ID", pinsId);
            slackLocal(licNum + " updated: " + pinsId);
        })
    }

} catch (err) {
    aa.print(err + " " + err.lineNumber);
    slackLocal(err + " " + err.lineNumber);
}


function getScriptText(vScriptName) {
    var servProvCode = aa.getServiceProviderCode();
    vScriptName = vScriptName.toUpperCase();
    var emseBiz = aa.proxyInvoker.newInstance("com.accela.aa.emse.emse.EMSEBusiness").getOutput();
    try {
        var emseScript = emseBiz.getScriptByPK(servProvCode, vScriptName, "ADMIN");
        return emseScript.getScriptText() + "";
    } catch (err) {
        aa.print(err + " " + err.lineNumber);
        return "";
    }
}

function updateLPAttribute(licNum, attributeField, attributeValue) {
    var refLp = grabReferenceLicenseProfessional(licNum);
    if(!refLp) {
        logDebug("Reference lp does not exist " + licNum + " can't update");
        return false;
    }

    var attributes = refLp.attributes;
    if(attributes) {
        var keySet = attributes.keySet().toArray();
        for(var i in keySet) {
            var key = keySet[i];
            var peopleAttributeModel = attributes.get(key);
            var iterator = peopleAttributeModel.iterator();
            while(iterator.hasNext()) {
                var attributeObj = iterator.next();
                var attrLabel = String(attributeObj.attributeName).toUpperCase();
                if(attrLabel == String(attributeField).toUpperCase()) {
                    logDebug("Setting " + attrLabel + " to " + attributeValue);
                    attributeObj.setAttributeValue(attributeValue);
                }
            }
        }
    }
    var updateResult = aa.licenseScript.editRefLicenseProf(refLp);
    if (updateResult.getSuccess()) {
        logDebug("Updated attribute");
        return true;
    } else {
        logDebug("Unable to update attribute on LP " + updateResult.getErrorType() + " : " + updateResult.getErrorMessage());
        return false;
    }
}

function grabReferenceLicenseProfessional(licenseNumber) {
	var refLicenseResult = aa.licenseScript.getRefLicensesProfByLicNbr(aa.getServiceProviderCode(), licenseNumber);
	if (!refLicenseResult.getSuccess()) {
        logDebug("Failed to get reference license professional " + refLicenseResult.getErrorType() + " : " + refLicenseResult.getErrorMessage());
        return false;
    }
    var referenceLpArray = refLicenseResult.getOutput();
    if(!referenceLpArray) {
        logDebug("Reference LP Array returned null");
        return false;
    }
    for (var refLpIndex in referenceLpArray) {
        var refLPObject = referenceLpArray[refLpIndex];
        var auditStatus = refLPObject.auditStatus;
        if(auditStatus == "A") {
            return refLPObject;
        }
    }
    return false;
}

function slackLocal(msg) {

    if(msg.indexOf("<BR>") >= 0) {
        msg = msg.replace(/<BR>/g, "\n");
    }

    var headers=aa.util.newHashMap();

    headers.put("Content-Type","application/json");

    var body = {};
    body.text = aa.getServiceProviderCode() + ":" + "SUPP" + ": " + msg;

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