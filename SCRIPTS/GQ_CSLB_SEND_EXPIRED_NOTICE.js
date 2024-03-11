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
//     {
//         lpRefId: 20002141607,
//         record: "EBIN-24-0002",
//         toAddress: "sal@grayquarter.com",
//         ccAddress: "sal@grayquarter.com",
//         parameters: {
//             licNum: 1026774,
//             expiredData: "You have bad data \nThis is a test",
//             businessName: "Taco Business",
//             altId: "EBIN-24-0002",
//         }
//     }
// ]
// aa.env.setValue("emailData", JSON.stringify(data));

try {

    var notificationData = aa.env.getValue("emailData");
    if(notificationData) {
        notificationData = JSON.parse(notificationData);
        aa.print("Notifying " + notificationData.length);
        notificationData.forEach(function (emailObj) {
            var lpRefId = emailObj.lpRefId;
            var emailParams = aa.util.newHashtable();
            var parameters = emailObj.parameters;
            for(var prop in parameters) {
                var value = parameters[prop];
                var paramKey = "$$" + prop + "$$";
                emailParams.put(paramKey, String(value));
            }
            var capId = aa.cap.getCapID(emailObj.record).getOutput();
            var conditionResult = addRefLPConditionBySeq(lpRefId, "Engineering", "Contractor CSLB Information Expired", parameters.expiredData, "Notice", "Not Met");
            aa.print("Condition added: " + conditionResult);
            var emailResult = sendNotification("", emailObj.toAddress, emailObj.ccAddress, "ENG_CSLB_EXPIRED_CONTRACTOR_INFO", emailParams, [], capId);
            aa.print("Email sent: " + emailResult);
        })
    }

    // aa.print(debug);

} catch (err) {
    aa.print(err + " " + err.lineNumber);
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