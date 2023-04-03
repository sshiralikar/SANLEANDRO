var myCapId = String(aa.env.getValue("capId"));
var myUserId = "ADMIN";
var eventName = "Test";
//portlets/cache/cacheList.do?module=Building //clear cache url

//var publicUser = true;
//preCap = aa.cap.getCapID(myCapId).getOutput();
// capIdString = preCap.getID1() + "-" + preCap.getID2() + "-" + preCap.getID3();

/* CTRCA  */  //var eventName = "ConvertToRealCapAfter";
/* CTRCA  */  //var eventName = "ConvertToRealCapBefore";
/* ASA  */  //var eventName = "ApplicationSubmitAfter";
/* ASA  */  //var eventName = "ApplicationSubmitBefore";
/* WTUA */  //var eventName = "WorkflowTaskUpdateAfter";  wfTask = "Preliminary Review"; wfStatus = "Approved";  wfDateMMDDYYYY = "07/23/2021"; wfProcess = "LIC_CONT_RENEW"; wfComment = "Test"
/* WTUB */  //var eventName = "WorkflowTaskUpdateBefore";  wfTask = "Zoning Verification"; wfStatus = "Approved";  wfDateMMDDYYYY = "01/27/2015"; wfProcess = "";
/* IRSA */  //var eventName = "InspectionResultSubmitAfter" ; inspResult = "Pass"; inspResultComment = "Comment";  inspType = "Renewal Inspection"; var inspResultDate; var inspObj; var inspId = "38423"
/* ISA  */  //var eventName = "InspectionScheduleAfter" ; inspType = "Roofing"; inspId = 18172885;
/* ISB  */  //var eventName = "InspectionScheduleBefore" ; inspType = "021 Fire Final"; var inspSchedDate = "01/25/2022"; var InspectionDate = aa.util.now();
/* IMSB  */  //var eventName = "InspectionMultipleScheduleBefore" ; inspType = "021 Fire Final"; inspId = 18767106; var inspSchedDate = "01/25/2022"
/* ISMA */ //var eventName = "InspectionMultipleScheduleAfter"; inspId = 18172911;
/* PRA  */  //var eventName = "PaymentReceiveAfter"; capStatus = "Ready to Issue";
/* IRSB */ //var eventName = "InspectionResultSubmitBefore"; var inspResult; var inspComment; var inspType;
/* IRSA */ //var eventName = "InspectionResultSubmitAfter"; var inspResult; var inspComment; var inspType;
/* DDB */ //var eventName = "DocumentDeleteBefore"; var inspResult; var inspComment; var inspType;
/* DUA */ //var eventName = "DocumentUploadAfter"; var capIdString = ""; var documentModelArray = submittedDocList = aa.document.getDocumentListByEntity(capIdString,"CAP").getOutput();
var useProductInclude = true; //  set to true to use the "productized" include file (events->custom script), false to use scripts from (events->scripts)
var useProductScript = true;  // set to true to use the "productized" master scripts (events->master scripts), false to use scripts from (events->scripts)
var runEvent = true; // set to true to simulate the event and run all std choices/scripts for the record type.
/* master script code don't touch */ aa.env.setValue("EventName",eventName); var vEventName = eventName;  var controlString = eventName;  var tmpID = aa.cap.getCapID(myCapId).getOutput(); if(tmpID != null){aa.env.setValue("PermitId1",tmpID.getID1());  aa.env.setValue("PermitId2",tmpID.getID2());    aa.env.setValue("PermitId3",tmpID.getID3());} aa.env.setValue("CurrentUserID",myUserId); var preExecute = "PreExecuteForAfterEvents";var documentOnly = false;var SCRIPT_VERSION = 3.0;var useSA = false;var SA = null;var SAScript = null;var bzr = aa.bizDomain.getBizDomainByValue("MULTI_SERVICE_SETTINGS","SUPER_AGENCY_FOR_EMSE"); if (bzr.getSuccess() && bzr.getOutput().getAuditStatus() != "I") {     useSA = true;       SA = bzr.getOutput().getDescription();  bzr = aa.bizDomain.getBizDomainByValue("MULTI_SERVICE_SETTINGS","SUPER_AGENCY_INCLUDE_SCRIPT");     if (bzr.getSuccess()) { SAScript = bzr.getOutput().getDescription(); }  }if (SA) {  eval(getScriptText("INCLUDES_ACCELA_FUNCTIONS",SA,useProductScript));   eval(getScriptText("INCLUDES_ACCELA_GLOBALS",SA,useProductScript)); /* force for script test*/ showDebug = true; eval(getScriptText(SAScript,SA,useProductScript)); }else { eval(getScriptText("INCLUDES_ACCELA_FUNCTIONS",null,useProductScript)); eval(getScriptText("INCLUDES_ACCELA_GLOBALS",null,useProductScript));   }   eval(getScriptText("INCLUDES_CUSTOM",null,useProductInclude));if (documentOnly) {   doStandardChoiceActions2(controlString,false,0);    aa.env.setValue("ScriptReturnCode", "0");   aa.env.setValue("ScriptReturnMessage", "Documentation Successful.  No actions executed.");  aa.abortScript();   }var prefix = lookup("EMSE_VARIABLE_BRANCH_PREFIX",vEventName);var controlFlagStdChoice = "EMSE_EXECUTE_OPTIONS";var doStdChoices = true;  var doScripts = false;var bzr = aa.bizDomain.getBizDomain(controlFlagStdChoice ).getOutput().size() > 0;if (bzr) {   var bvr1 = aa.bizDomain.getBizDomainByValue(controlFlagStdChoice ,"STD_CHOICE");    doStdChoices = bvr1.getSuccess() && bvr1.getOutput().getAuditStatus() != "I";   var bvr1 = aa.bizDomain.getBizDomainByValue(controlFlagStdChoice ,"SCRIPT");    doScripts = bvr1.getSuccess() && bvr1.getOutput().getAuditStatus() != "I";  }   function getScriptText(vScriptName, servProvCode, useProductScripts) {  if (!servProvCode)  servProvCode = aa.getServiceProviderCode(); vScriptName = vScriptName.toUpperCase();    var emseBiz = aa.proxyInvoker.newInstance("com.accela.aa.emse.emse.EMSEBusiness").getOutput();  try {       if (useProductScripts) {            var emseScript = emseBiz.getMasterScript(aa.getServiceProviderCode(), vScriptName);     } else {            var emseScript = emseBiz.getScriptByPK(aa.getServiceProviderCode(), vScriptName, "ADMIN");      }       return emseScript.getScriptText() + ""; } catch (err) {     return "";  }}logGlobals(AInfo); if (runEvent && typeof(doStandardChoiceActions) == "function" && doStdChoices) try {doStandardChoiceActions(controlString,true,0); } catch (err) { logDebug(err.message) } if (runEvent && typeof(doScriptActions) == "function" && doScripts) doScriptActions(); var z = debug.replace(/<BR>/g,"\r");  aa.print(z);

try {
    showDebug = true;

    addStdCondition("General", "CSLB Expired", capId);
    
} catch (err) {
    logDebug("A JavaScript Error occured: " + err.message + " at line " + err.lineNumber + " stack: "+ err.stack);
    aa.print("A JavaScript Error occured: " + err.message + " at line " + err.lineNumber + " stack: "+ err.stack);
}
// end user code
if(showDebug) {
    aa.env.setValue("ScriptReturnCode", "0");   
    aa.env.setValue("ScriptReturnMessage", debug);
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