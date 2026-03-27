var aa = expression.getScriptRoot();

//LP Expressions
var form = expression.getValue("LP::FORM");
var lpRefSeq = expression.getValue("LP::professionalModel*licSeqNbr").value;
var licType = expression.getValue("LP::professionalModel*licensetype").value;
// License Number that the user entered or selected
var licNumObj = expression.getValue("LP::professionalModel*licensenbr");
var businessLicenseField = expression.getValue("LP::professionalModel*businessLicense");
var businessNameField = expression.getValue("LP::professionalModel*businessname");

/***** Global Variables For Accela Functions *******/
var useAppSpecificGroupName = false;
debugLevel = "1";
useLogDebug = true;
showDebug = true;
debug = "";
br = "<br>";
var currentUserID = expression.getValue("$$userID$$").value;

/***** Include Scripts *******/
// eval(getScriptText("INCLUDES_ACCELA_FUNCTIONS", null, true));
// eval(getScriptText("INCLUDES_CUSTOM", null, true));

try {

    //Business license field
    if(businessLicenseField.value || String(businessLicenseField.value).length > 0) {
        var message = [];

        var textColor = "green";

        (function() {
            try {

                var currentDate = new Date(aa.date.getCurrentDate().epochMilliseconds);
                currentDate.setHours(0,0,0,0);

                var referenceLP = grabReferenceLicenseProfessionalLocal(licNumObj.value, licType);
                if(referenceLP) {
                    var refBusinessLicenseDate = referenceLP.businessLicExpDate;
                    var refBusinessLicense = referenceLP.getBusinessLicense();
                    if(refBusinessLicenseDate && refBusinessLicense == businessLicenseField.value) {
                        var refBusinessLicenseDateJS = new Date(refBusinessLicenseDate.epochMilliseconds);
                        if(refBusinessLicenseDateJS > currentDate) {
                            message.push("<div style='color:$textColor$;'>Business License Expiration: "+  aa.util.formatDate(refBusinessLicenseDateJS, "MM/dd/yyyy") + "</div>");
                            return;
                        }
                    }
                }

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
                        logDebug("Retrying with new business license number " + businessLicenseField.value);

                        var retryData = getHDLLicenseInformation(businessLicenseField.value);
                        if(!retryData || retryData.length == 0) {
                            businessLicenseField.message = "Cannot validate business license. Please contact an administrator.";
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

                var hdlLicenseNumber = hdlData.stateLicenseNumber;
                // message.push("Contractor info: " + licType + " " + licNumObj.value);
                if(hdlLicenseNumber && licType == "Contractor") {
                    var licenseNumber = licNumObj.value;
                    if(hdlLicenseNumber != licenseNumber) {
                        message.push("Business license number does not match contractor number found on business license");
                        form.message = "Business license number does not match contractor number found on business license";
                        form.blockSubmit = true;
                        return;
                    }
                }

                // businessNameField.value = data.dba;
                var expirationDate = hdlData.currentExpireDate;
                var neededDate = expirationDate.split("T")[0];
                var dateArray = neededDate.split("-");
                var goodDate = dateArray[1] + "/" + dateArray[2] + "/" + dateArray[0];
                var expirationDateJS = new Date(goodDate);

                var formattedExpirationDate = aa.util.formatDate(expirationDateJS, "MM/dd/yyyy");
                message.push("<div style='color:$textColor$;'>Business License Expiration: "+  formattedExpirationDate + "</div>");
                if(expirationDateJS <= currentDate) {
                    textColor = "red";
                    message.push("Business license has expired");
                    form.message = "Business license has expired";
                    form.blockSubmit = true;
                }

                if(referenceLP && textColor != "red") {
                    referenceLP.setBusinessLicense(businessLicenseField.value);
                    referenceLP.setBusinessLicExpDate(aa.date.parseDate(goodDate));
                    var updateResult = aa.licenseScript.editRefLicenseProf(referenceLP);
                    if (updateResult.getSuccess()) {
                        logDebug("Updated refrence date with data from HDL.");
                    } else {
                        logDebug("Unable to update LP " + updateResult.getErrorType() + " : " + updateResult.getErrorMessage());
                    }
                }

            } catch (err) {
                businessLicenseField.message = "Error checking HDL: " + err + " " + err.lineNumber;
                licNumObj.message = "";
            }
        })();
        // message.push(debug);
        if(message.length > 0) {
            businessLicenseField.message = message.join("<BR>\n").replace("$textColor$", textColor);
        }
        expression.setReturn(businessLicenseField);
        expression.setReturn(form);
        expression.setReturn(licNumObj);
    }

} catch (error) {
    businessLicenseField.message = error.message + " ln: "  + error.lineNumber;
    expression.setReturn(businessLicenseField);
}

function getHDLLicenseInformation(businessLicenseNum) {
    var passwordEncoded = getHDLPassword();

    if(!passwordEncoded) {
        logDebug("API call failed");
        return false;
    }

    var standardChoiceBase = "HDL_INTERFACE";
    var baseEndpoint = lookup(standardChoiceBase, "BASE_ENDPOINT");
    var accountSearchRoute = lookup(standardChoiceBase, "POST_LICENSE_NUMBER_ROUTE");

    var endpoint = baseEndpoint + accountSearchRoute + businessLicenseNum;
    var headers = aa.httpClient.initPostParameters();
    headers.put("Authorization", "Basic " + passwordEncoded);
    var response = aa.httpClient.get(endpoint, headers);
    /*
        {
            "dba": "AJW CONSTRUCTION",
            "corporateName": "",
            "locationAddressLine1": "966 81ST AVE",
            "locationAddressLine2": "OAKLAND, CA 94621-2512",
            "mailingAddressLine1": "966 81ST AVE",
            "mailingAddressLine2": "OAKLAND, CA 94621-2512",
            "businessStatus": "Closed",
            "licenseStatus": "Closed",
            "accountNumber": "04504265",
            "licenseNumber": "22771",
            "phone1": "(123) 456-7890",
            "phone2": "",
            "phone3": "",
            "fax": "",
            "startDate": "2000-07-11T00:00:00",
            "closeDate": "2023-12-31T00:00:00",
            "ownershipType": "Corporation",
            "currentExpireDate": "2023-12-31T00:00:00",
            "rates": [
                "Contractor"
            ],
            "successMessage": "Successfully executed API!",
            "errorMessage": null
        }
    */
    var data = response.getOutput();
    if(!data) {
        return false;
    }
    logDebug("Data: " + data);
    if(String(data).trim().length == 0) {
        logDebug("No data returned from API");
        return false;
    }
    try {
        var jsonData = JSON.parse(data);
        return jsonData;
    } catch (err) {
        logDebug("Error parsing HDL data " + err);
    }
    return false;
}

function getHDLPassword() {

    var standardChoiceBase = "HDL_INTERFACE";
    var hdlEncodedPassword = "";

    var baseEndpoint = lookup(standardChoiceBase, "BASE_ENDPOINT");
    var apiKey = lookup(standardChoiceBase, "API_KEY");
    var apiPassword = lookup(standardChoiceBase, "API_PASSWORD");

    var pingRoute = lookup(standardChoiceBase, "GET_PING_ROUTE");
    var response = aa.httpClient.get(baseEndpoint + pingRoute);
    var responseOutput = response.getOutput();
    if(!responseOutput) {
        logDebug("HDL Interface is down");
        return;
    }

    var ipRoute = lookup(standardChoiceBase, "GET_IP_ROUTE");
    var accelaBizIp = "";
    var response = aa.httpClient.get(baseEndpoint + ipRoute);
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
    var response = aa.httpClient.get(baseEndpoint + base64Route + apiKey + ":" + apiPassword);
    var responseOutput = response.getOutput();
    if(responseOutput) {
        hdlEncodedPassword = JSON.parse(responseOutput)[0];
    }
    return hdlEncodedPassword;
}

function logDebug(str) {
    debug += str + "<BR>";
}

function lookup(stdChoice,stdValue)
{
    var strControl;
    var bizDomScriptResult = aa.bizDomain.getBizDomainByValue(stdChoice,stdValue);

    if (bizDomScriptResult.getSuccess())
    {
        var bizDomScriptObj = bizDomScriptResult.getOutput();
        var strControl = "" + bizDomScriptObj.getDescription(); // had to do this or it bombs.  who knows why?
        logDebug("lookup(" + stdChoice + "," + stdValue + ") = " + strControl);
    }
    else
    {
        logDebug("lookup(" + stdChoice + "," + stdValue + ") does not exist");
    }
    return strControl;
}

function grabReferenceLicenseProfessionalLocal(licenseNumber, licenseType) {
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
    var firstReferenceFound = false;
    for (var refLpIndex in referenceLpArray) {
        var refLPObject = referenceLpArray[refLpIndex];
        var refLPType = refLPObject.licenseType;
        var auditStatus = refLPObject.auditStatus;
        if(auditStatus == "A") {
            if(licenseType && refLPType == licenseType) {
                return refLPObject;
            }
        }
    }
    if(referenceLpArray[0]) {
        firstReferenceFound = referenceLpArray[0];
    }
    return firstReferenceFound;
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