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

eval('function logDebug(msg) { debug += msg + "<BR>"; }');

// var data = [
//     {
//         email: "sguerrero@govpath.tech",
//         altId: "EBIN-25-0006"
//     }
// ]
// aa.env.setValue("pinsData", JSON.stringify(data));
// slackLocal("Executed GQ_PINS_NOTIFY_CONTRACTOR");
try {

    var pinsData = aa.env.getValue("pinsData");
    logDebug("Pins Data: " + pinsData);
    if(pinsData) {
        pinsData = JSON.parse(pinsData);
        logDebug("Notifying " + pinsData.length);
        // slackLocal("Pins Data: " + pinsData.length);
        capId = aa.cap.getCapID(pinsData[0].altId).getOutput();
        var emailParams = aa.util.newHashtable();
        emailParams.put("$$altId$$", String(capId.getCustomID()));
        pinsData.forEach(function (data) {
            var email = data["email"];
            sendNotification("", email, "", "PINS_DOCS_REQUIRED", emailParams, []);
        })
        updateTask("Plans Coordination", "Waiting for Insurance", "", "");
    }

} catch (err) {
    logDebug(err + " " + err.lineNumber);
    slackLocal(err + " " + err.lineNumber);
}
slackLocal(debug);

aa.env.setValue("ScriptReturnCode", "0");
aa.env.setValue("ScriptReturnMessage", debug);

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