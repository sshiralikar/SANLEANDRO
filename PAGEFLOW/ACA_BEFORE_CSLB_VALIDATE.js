/*------------------------------------------------------------------------------------------------------/
| Program : ACA_BEFORE_CSLB_VALIDATE.js
| Event   : ACA Before (Before)
|
| Usage   : On pageflow with lp list, CSLB will be called and validate the LP before allowing the applicant to proceed
|
| Client  : San Leandro
| Action# : N/A
|
| Notes   :
|
/------------------------------------------------------------------------------------------------------*/
var showMessage = false; // Set to true to see results in popup window
var showDebug = false; // Set to true to see debug messages in popup window
var useAppSpecificGroupName = false; // Use Group name when populating App Specific Info Values
var useTaskSpecificGroupName = false; // Use Group name when populating Task Specific Info Values
var cancel = false;
var useCustomScriptFile = true; // if true, use Events->Custom Script, else use Events->Scripts->INCLUDES_CUSTOM
/*------------------------------------------------------------------------------------------------------/
| END User Configurable Parameters
/------------------------------------------------------------------------------------------------------*/
var startDate = new Date();
var startTime = startDate.getTime();
var message = ""; // Message String
var debug = ""; // Debug String
var br = "<BR>"; // Break Tag

var useSA = false;
var SA = null;
var SAScript = null;
var bzr = aa.bizDomain.getBizDomainByValue("MULTI_SERVICE_SETTINGS", "SUPER_AGENCY_FOR_EMSE");
if (bzr.getSuccess() && bzr.getOutput().getAuditStatus() != "I") {
    useSA = true;
    SA = bzr.getOutput().getDescription();
    bzr = aa.bizDomain.getBizDomainByValue("MULTI_SERVICE_SETTINGS", "SUPER_AGENCY_INCLUDE_SCRIPT");
    if (bzr.getSuccess()) {
        SAScript = bzr.getOutput().getDescription();
    }
}

if (SA) {
    eval(getScriptText("INCLUDES_ACCELA_FUNCTIONS", SA, useCustomScriptFile));
    eval(getScriptText(SAScript, SA));
} else {
    eval(getScriptText("INCLUDES_ACCELA_FUNCTIONS", null, useCustomScriptFile));
}

eval(getScriptText("INCLUDES_CUSTOM", null, useCustomScriptFile));

function getScriptText(vScriptName, servProvCode, useProductScripts) {
    if (!servProvCode)
        servProvCode = aa.getServiceProviderCode();
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

//TESTING
// var testingCap = aa.cap.getCapID("24TMP-000419").getOutput();
// var capModel = aa.cap.getCapViewBySingle4ACA(testingCap);
// var capTest = aa.env.setValue("CapModel", capModel);
// aa.env.setValue("CurrentUserID", "ADMIN");
//

var cap = aa.env.getValue("CapModel");
var capId = cap.getCapID();
var servProvCode = capId.getServiceProviderCode() // Service Provider Code
    var publicUser = false;
var currentUserID = aa.env.getValue("CurrentUserID");
var publicUserID = aa.env.getValue("CurrentUserID");
if (currentUserID.indexOf("PUBLICUSER") == 0) {
    currentUserID = "ADMIN";
    publicUser = true
} // ignore public users
var capIDString = capId.getCustomID(); // alternate cap id string
var systemUserObj = aa.person.getUser(currentUserID).getOutput(); // Current User Object
var appTypeResult = cap.getCapType();
var appTypeString = appTypeResult.toString(); // Convert application type to string ("Building/A/B/C")
var appTypeArray = appTypeString.split("/"); // Array of application type string
var currentUserGroup;
var currentUserGroupObj = aa.userright.getUserRight(appTypeArray[0], currentUserID).getOutput()
if (currentUserGroupObj)
    currentUserGroup = currentUserGroupObj.getGroupName();
var capName = cap.getSpecialText();
var capStatus = cap.getCapStatus();
var sysDate = aa.date.getCurrentDate();
var sysDateMMDDYYYY = dateFormatted(sysDate.getMonth(), sysDate.getDayOfMonth(), sysDate.getYear(), "");
var parcelArea = 0;

var estValue = 0;
var calcValue = 0;
var feeFactor // Init Valuations
var valobj = aa.finance.getContractorSuppliedValuation(capId, null).getOutput(); // Calculated valuation
if (valobj.length) {
    estValue = valobj[0].getEstimatedValue();
    calcValue = valobj[0].getCalculatedValue();
    feeFactor = valobj[0].getbValuatn().getFeeFactorFlag();
}

var balanceDue = 0;
var houseCount = 0;
feesInvoicedTotal = 0; // Init detail Data
var capDetail = "";
var capDetailObjResult = aa.cap.getCapDetail(capId); // Detail
if (capDetailObjResult.getSuccess()) {
    capDetail = capDetailObjResult.getOutput();
    var houseCount = capDetail.getHouseCount();
    var feesInvoicedTotal = capDetail.getTotalFee();
    var balanceDue = capDetail.getBalance();
}

var AInfo = new Array(); // Create array for tokenized variables
loadAppSpecific4ACA(AInfo); // Add AppSpecific Info
//loadTaskSpecific(AInfo);						// Add task specific info
//loadParcelAttributes(AInfo);						// Add parcel attributes
loadASITables();

logDebug("<B>EMSE Script Results for " + capIDString + "</B>");
logDebug("capId = " + capId.getClass());
logDebug("cap = " + cap.getClass());
logDebug("currentUserID = " + currentUserID);
logDebug("currentUserGroup = " + currentUserGroup);
logDebug("systemUserObj = " + systemUserObj.getClass());
logDebug("appTypeString = " + appTypeString);
logDebug("capName = " + capName);
logDebug("capStatus = " + capStatus);
logDebug("sysDate = " + sysDate.getClass());
logDebug("sysDateMMDDYYYY = " + sysDateMMDDYYYY);
logDebug("parcelArea = " + parcelArea);
logDebug("estValue = " + estValue);
logDebug("calcValue = " + calcValue);
logDebug("feeFactor = " + feeFactor);

logDebug("houseCount = " + houseCount);
logDebug("feesInvoicedTotal = " + feesInvoicedTotal);
logDebug("balanceDue = " + balanceDue);

// page flow custom code begin

try {

    var showDebug = false;

    var lpList = cap.licenseProfessionalList;
    if(lpList && lpList.toArray) {
        lpList = lpList.toArray();
        var cslbErrors = [];
        var hdlErrors = [];
        logDebug("LPS total: " + lpList.length);

        var classificationRequirements = lookup("ENG_CONTRACTOR_CLASS_REC_TYPES", appTypeString);
        aa.print("Classifications required: " + classificationRequirements);
        if(classificationRequirements) {
            var classTypeMap = {};
            validClasses = classificationRequirements.split(",");
            for(var validClassIndex in validClasses) {
                var stdClass = String(validClasses[validClassIndex]).toUpperCase().trim();
                if(!classTypeMap[stdClass]) {
                    classTypeMap[stdClass] = true;
                }
            }
        }
        var foundCorrectClassification = false;

        for(var lpIndex in lpList) {
            var lpObj = lpList[lpIndex];
            var licType = lpObj.licenseType;
            var licNum = lpObj.licenseNbr;
            // props(lpObj);
            // logDebug(licNum + " : " + licType);

            var businessLicense = lpObj.businessLicense;
            if(businessLicense && licType == "Contractor") {
                (function () {
                    var hdlData = getHDLLicenseInformation(businessLicense);
                    // props(hdlData);
                    if(!hdlData) {
                        hdlErrors.push(licNum + ": Cannot validate business license. Please contact an administrator.");
                        return;
                    }
                    if(!hdlData.successMessage) {
                        hdlErrors.push(licNum + ": Invalid business license number. Make sure to include the '0' at the beginning of the license number");
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
                    logDebug("Business License Status: " + hdlData.licenseStatus);
                    logDebug("Expiration: " + formattedExpirationDate);
                    if(expirationDateJS <= compareDate) {
                        hdlErrors.push(licNum + ": Business license " + businessLicense + " has expired " + formattedExpirationDate);
                    }
                })();
            }

            if(licType == "Contractor") {
                var refLpModel = grabReferenceLicenseProfessional(licNum);
                var hasOverride = false;
                if(refLpModel) {
                    var lpRefId = refLpModel.licSeqNbr;
                    hasOverride = checkRefLPConditionsBySeq(lpRefId, "CSLB Override");
                }
                if(hasOverride) {
                    logDebug("No longer blocking due to override on reference LP");
                    continue;
                }
                var cslbResults = validateLPWithCSLB(licNum, null, true, true, false, true, appTypeString);
                var classErrors = [];
                for(var i in cslbResults) {
                    var cslbResult = cslbResults[i];
                    if(classificationRequirements && !foundCorrectClassification) {
                        var cslbData = cslbResult.cslbData;
                        classificationList = cslbData.Classifications;
                        for (var classificationIndex = 0; classificationIndex < classificationList.length; classificationIndex++) {
                            var classification = String(classificationList[classificationIndex]).toUpperCase().trim();
                            aa.print(classification);
                            if(classTypeMap[classification]) {
                                foundCorrectClassification = true;
                                classErrors = [];
                                break;
                            }
                        }
                        if(!foundCorrectClassification) {
                            classErrors.push("License Professional: " + licNum + " is not valid, " + appTypeString + " requires at least one of following classifications: "  + validClasses.join(", ") + ". Found " + classificationList.join(", ") + ".");
                        }
                    }
                    var cslbValidationResults = cslbResult.messages;
                    if(cslbValidationResults.length > 0) {
                        cslbErrors.push(cslbValidationResults.join("<BR>"));
                    }
                }
                if(classErrors.length > 0) {
                    logDebug("Adding: " + classErrors.length + " to errored list");
                    cslbErrors.push(classErrors.join("<BR>"));
                }
            }
        }
        if(cslbErrors.length > 0)  {
            showMessage = true;
            comment(cslbErrors.join("<br>"));
            comment("If you feel that this has been flagged incorrectly, please email the City of San Leandro for further instructions ETPermits@SanLeandro.org");
            cancel = true;
        }
        if(hdlErrors.length > 0) {
            showMessage = true;
            comment(hdlErrors.join("<br>"));
            comment("If you need further assistance, you are welcome to contact us at sanleandro@hdlgov.com or by phone at (510) 809-3133.")
            cancel = true;
        }
    }

    aa.print(message);

} catch (err) {
    logDebug(err);
    showMessage = true;
    comment("Error: " + err);
    aa.print(err)
}
// page flow custom code end


if (debug.indexOf("**ERROR") > 0) {
    aa.env.setValue("ErrorCode", "1");
    aa.env.setValue("ErrorMessage", debug);
} else {
    if (cancel) {
        aa.env.setValue("ErrorCode", "-2");
        if (showMessage)
            aa.env.setValue("ErrorMessage", message);
        if (showDebug)
            aa.env.setValue("ErrorMessage", debug);
    } else {
        //aa.print("Reached");
        aa.env.setValue("ErrorCode", "0");
        if (showMessage) {
            //aa.env.setValue("ErrorMessage", message);
            //aa.print("Reached1");
            aa.env.setValue("ScriptReturnMessage", message);
        }

        if (showDebug) {
            aa.env.setValue("ScriptReturnMessage", debug);
            //aa.print("Reached2");
        }

    }
}

function explore(objExplore) {
    logDebug("Methods:")
    for (x in objExplore) {
        if (typeof(objExplore[x]) == "function") {
            logDebug("<font color=blue><u><b>" + x + "</b></u></font> ");
            logDebug("   " + objExplore[x] + "<br>");
        }
    }
    logDebug("");
    logDebug("Properties:")
    for (x in objExplore) {
        if (typeof(objExplore[x]) != "function") logDebug("  <b> " + x + ": </b> " + objExplore[x]);
    }
}

function aaExplore(objExplore) {
    aa.print("Methods:")
    for (x in objExplore) {
        if (typeof(objExplore[x]) == "function") {
            aa.print(x);
            aa.print(objExplore[x]);
        }
    }
    aa.print("");
    aa.print("Properties:")
    for (x in objExplore) {
        if (typeof(objExplore[x]) != "function") {
            aa.print(x + " : " + objExplore[x]);
        }
    }
}

function props(objExplore) {
    logDebug("Properties:")
    aa.print("Properties:")
    for (x in objExplore) {
        if (typeof(objExplore[x]) != "function") {
            logDebug("  <b> " + x + ": </b> " + objExplore[x]);
            aa.print( x + " : " + objExplore[x]);
        }
    }
}