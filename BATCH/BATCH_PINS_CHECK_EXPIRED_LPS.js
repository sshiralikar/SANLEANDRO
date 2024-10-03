var myCapId = "";
var myUserId = "ADMIN";
var eventName = "";

var useProductInclude = true; //  set to true to use the "productized" include file (events->custom script), false to use scripts from (events->scripts)
var useProductScript = true;  // set to true to use the "productized" master scripts (events->master scripts), false to use scripts from (events->scripts)
var runEvent = true; // set to true to simulate the event and run all std choices/scripts for the record type.
/* master script code don't touch */ aa.env.setValue("EventName",eventName); var vEventName = eventName;  var controlString = eventName;  var tmpID = aa.cap.getCapID(myCapId).getOutput(); if(tmpID != null){aa.env.setValue("PermitId1",tmpID.getID1());  aa.env.setValue("PermitId2",tmpID.getID2());    aa.env.setValue("PermitId3",tmpID.getID3());} aa.env.setValue("CurrentUserID",myUserId); var preExecute = "PreExecuteForAfterEvents";var documentOnly = false;var SCRIPT_VERSION = 3.0;var useSA = false;var SA = null;var SAScript = null;var bzr = aa.bizDomain.getBizDomainByValue("MULTI_SERVICE_SETTINGS","SUPER_AGENCY_FOR_EMSE"); if (bzr.getSuccess() && bzr.getOutput().getAuditStatus() != "I") {     useSA = true;       SA = bzr.getOutput().getDescription();  bzr = aa.bizDomain.getBizDomainByValue("MULTI_SERVICE_SETTINGS","SUPER_AGENCY_INCLUDE_SCRIPT");     if (bzr.getSuccess()) { SAScript = bzr.getOutput().getDescription(); }  }if (SA) {  eval(getScriptText("INCLUDES_ACCELA_FUNCTIONS",SA,useProductScript));   eval(getScriptText("INCLUDES_ACCELA_GLOBALS",SA,useProductScript)); /* force for script test*/ showDebug = true; eval(getScriptText(SAScript,SA,useProductScript)); }else { eval(getScriptText("INCLUDES_ACCELA_FUNCTIONS",null,useProductScript)); eval(getScriptText("INCLUDES_ACCELA_GLOBALS",null,useProductScript));   }   eval(getScriptText("INCLUDES_CUSTOM",null,useProductInclude));if (documentOnly) {   doStandardChoiceActions2(controlString,false,0);    aa.env.setValue("ScriptReturnCode", "0");   aa.env.setValue("ScriptReturnMessage", "Documentation Successful.  No actions executed.");  aa.abortScript();   }var prefix = lookup("EMSE_VARIABLE_BRANCH_PREFIX",vEventName);var controlFlagStdChoice = "EMSE_EXECUTE_OPTIONS";var doStdChoices = true;  var doScripts = false;var bzr = aa.bizDomain.getBizDomain(controlFlagStdChoice ).getOutput().size() > 0;if (bzr) {   var bvr1 = aa.bizDomain.getBizDomainByValue(controlFlagStdChoice ,"STD_CHOICE");    doStdChoices = bvr1.getSuccess() && bvr1.getOutput().getAuditStatus() != "I";   var bvr1 = aa.bizDomain.getBizDomainByValue(controlFlagStdChoice ,"SCRIPT");    doScripts = bvr1.getSuccess() && bvr1.getOutput().getAuditStatus() != "I";  }   function getScriptText(vScriptName, servProvCode, useProductScripts) {  if (!servProvCode)  servProvCode = aa.getServiceProviderCode(); vScriptName = vScriptName.toUpperCase();    var emseBiz = aa.proxyInvoker.newInstance("com.accela.aa.emse.emse.EMSEBusiness").getOutput();  try {       if (useProductScripts) {            var emseScript = emseBiz.getMasterScript(aa.getServiceProviderCode(), vScriptName);     } else {            var emseScript = emseBiz.getScriptByPK(aa.getServiceProviderCode(), vScriptName, "ADMIN");      }       return emseScript.getScriptText() + ""; } catch (err) {     return "";  }}logGlobals(AInfo); if (runEvent && typeof(doStandardChoiceActions) == "function" && doStdChoices) try {doStandardChoiceActions(controlString,true,0); } catch (err) { logDebug(err.message) } if (runEvent && typeof(doScriptActions) == "function" && doScripts) doScriptActions(); var z = debug.replace(/<BR>/g,"\r");  aa.print(z);

// aa.env.setValue("Param1", "Value");//test params

// var param = String(aa.env.getValue("Param1"))//always come back as an object so use conversion

try {
    showDebug = true;

    //aa.sendMail("tnabc@no-reply.com", "sal@grayquarter.com","","title","content");

    var count = 0;
    var start = new Date();

    //Code
    mainProccess();

    var end = new Date();
    var seconds = (end.getTime() - start.getTime())/1000;
    logDebug("Script time = " + seconds + " seconds");


} catch (err) {
    logDebug("A JavaScript Error occured: " + err.message + " at line " + err.lineNumber + " stack: "+ err.stack);
    aa.print("A JavaScript Error occured: " + err.message + " at line " + err.lineNumber + " stack: "+ err.stack);
}
// end user code
if(showDebug) {
    aa.env.setValue("ScriptReturnCode", "0");
    aa.env.setValue("ScriptReturnMessage", debug);
}

function mainProccess() {

    var pinsCache = {};
    var pinsAuth = getPINSAuthObject();

    var standardChoice = "PINS_INTERFACE";
    var endpoint = lookup(standardChoice, "BASE_ENDPOINT");
    var recordRoute = lookup(standardChoice, "GET_RECORDS");

    var templateMapping = loadStdChoiceObj("PINS_TEMPLATE_MAPPING");

    var header = aa.httpClient.initPostParameters();
    header.put("Content-Type", "application/json");
    header.put("Authorization", "Bearer " + pinsAuth["access_token"]);

    var issuedEngPermits = getIssuedEngineeringRecords();
    var lpsToUnlock = {};
    for(var i in issuedEngPermits) {

        var sqlObj = issuedEngPermits[i];
        /*
            LIC_NBR: 1313000
            B1_ALT_ID: EGRADE-24-0011
            B1_APPL_STATUS: Issued
            SERV_PROV_CODE: SANLEANDRO
            G1_CONTACT_NBR: 20002142429
            G1_CONTACT_TYPE: Contractor
            G1_ATTRIBUTE_NAME: PINS REFERENCE ID
            G1_ATTRIBUTE_VALUE: 539417
            G1_ATTRIBUTE_UNIT_TYPE: null
            G1_ATTRIBUTE_VALUE_DATA_TYPE: Text
            G1_ATTRIBUTE_VALUE_REQ_FLAG: N
            G1_DISPLAY_ORDER: 0
            G1_VALIDATION_SCRIPT: null
            REC_DATE: 2024-09-04 06:41:48.193
            REC_FUL_NAM: SGUERRERO
            REC_STATUS: A
            VCH_DISP_FLAG: N
        */


        var lpNum = sqlObj["LIC_NBR"];
        var altId = sqlObj["B1_ALT_ID"];
        var recType = sqlObj["B1_PER_GROUP"] + "/" + sqlObj["B1_PER_TYPE"] + "/" + sqlObj["B1_PER_SUB_TYPE"] + "/" + sqlObj["B1_PER_CATEGORY"];
        logDebug("");
        logDebug(lpNum);
        logDebug(altId);
        logDebug(recType);
        var requiredTemplate = templateMapping[recType];
        logDebug("Required template: " + requiredTemplate);
        if(!requiredTemplate) {
            logDebug("No required template for " + recType);
            continue;
        }


        if(pinsCache[lpNum]) {
            //if not valid apply record condition

            logDebug("Process the result of the call");
            var currentPinsStatus = pinsCache[lpNum][requiredTemplate];
            logDebug("Current PINS status: " + currentPinsStatus)
            var result = insuredTemplateStatus == "approved" ? true : false;
            if(result) {
                lpsToUnlock[lpNum].permits.push(altId);
            }
            continue;
        }
        var insuredId = sqlObj["G1_ATTRIBUTE_VALUE"];


        var apiUrl = endpoint + recordRoute + "?insured_id=" + insuredId;
        logDebug(apiUrl);

        try {
            var request = aa.httpClient.get(apiUrl, header);
            var response = request.getOutput();
            // logDebug("")
            // logDebug(response);
            // logDebug("");
            var responseData = JSON.parse(response);
            var insuredData = responseData.data;
            logDebug("Records: " + insuredData.length);

            if(insuredData.length > 0) {
                pinsCache[lpNum] = {};
                for(var dataIndex in insuredData) {
                    var dataObj = insuredData[dataIndex];
                    var insuredTemplate = dataObj.contract_number;
                    var insuredTemplateStatus = dataObj.status;
                    pinsCache[lpNum][insuredTemplate] = dataObj.status;
                    if(insuredTemplate == requiredTemplate) {
                        var result = insuredTemplateStatus == "approved" ? true : false;
                        logDebug("Still in compliance: " + result);

                        //testing
                        sqlObj["EMAIL"] = "sal@grayquarter.com";

                        if(result) {
                            lpsToUnlock[lpNum] = {
                                email: sqlObj["EMAIL"],
                                businessName: sqlObj["BUS_NAME"],
                                permits: [altId]
                            }
                        }

                    }
                }
            }

        } catch (err) {
            logDebug(err + " " + err.lineNumber);
        }
    }

    logDebug("");
    logDebug("Removing locks and removing from set");
    var validLps = [];
    for(var lpNum in lpsToUnlock) {
        var expiredObj = lpsToUnlock[lpNum];
        var lpName = expiredObj["businessName"];
        validLps.push(lpNum + " " + lpName);
        var lpEmail = expiredObj["email"];
        var validPermits = expiredObj.permits;
        logDebug("Name: " + lpName);
        logDebug("Email: " + lpEmail);
        logDebug("Removing locks: " + validPermits.length);
        var permitData = [];
        validPermits.forEach(function(altId) {
            var capId = aa.cap.getCapID(altId).getOutput();
            var addressLine = "N/A";
            var addresses = aa.address.getAddressByCapId(capId).getOutput();
            if(addresses && addresses.length > 0) {
                var addressString = String(addresses[0]);
                logDebug(addressString);
                addressLine = addressString;
            }
            var result = aa.set.removeSetHeadersListByCap("PINS_EXPIRED_INSURANCE", capId);
            if (result.getSuccess()) {
                logDebug("Successfully removed " + altId + " from set");
                removeCapCondition("Engineering", "PINS Insurance Expired", capId);
            } else {
                logDebug("Failed at adding record to set: " + result.getErrorType() + " " + result.getErrorMessage());
            }
            permitData.push(altId + " - " + addressLine);
        })
        if(String(lpEmail).indexOf("@") > -1) {
            var emailParams = aa.util.newHashtable();
            emailParams.put("$$businessName$$", lpName);
            emailParams.put("$$permits$$", permitData.join("\n"));
            sendNotificationNoCap("", lpEmail, "", "PINS_EXPIRED_UNLOCKED", emailParams, []);
        } else {
            logDebug("No email found for " + lpNum);
        }
    }
}

function sendNotificationNoCap(emailFrom,emailTo,emailCC,templateName,params,reportFile)
{

	// logDebug("start sendNotificationNoCap(" + [].slice.call(arguments) + ")");

	var result = null;
	result = aa.document.sendEmailByTemplateName(emailFrom, emailTo, emailCC, templateName, params, reportFile);
	if(result.getSuccess())
	{
		logDebug("Sent email successfully!");
		return true;
	}
	else
	{
		logDebug("Failed to send mail. - " + result.getErrorType());
		return false;
	}
}

function getIssuedEngineeringRecords() {
    var recordList = [];
    var sql = "SELECT DISTINCT \
        RLP.LIC_NBR, \
        RLP.BUS_NAME, \
        RLP.EMAIL, \
        P.B1_ALT_ID, \
        P.B1_APPL_STATUS, \
        P.B1_PER_GROUP, \
        P.B1_PER_TYPE, \
        P.B1_PER_CATEGORY, \
        P.B1_PER_SUB_TYPE, \
        RLP_ASI.* \
    FROM RSTATE_LIC RLP \
    JOIN G3CONTACT_ATTRIBUTE RLP_ASI \
        ON RLP_ASI.G1_CONTACT_NBR = RLP.LIC_SEQ_NBR \
        AND RLP_ASI.G1_ATTRIBUTE_NAME = 'PINS Reference ID' \
    JOIN B3CONTRA TLP \
        ON TLP.B1_LICENSE_NBR = RLP.LIC_NBR \
        AND TLP.B1_LICENSE_TYPE = RLP.LIC_TYPE \
    JOIN B1PERMIT P \
        ON TLP.B1_PER_ID1 = P.B1_PER_ID1 \
        AND TLP.B1_PER_ID2 = P.B1_PER_ID2 \
        AND TLP.B1_PER_ID3 = P.B1_PER_ID3 \
    WHERE EXISTS ( \
        SELECT 1 FROM SETDETAILS S \
        WHERE 1=1 \
        AND S.B1_PER_ID1 = P.B1_PER_ID1 \
        AND S.B1_PER_ID2 = P.B1_PER_ID2 \
        AND S.B1_PER_ID3 = P.B1_PER_ID3 \
        AND S.SET_ID = 'PINS_EXPIRED_INSURANCE' \
    ) \
    AND RLP.SERV_PROV_CODE='" + aa.getServiceProviderCode() + "' \
    AND P.B1_APPL_STATUS = 'Issued' \
    AND P.B1_PER_GROUP = 'Engineering' \
    AND TLP.B1_LICENSE_TYPE = 'Contractor' \
    AND P.REC_STATUS = 'A' \
    AND RLP.REC_STATUS = 'A' \
    AND RLP_ASI.G1_ATTRIBUTE_VALUE IS NOT NULL";

    logDebug(sql);
    var dq = aa.db.select(sql, []);// only accela hosted have to do the old lookup way agencys
    if (dq.getSuccess()) {
        var dso = dq.getOutput();
        if (dso) {
            var a = [];
            var ds = dso.toArray();
            for (var x in ds) {
                var r = {};
                var row = ds[x];
                var ks = ds[x].keySet().toArray();
                for (var c in ks) {
                    r[ks[c]] = String(row.get(ks[c]));
                    // aa.print(ks[c] + ": " + (row.get(ks[c])));
                }
                a.push(r);
            }
            logDebug("Query returned " + a.length + " records");
            recordList = a;
        }
        logDebug("Successful query.");
    } else {
        logDebug("Unsuccessful query because " + dq.getErrorMessage());
    }
    return recordList;
}

function loadStdChoiceObj(stdChoiceName) {
    var stdChoiceObj = aa.bizDomain.getBizDomain(stdChoiceName).getOutput();
    if(!stdChoiceObj) {
        logDebug("Unable to load " + stdChoiceName);
        return null;
    }
    var stdChoiceArray = stdChoiceObj.toArray();
    var returnObj = {};
    var activeCount = 0;
    for(var i in stdChoiceArray) {
        var stdChoice = stdChoiceArray[i];
        var auditStatus = stdChoice.auditStatus;
        if(auditStatus != "A") {
            continue;
        }
        var stdChoiceKey = stdChoice.bizdomainValue;
        var stdChoiceValue = stdChoice.description;
        returnObj[stdChoiceKey] = String(stdChoiceValue);
        activeCount++;
    }
    logDebug("Loaded " + activeCount + " std choice values from " + stdChoiceName);
    return returnObj;
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