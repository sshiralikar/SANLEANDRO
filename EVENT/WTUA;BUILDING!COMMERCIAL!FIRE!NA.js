//CASANLEAN-468
if(wfTask == "Application Intake" && wfStatus == "Additional Info Required")
{
    var params = aa.util.newHashtable();

    var vStaffId = "";
    var title = "";
    var vEmail = "";
    var wfUserName = "";
    var currentUsrVar = aa.person.getUser(wfStaffUserID).getOutput();
    if (currentUsrVar != null) {
        vStaffId = currentUsrVar.getGaUserID();
        title = currentUsrVar.title;
        vEmail = currentUsrVar.email;
        wfUserName = currentUsrVar.firstName + " "+ currentUsrVar.middleName+ " "+ currentUsrVar.lastName;
    }

    var vAddress = "";
    var capAddressResult1 = aa.address.getAddressByCapId(capId);
    if (capAddressResult1.getSuccess())
    {
        var Address = capAddressResult1.getOutput();
        for (yy in Address)
        {
            vAddress = Address[yy].getHouseNumberStart();
            if (Address[yy].getStreetDirection())
                vAddress += " " + Address[yy].getStreetDirection();
            vAddress += " " + Address[yy].getStreetName();
            if (Address[yy].getStreetSuffix())
                vAddress += " " + Address[yy].getStreetSuffix();
            if (Address[yy].getUnitStart())
                vAddress += " " + Address[yy].getUnitStart();
        }
    }
    var applicantEmail = "";
    var conName = "";
    var contactResult = aa.people.getCapContactByCapID(capId);
    if (contactResult.getSuccess()) {
        var capContacts = contactResult.getOutput();
        for (var i in capContacts) {
            if (capContacts[i].getPeople().getContactType() == "Applicant") {
                conName = getContactName(capContacts[i]);
                applicantEmail = capContacts[i].getPeople().getEmail()+"";
            }
        }
    }
    addParameter(params, "$$applicantName$$", conName);
    addParameter(params, "$$altID$$", capId.getCustomID()+"");
    addParameter(params, "$$projectDescription$$", cap.getSpecialText());
    addParameter(params, "$$Location$$", vAddress);
    addParameter(params, "$$assignedToStaff$$", wfUserName);
    addParameter(params, "$$assignedUserTitle$$", title);
    addParameter(params, "$$assignedUserEmail$$", vEmail);
    addParameter(params, "$$wfTaskComments$$", wfComment);
    addParameter(params, "$$ACAUrl$$", String(lookup("ACA_CONFIGS", "ACA_SITE")).split("/Admin")[0]);
    sendEmail("no-reply@sanleandro.org", applicantEmail, "", "BLD_ADDITIONAL_INFO_REQ", params, null, capId);
}
//CASANLEAN-468
//CASANLEAN-469
if(wfTask == "Fire Plan Review" && wfStatus == "Resubmittal Required")
{
    var params = aa.util.newHashtable();

    var vStaffId = "";
    var title = "";
    var vEmail = "";
    var wfUserName = "";
    var currentUsrVar = aa.person.getUser(wfStaffUserID).getOutput();
    if (currentUsrVar != null) {
        vStaffId = currentUsrVar.getGaUserID();
        title = currentUsrVar.title;
        vEmail = currentUsrVar.email;
        wfUserName = currentUsrVar.firstName + " "+ currentUsrVar.middleName+ " "+ currentUsrVar.lastName;
    }

    var vAddress = "";
    var capAddressResult1 = aa.address.getAddressByCapId(capId);
    if (capAddressResult1.getSuccess())
    {
        var Address = capAddressResult1.getOutput();
        for (yy in Address)
        {
            vAddress = Address[yy].getHouseNumberStart();
            if (Address[yy].getStreetDirection())
                vAddress += " " + Address[yy].getStreetDirection();
            vAddress += " " + Address[yy].getStreetName();
            if (Address[yy].getStreetSuffix())
                vAddress += " " + Address[yy].getStreetSuffix();
            if (Address[yy].getUnitStart())
                vAddress += " " + Address[yy].getUnitStart();
        }
    }
    var applicantEmail = "";
    var conName = "";
    var contactResult = aa.people.getCapContactByCapID(capId);
    if (contactResult.getSuccess()) {
        var capContacts = contactResult.getOutput();
        for (var i in capContacts) {
            if (capContacts[i].getPeople().getContactType() == "Applicant") {
                conName = getContactName(capContacts[i]);
                applicantEmail = capContacts[i].getPeople().getEmail()+"";
            }
        }
    }
    addParameter(params, "$$applicantName$$", conName);
    addParameter(params, "$$altID$$", capId.getCustomID()+"");
    addParameter(params, "$$projectDescription$$", cap.getSpecialText());
    addParameter(params, "$$Location$$", vAddress);
    addParameter(params, "$$assignedToStaff$$", wfUserName);
    addParameter(params, "$$assignedUserTitle$$", title);
    addParameter(params, "$$assignedUserEmail$$", vEmail);
    addParameter(params, "$$ACAUrl$$", String(lookup("ACA_CONFIGS", "ACA_SITE")).split("/Admin")[0]);
    sendEmail("no-reply@sanleandro.org", applicantEmail, "", "BLD_PLANCHECKCOMMENTS", params, null, capId);
}
if(wfTask == "Plans Coordination" && wfStatus == "Resubmittal Required")
{
    var params = aa.util.newHashtable();

    var vStaffId = "";
    var title = "";
    var vEmail = "";
    var wfUserName = "";
    var currentUsrVar = aa.person.getUser(wfStaffUserID).getOutput();
    if (currentUsrVar != null) {
        vStaffId = currentUsrVar.getGaUserID();
        title = currentUsrVar.title;
        vEmail = currentUsrVar.email;
        wfUserName = currentUsrVar.firstName + " "+ currentUsrVar.middleName+ " "+ currentUsrVar.lastName;
    }

    var vAddress = "";
    var capAddressResult1 = aa.address.getAddressByCapId(capId);
    if (capAddressResult1.getSuccess())
    {
        var Address = capAddressResult1.getOutput();
        for (yy in Address)
        {
            vAddress = Address[yy].getHouseNumberStart();
            if (Address[yy].getStreetDirection())
                vAddress += " " + Address[yy].getStreetDirection();
            vAddress += " " + Address[yy].getStreetName();
            if (Address[yy].getStreetSuffix())
                vAddress += " " + Address[yy].getStreetSuffix();
            if (Address[yy].getUnitStart())
                vAddress += " " + Address[yy].getUnitStart();
        }
    }
    var applicantEmail = "";
    var conName = "";
    var contactResult = aa.people.getCapContactByCapID(capId);
    if (contactResult.getSuccess()) {
        var capContacts = contactResult.getOutput();
        for (var i in capContacts) {
            if (capContacts[i].getPeople().getContactType() == "Applicant") {
                conName = getContactName(capContacts[i]);
                applicantEmail = capContacts[i].getPeople().getEmail()+"";
            }
        }
    }
    addParameter(params, "$$applicantName$$", conName);
    addParameter(params, "$$altID$$", capId.getCustomID()+"");
    addParameter(params, "$$projectDescription$$", cap.getSpecialText());
    addParameter(params, "$$Location$$", vAddress);
    addParameter(params, "$$assignedToStaff$$", wfUserName);
    addParameter(params, "$$assignedUserTitle$$", title);
    addParameter(params, "$$assignedUserEmail$$", vEmail);
    addParameter(params, "$$ACAUrl$$", String(lookup("ACA_CONFIGS", "ACA_SITE")).split("/Admin")[0]);
    sendEmail("no-reply@sanleandro.org", applicantEmail, "", "BLD_PLANCHECKCOMMENTS", params, null, capId);
}
//CASANLEAN-469
//CASALEAN-470
if(wfTask == "Plans Distribution" && wfStatus == "Resubmittal Required")
{
    var params = aa.util.newHashtable();

    var vStaffId = "";
    var title = "";
    var vEmail = "";
    var wfUserName = "";
    var currentUsrVar = aa.person.getUser(wfStaffUserID).getOutput();
    if (currentUsrVar != null) {
        vStaffId = currentUsrVar.getGaUserID();
        title = currentUsrVar.title;
        vEmail = currentUsrVar.email;
        wfUserName = currentUsrVar.firstName + " "+ currentUsrVar.middleName+ " "+ currentUsrVar.lastName;
    }

    var vAddress = "";
    var capAddressResult1 = aa.address.getAddressByCapId(capId);
    if (capAddressResult1.getSuccess())
    {
        var Address = capAddressResult1.getOutput();
        for (yy in Address)
        {
            vAddress = Address[yy].getHouseNumberStart();
            if (Address[yy].getStreetDirection())
                vAddress += " " + Address[yy].getStreetDirection();
            vAddress += " " + Address[yy].getStreetName();
            if (Address[yy].getStreetSuffix())
                vAddress += " " + Address[yy].getStreetSuffix();
            if (Address[yy].getUnitStart())
                vAddress += " " + Address[yy].getUnitStart();
        }
    }
    var applicantEmail = "";
    var conName = "";
    var contactResult = aa.people.getCapContactByCapID(capId);
    if (contactResult.getSuccess()) {
        var capContacts = contactResult.getOutput();
        for (var i in capContacts) {
            if (capContacts[i].getPeople().getContactType() == "Applicant") {
                conName = getContactName(capContacts[i]);
                applicantEmail = capContacts[i].getPeople().getEmail()+"";
            }
        }
    }
    addParameter(params, "$$applicantName$$", conName);
    addParameter(params, "$$altID$$", capId.getCustomID()+"");
    addParameter(params, "$$projectDescription$$", cap.getSpecialText());
    addParameter(params, "$$Location$$", vAddress);
    addParameter(params, "$$assignedToStaff$$", wfUserName);
    addParameter(params, "$$assignedUserTitle$$", title);
    addParameter(params, "$$assignedUserEmail$$", vEmail);
    addParameter(params, "$$ACAUrl$$", String(lookup("ACA_CONFIGS", "ACA_SITE")).split("/Admin")[0]);
    sendEmail("no-reply@sanleandro.org", applicantEmail, "", "BLD_PLANCHECKCOMMENTS", params, null, capId);
}
//CASALEAN-470
//CASANLEAN-938
if(wfTask == "Application Intake" && wfStatus == "Accepted - Plan Review Req")
{
    addFee("PLNC","B_COMBO","FINAL",1,"Y");

    var params = aa.util.newHashtable();

    var vStaffId = "";
    var title = "";
    var vEmail = "";
    var wfUserName = "";
    var currentUsrVar = aa.person.getUser(wfStaffUserID).getOutput();
    if (currentUsrVar != null) {
        vStaffId = currentUsrVar.getGaUserID();
        title = currentUsrVar.title;
        vEmail = currentUsrVar.email;
        wfUserName = currentUsrVar.firstName + " "+ currentUsrVar.middleName+ " "+ currentUsrVar.lastName;
    }

    var vAddress = "";
    var capAddressResult1 = aa.address.getAddressByCapId(capId);
    if (capAddressResult1.getSuccess())
    {
        var Address = capAddressResult1.getOutput();
        for (yy in Address)
        {
            vAddress = Address[yy].getHouseNumberStart();
            if (Address[yy].getStreetDirection())
                vAddress += " " + Address[yy].getStreetDirection();
            vAddress += " " + Address[yy].getStreetName();
            if (Address[yy].getStreetSuffix())
                vAddress += " " + Address[yy].getStreetSuffix();
            if (Address[yy].getUnitStart())
                vAddress += " " + Address[yy].getUnitStart();
        }
    }
    var applicantEmail = "";
    var conName = "";
    var contactResult = aa.people.getCapContactByCapID(capId);
    if (contactResult.getSuccess()) {
        var capContacts = contactResult.getOutput();
        for (var i in capContacts) {
            if (capContacts[i].getPeople().getContactType() == "Applicant") {
                conName = getContactName(capContacts[i]);
                applicantEmail = capContacts[i].getPeople().getEmail()+"";
            }
        }
    }
    addParameter(params, "$$applicantName$$", conName);
    addParameter(params, "$$altID$$", capId.getCustomID()+"");
    addParameter(params, "$$projectDescription$$", cap.getSpecialText());
    addParameter(params, "$$Location$$", vAddress);
    addParameter(params, "$$assignedToStaff$$", wfUserName);
    addParameter(params, "$$assignedUserTitle$$", title);
    addParameter(params, "$$assignedUserEmail$$", vEmail);
    addParameter(params, "$$ACAUrl$$", String(lookup("ACA_CONFIGS", "ACA_SITE")).split("/Admin")[0]);
    sendEmail("no-reply@sanleandro.org", applicantEmail, "", "BLD_PLAN_CHECK_FEES_DUE", params, null, capId);
}
//CASANLEAN-938
if(wfTask == "Application Intake" && (wfStatus == "Accepted - Plan Review Not Req" || wfStatus == "Accepted - Plan Review Req" || wfStatus == "Accepted"))
{
    var d = new Date();
    var year = d.getFullYear();
    var month = d.getMonth();
    var day = d.getDate();
    var c = new Date(year, month+7, day);
    var newDate = c.getMonth()+"/"+c.getDate()+"/"+c.getFullYear();
    editAppSpecific("Application Expiration Date", newDate);
}
if(wfTask == "Permit Issuance" && wfStatus == "Issued")
{
    var c = new Date();
    c.setFullYear(c.getFullYear() + 1);
    var newDate = c.getMonth()+1+"/"+c.getDate()+"/"+c.getFullYear();
    editAppSpecific("Permit Expiration Date", newDate);
    var d = new Date();
    editAppSpecific("Permit Issued Date", (d.getMonth()+1)+"/"+d.getDate()+"/"+d.getFullYear());
}
//CASANLEAN-1142
//CASANLEAN-945
if(wfTask == "Planning Review" && (wfStatus == "Approved" || wfStatus == "Approved w/ Comments"))
{
    addFee("PLNNRR","P_PLN","FINAL",1,"N");
}
//CASANLEAN-945
//CASANLEAN-948
if(wfStatus == "Approved - Fees Due")
{
    var params = aa.util.newHashtable();

    var vStaffId = "";
    var title = "";
    var vEmail = "";
    var wfUserName = "";
    var currentUsrVar = aa.person.getUser(wfStaffUserID).getOutput();
    if (currentUsrVar != null) {
        vStaffId = currentUsrVar.getGaUserID();
        title = currentUsrVar.title;
        vEmail = currentUsrVar.email;
        wfUserName = currentUsrVar.firstName + " "+ currentUsrVar.middleName+ " "+ currentUsrVar.lastName;
    }

    var vAddress = "";
    var capAddressResult1 = aa.address.getAddressByCapId(capId);
    if (capAddressResult1.getSuccess())
    {
        var Address = capAddressResult1.getOutput();
        for (yy in Address)
        {
            vAddress = Address[yy].getHouseNumberStart();
            if (Address[yy].getStreetDirection())
                vAddress += " " + Address[yy].getStreetDirection();
            vAddress += " " + Address[yy].getStreetName();
            if (Address[yy].getStreetSuffix())
                vAddress += " " + Address[yy].getStreetSuffix();
            if (Address[yy].getUnitStart())
                vAddress += " " + Address[yy].getUnitStart();
        }
    }
    var applicantEmail = "";
    var conName = "";
    var contactResult = aa.people.getCapContactByCapID(capId);
    if (contactResult.getSuccess()) {
        var capContacts = contactResult.getOutput();
        for (var i in capContacts) {
            if (capContacts[i].getPeople().getContactType() == "Applicant") {
                conName = getContactName(capContacts[i]);
                applicantEmail = capContacts[i].getPeople().getEmail()+"";
            }
        }
    }
    var reportNames = new Array();
    var rParamss = new Array();
    reportNames.push("Ready Letter");
    var rParams = aa.util.newHashMap();
    rParams.put("RecordID", capId.getCustomID()+"");
    rParamss.push(rParams);
    var reportUser = "ADMIN";
    var rFiles = [];
    for(var i in reportNames) {
        var reportName = reportNames[i];
        var rParams = rParamss[i];
        var reportInfoResult = aa.reportManager.getReportInfoModelByName(reportName);
        if (reportInfoResult.getSuccess() == false) {
            // Notify adimistrator via Email, for example
            aa.print("Could not found this report " + reportName);
        }

        report = reportInfoResult.getOutput();
        report.setModule("Building");
        report.setCapId(capId.getID1() + "-" + capId.getID2() + "-" + capId.getID3());
        report.setReportParameters(rParams);

        var permissionResult = aa.reportManager.hasPermission(reportName, reportUser);
        if (permissionResult.getSuccess() == false || permissionResult.getOutput().booleanValue() == false) {
            // Notify adimistrator via Email, for example
            aa.print("The user " + reportUser + " does not have perssion on this report " + reportName);
        }

        var reportResult = aa.reportManager.getReportResult(report);
        if (reportResult.getSuccess() == false) {
            // Notify adimistrator via Email, for example
            aa.print("Could not get report from report manager normally, error message please refer to (): " + reportResult.getErrorType() + ":" + reportResult.getErrorMessage());
        }

        reportResult = reportResult.getOutput();
        var reportFileResult = aa.reportManager.storeReportToDisk(reportResult);
        if (reportFileResult.getSuccess() == false) {
            // Notify adimistrator via Email, for example
            aa.print("The appliation does not have permission to store this temporary report " + reportName + ", error message please refer to:" + reportResult.getErrorMessage());
        }

        var reportFile = reportFileResult.getOutput();
        rFiles.push(reportFile);
    }
    VRFiles = rFiles;
    addParameter(params, "$$applicantName$$", conName);
    addParameter(params, "$$altID$$", capId.getCustomID()+"");
    addParameter(params, "$$projectDescription$$", cap.getSpecialText());
    addParameter(params, "$$Location$$", vAddress);
    addParameter(params, "$$assignedToStaff$$", wfUserName);
    addParameter(params, "$$assignedUserTitle$$", title);
    addParameter(params, "$$assignedUserEmail$$", vEmail);
    addParameter(params, "$$ACAUrl$$", String(lookup("ACA_CONFIGS", "ACA_SITE")).split("/Admin")[0]);
    sendEmail("no-reply@sanleandro.org", applicantEmail, "", "BLD_APPROVED_FEES_DUE", params, VRFiles, capId);
}
//CASANLEAN-948
//CASANLEAN-949
if( wfStatus == "Hold for Hard Copies")
{
    var params = aa.util.newHashtable();

    var vStaffId = "";
    var title = "";
    var vEmail = "";
    var wfUserName = "";
    var currentUsrVar = aa.person.getUser(wfStaffUserID).getOutput();
    if (currentUsrVar != null) {
        vStaffId = currentUsrVar.getGaUserID();
        title = currentUsrVar.title;
        vEmail = currentUsrVar.email;
        wfUserName = currentUsrVar.firstName + " "+ currentUsrVar.middleName+ " "+ currentUsrVar.lastName;
    }

    var vAddress = "";
    var capAddressResult1 = aa.address.getAddressByCapId(capId);
    if (capAddressResult1.getSuccess())
    {
        var Address = capAddressResult1.getOutput();
        for (yy in Address)
        {
            vAddress = Address[yy].getHouseNumberStart();
            if (Address[yy].getStreetDirection())
                vAddress += " " + Address[yy].getStreetDirection();
            vAddress += " " + Address[yy].getStreetName();
            if (Address[yy].getStreetSuffix())
                vAddress += " " + Address[yy].getStreetSuffix();
            if (Address[yy].getUnitStart())
                vAddress += " " + Address[yy].getUnitStart();
        }
    }
    var applicantEmail = "";
    var conName = "";
    var contactResult = aa.people.getCapContactByCapID(capId);
    if (contactResult.getSuccess()) {
        var capContacts = contactResult.getOutput();
        for (var i in capContacts) {
            if (capContacts[i].getPeople().getContactType() == "Applicant") {
                conName = getContactName(capContacts[i]);
                applicantEmail = capContacts[i].getPeople().getEmail()+"";
            }
        }
    }
    addParameter(params, "$$applicantName$$", conName);
    addParameter(params, "$$altID$$", capId.getCustomID()+"");
    addParameter(params, "$$projectDescription$$", cap.getSpecialText());
    addParameter(params, "$$Location$$", vAddress);
    addParameter(params, "$$assignedToStaff$$", wfUserName);
    addParameter(params, "$$assignedUserTitle$$", title);
    addParameter(params, "$$assignedUserEmail$$", vEmail);
    addParameter(params, "$$ACAUrl$$", String(lookup("ACA_CONFIGS", "ACA_SITE")).split("/Admin")[0]);
    sendEmail("no-reply@sanleandro.org", applicantEmail, "", "BLD_HOLD_FOR_HARD_COPIES", params, null, capId);
}
//CASANLEAN-949
if(wfTask == "Fire Review" && (wfStatus == "Approved" || wfStatus == "Approved w/ Comments"))
{
    var feeAmt = 0.0;
    var getFeeResult = aa.finance.getFeeItemsByFeeCodeAndPeriod(capId, "BPMT", "FINAL", "NEW");
    if (getFeeResult.getSuccess()) {
        var feeList = getFeeResult.getOutput();
        for (feeNum in feeList)
            if (feeList[feeNum].getFeeitemStatus().equals("NEW")) {
                feeAmt = feeList[feeNum].getFee();
            }
    }
    var getFeeResult = aa.finance.getFeeItemsByFeeCodeAndPeriod(capId, "BPMT", "FINAL", "INVOICED");
    if (getFeeResult.getSuccess()) {
        var feeList = getFeeResult.getOutput();
        for (feeNum in feeList)
            if (feeList[feeNum].getFeeitemStatus().equals("INVOICED")) {
                feeAmt = feeList[feeNum].getFee();
            }
    }
    if(feeAmt > 0 && !feeExists("MISC","NEW","INVOICED"))
        addFee("MISC","B_FIRE","FINAL",feeAmt * 0.65,"Y");
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