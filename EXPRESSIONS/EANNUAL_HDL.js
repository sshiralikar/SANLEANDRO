var aa = expression.getScriptRoot();

//ASI Expressions
var form = expression.getValue("ASI::FORM");
var businessLicenseField = expression.getValue("ASI::ANNUAL::Business License");

try {

    /***** Global Variables For Accela Functions *******/
    var useAppSpecificGroupName = false
    debugLevel = "1"
    useLogDebug = true;
    showDebug = true;
    message = ""
    debug = ""
    br = "<br>"
    var currentUserID = expression.getValue("$$userID$$").value;

    /***** Include Scripts *******/
    eval(getScriptText("INCLUDES_ACCELA_FUNCTIONS", null, true));
    eval(getScriptText("INCLUDES_CUSTOM", null, true));

    //Business license field

    if(businessLicenseField.value) {
        var message = [];

        (function() {
            try {

                var hdlData = getHDLLicenseInformation(businessLicenseField.value);
                if(!hdlData) {
                    businessLicenseField.message = "Cannot validate business license. Please contact an administrator.";
                    return;
                }

                //return first result
                if(hdlData.length > 0) {
                    hdlData = hdlData[0];
                }

                var failedValidation = false;
                if(!hdlData.successMessage) {

                    //failed initial validation
                    failedValidation = true;

                    //if it's missing a 0 let's try adding it
                    if(!(String(businessLicenseField.value)[0] == "0")) {

                        var tempLicenseNum = businessLicenseField.value;
                        businessLicenseField.value = "0" + businessLicenseField.value;

                        var retryData = getHDLLicenseInformation(businessLicenseField.value);
                        if(!retryData) {
                            // businessLicenseField.message = "Cannot validate business license. Please contact an administrator.";
                            businessLicenseField.value = tempLicenseNum;
                        } else {
                            //return first result
                            if(retryData.length > 0) {
                                retryData = retryData[0];
                                if(retryData.successMessage) {
                                    failedValidation = false;
                                    hdlData = retryData;
                                } else {
                                    businessLicenseField.value = tempLicenseNum;
                                }
                            } else {
                                businessLicenseField.value = tempLicenseNum;
                            }
                        }
                    }
                }

                if(failedValidation) {
                    var errorMessage = "Invalid business license number";
                    businessLicenseField.message = errorMessage;
                    form.message = errorMessage;
                    form.blockSubmit = true;
                    return;
                }

                // businessNameField.value = data.dba;
                var expirationDate = hdlData.currentExpireDate;
                var neededDate = expirationDate.split("T")[0];
                var dateArray = neededDate.split("-");
                var goodDate = dateArray[1] + "/" + dateArray[2] + "/" + dateArray[0];
                var expirationDateJS = new Date(goodDate);
                var compareDate = new Date();
                compareDate.setHours(0,0,0,0);

                var formattedExpirationDate = aa.util.formatDate(expirationDateJS, "MM/dd/yyyy");
                message.push("Business License Expiration: "+  formattedExpirationDate);
                if(expirationDateJS <= compareDate) {
                    message.push("Business license has expired");
                    form.message = "Business license has expired";
                    form.blockSubmit = true;
                }
            } catch (err) {
                businessLicenseField.message = "Error checking HDL: " + err + " " + err.lineNumber;
            }
        })();
        // message.push(debug);
        businessLicenseField.message = message.join("<BR>\n");
        expression.setReturn(businessLicenseField);
        expression.setReturn(form);
    }

} catch (error) {
    form.message = error.message + " ln: "  + error.lineNumber;
    expression.setReturn(form);
}

function getHDLPassword() {

    var standardChoiceBase = "HDL_INTERFACE";
    var hdlEncodedPassword = "";

    var baseEndpoint = lookup(standardChoiceBase, "BASE_ENDPOINT");
    var apiKey = lookup(standardChoiceBase, "API_KEY");
    var apiPassword = lookup(standardChoiceBase, "API_PASSWORD");

    var pingRoute = lookup(standardChoiceBase, "GET_PING_ROUTE");
    var response = client.get(baseEndpoint + pingRoute);
    var responseOutput = response.getOutput();
    if(!responseOutput) {
        logDebug("HDL Interface is down");
        return;
    }

    var ipRoute = lookup(standardChoiceBase, "GET_IP_ROUTE");
    var accelaBizIp = "";
    var response = client.get(baseEndpoint + ipRoute);
    var responseOutput = response.getOutput();
    if(!responseOutput) {
        logDebug("HDL IP Route is down");
        return;
    }

    try {
        responseOutput = JSON.parse(responseOutput);
        accelaBizIp = responseOutput[0];
    } catch (err) {
        logDebug("Error getting IP: " + err);
    }
    logDebug(accelaBizIp);

    var base64Route = lookup(standardChoiceBase, "GET_BASE64_ROUTE");
    var response = client.get(baseEndpoint + base64Route + apiKey + ":" + apiPassword);
    var responseOutput = response.getOutput();
    if(responseOutput) {
        hdlEncodedPassword = JSON.parse(responseOutput)[0];
    }
    return hdlEncodedPassword;
}

function getScriptText(vScriptName, servProvCode, useProductScripts) {
	if (!servProvCode)  servProvCode = aa.getServiceProviderCode();
	vScriptName = vScriptName.toUpperCase();
	var emseBiz = aa.proxyInvoker.newInstance("com.accela.aa.emse.emse.EMSEBusiness").getOutput();
	try {
		if (useProductScripts) {
			var emseScript = emseBiz.getMasterScript(aa.getServiceProviderCode(), vScriptName);
		} else {
			var emseScript = emseBiz.getScriptByPK(aa.getServiceProviderCode(), vScriptName, "ADMIN");
		}
		return emseScript.getScriptText() + "";
	} catch (err) {
		return "";
	}
}