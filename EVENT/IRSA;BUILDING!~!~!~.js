showDebug = true;
assignInspection(inspId, currentUserID, capId);
if(inspType == "2030 Final Electrical" &&
    isTaskActive("Inspection") &&
    (inspResult == "Finaled" || inspResult == "Pass") &&
    isAllConditionsMet(capId) &&
    balanceDue <= 0)
{
    var flag = true;
    var relChildren = getChildren("Building/*/*/*", capId);
    if (!matches(relChildren, null, false)) {
        for (var r in relChildren) {
            var capDetailObjResult = aa.cap.getCapDetail(relChildren[r]);            // Detail
            if (capDetailObjResult.getSuccess())
            {
                capDetail = capDetailObjResult.getOutput();
                var vBalanceDue = capDetail.getBalance();
                if(parseFloat(vBalanceDue) > 0 || !isAllConditionsMet(relChildren[r]))
                    flag = false;
            }
        }
    }
    if(flag)
    {
        updateTask("Inspection"," Final Inspection Complete","","");
        aa.workflow.adjustTask(capId, "Inspection", "N", "Y", null, null);
        updateAppStatus("Finaled","Updated through script");

        var relChildren = getChildren("Building/*/*/*", capId);
        if (!matches(relChildren, null, false)) {
            for (var r in relChildren) {
                updateAppStatus("Finaled","Updated through script",relChildren[r]);
                updateTask("Inspection"," Final Inspection Complete","","","",relChildren[r]);
                aa.workflow.adjustTask(relChildren[r], "Inspection", "N", "Y", null, null);
            }
        }
    }
}


//CASANLEAN-1499
var params = aa.util.newHashtable();
var applicantEmail = "";
var conName = "";
var vBalanceDue = 0.0;
var capDetailObjResult = aa.cap.getCapDetail(capId);
if (capDetailObjResult.getSuccess())
{
    capDetail = capDetailObjResult.getOutput();
    vBalanceDue = parseFloat(capDetail.getBalance());
}
var contactResult = aa.people.getCapContactByCapID(capId);
if (contactResult.getSuccess()) {
    var capContacts = contactResult.getOutput();
    for (var i in capContacts) {
        var VRFiles = null;
        var conName = getContactName(capContacts[i]);
        var applicantEmail = capContacts[i].getPeople().getEmail()+"";
        var inspectorName = getInspectorName(inspId);
        if(!inspectorName)
            inspectorName = "Inspector";

        if(inspType == "3000 Final Building Permit" && (appMatch("Building/Combo/NA/NA")
            ||appMatch("Building/Commercial/Alteration/NA")||appMatch("Building/Commercial/New Construction/NA")
        ||appMatch("Building/Commercial/Accessory/NA")||appMatch("Building/Commercial/Addition/NA")
        ||appMatch("Building/Commercial/Pool/NA")||appMatch("Building/Residential/ADU/NA") ||appMatch("Building/Residential/New Construction/NA"))
         && vBalanceDue <= 0 && inspResult == "Pass")
        {
            var reportNames = new Array();
            var rParamss = new Array();
            reportNames.push("Certificate of Occupancy - SSRS");
            var rParams = aa.util.newHashMap();
            rParams.put("RecordID", capId.getCustomID()+"");
            rParamss.push(rParams);

            for(var i in reportNames)
            {
                var reportName = reportNames[i];
                var rParams = rParamss[i];
                var reportInfoResult = aa.reportManager.getReportInfoModelByName(reportName);
                if(reportInfoResult.getSuccess() == false) {
                    // Notify adimistrator via Email, for example
                    aa.print("Could not found this report " + reportName);
                }

                report = reportInfoResult.getOutput();
                report.setModule("Building");
                report.setCapId(capId.getID1() + "-" + capId.getID2() + "-" + capId.getID3());
                report.setReportParameters(rParams);

                var permissionResult = aa.reportManager.hasPermission(reportName,reportUser);
                if(permissionResult.getSuccess() == false || permissionResult.getOutput().booleanValue() == false) {
                    // Notify adimistrator via Email, for example
                    aa.print("The user " + reportUser + " does not have perssion on this report " + reportName);
                }

                var reportResult = aa.reportManager.getReportResult(report);
                if(reportResult.getSuccess() == false){
                    // Notify adimistrator via Email, for example
                    aa.print("Could not get report from report manager normally, error message please refer to (): " + reportResult.getErrorType() + ":" + reportResult.getErrorMessage());
                }

                reportResult = reportResult.getOutput();
                var reportFileResult = aa.reportManager.storeReportToDisk(reportResult);
                if(reportFileResult.getSuccess() == false) {
                    // Notify adimistrator via Email, for example
                    aa.print("The appliation does not have permission to store this temporary report " + reportName + ", error message please refer to:" + reportResult.getErrorMessage());
                }

                var reportFile = reportFileResult.getOutput();
                rFiles.push(reportFile);

            }
            //var capIDScriptModel =  aa.cap.createCapIDScriptModel(capId.getID1(), capId.getID2(), capId.getID3());
            //var result = aa.document.sendEmailAndSaveAsDocument("", email, "", emailTemplate, params, capIDScriptModel, rFiles);
            VRFiles = rFiles;
        }
        addParameter(params, "$$InspectorOfRecord$$", inspectorName);
        addParameter(params, "$$altId$$", capId.getCustomID()+"");
        addParameter(params, "$$InspectionStatus$$", inspResult);
        addParameter(params, "$$FullNameBusName$$", conName);
        addParameter(params, "$$InspectionType$$", inspType);
        addParameter(params, "$$InspectionResultComment$$", inspComment);
        sendEmail("no-reply@sanleandro.org", applicantEmail, "", "BLD_INSPECTION_RESULT_EMAIL", params, rFiles, capId);
    }
}

//CASANLEAN-1499

function getInspectorName(pInspId) {
    var inspResultObj = aa.inspection.getInspection(capId, pInspId);
    if (inspResultObj.getSuccess()) {
        iObj = inspResultObj.getOutput();
        // have to re-grab the user since the id won't show up in this object.
        inspUserObj = aa.person.getUser(iObj.getInspector().getFirstName(), iObj.getInspector().getMiddleName(), iObj.getInspector().getLastName()).getOutput();
        return iObj.getInspector().getFirstName()  +" " + iObj.getInspector().getLastName();
        //return inspUserObj.getUserID();
    }
    return false;
}
function isAllConditionsMet(vCapId)
{
    var condResult = aa.capCondition.getCapConditions(vCapId);
    if (condResult.getSuccess()) {
        var capConds = condResult.getOutput();
        for (var cc in capConds) {
            var thisCondX = capConds[cc];
            var cNbr = thisCondX.getConditionNumber();
            var thisCond = aa.capCondition.getCapCondition(vCapId,cNbr).getOutput();
            var cStatus = thisCond.getConditionStatus();
            //var isCOA = thisCond.getConditionOfApproval();
            if(matches(cStatus, "Not Met", "Applied"))
            {
                return false;
            }
        }
    }
    return true;
}
function runEmailThroughSLEmailFilter(vEmail)
{
    var filter = lookup("SL_EMAIL_CONTROL", "FILTER");
    if(filter == "ON")
    {
        var domains = String(lookup("SL_EMAIL_CONTROL", "DOMAIN_EXCEPTIONS"));
        var emails = String(lookup("SL_EMAIL_CONTROL", "EMAIL_EXCEPTIONS"));
        var vOriginalDomain = vEmail.substring(vEmail.indexOf("@") + 1, vEmail.length).toLowerCase();

        if(domains.toLowerCase().indexOf(String(vOriginalDomain).toLowerCase()) != -1)
            return vEmail;
        if(emails.toLowerCase().indexOf(String(vOriginalDomain).toLowerCase()) != -1)
            return vEmail;


        vEmail = vEmail.replace(vOriginalDomain, "DoNotSend.com");
    }
    return vEmail;
}
function sendEmail(fromEmail, toEmail, CC, template, eParams, files) { // optional: itemCap
    var itemCap = capId;
    if (arguments.length == 7)
        itemCap = arguments[6]; // use cap ID specified in args

    //var sent = aa.document.sendEmailByTemplateName(fromEmail, toEmail, CC, template, eParams, files);
    toEmail = runEmailThroughSLEmailFilter(toEmail);
    var itempAltIDScriptModel = aa.cap.createCapIDScriptModel(itemCap.getID1(), itemCap.getID2(), itemCap.getID3());
    var sent = aa.document.sendEmailAndSaveAsDocument(fromEmail, toEmail, CC, template, eParams, itempAltIDScriptModel, files);
    if (!sent.getSuccess()) {
        logDebug("**WARN sending email failed, error:" + sent.getErrorMessage());
    }
}
function getContactName(vConObj) {
    if (vConObj.people.getContactTypeFlag() == "organization") {
        if (vConObj.people.getBusinessName() != null && vConObj.people.getBusinessName() != "")
            return vConObj.people.getBusinessName();

        return vConObj.people.getBusinessName2();
    }
    else {
        if (vConObj.people.getFullName() != null && vConObj.people.getFullName() != "") {
            return vConObj.people.getFullName();
        }
        if (vConObj.people.getFirstName() != null && vConObj.people.getLastName() != null) {
            return vConObj.people.getFirstName() + " " + vConObj.people.getLastName();
        }
        if (vConObj.people.getBusinessName() != null && vConObj.people.getBusinessName() != "")
            return vConObj.people.getBusinessName();

        return vConObj.people.getBusinessName2();
    }
}