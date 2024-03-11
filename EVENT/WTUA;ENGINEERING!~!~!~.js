// WTUA ENGINEERING
//
vCurrentUser=currentUserID;
if(wfTask == "Application Intake")
{
    //assignTask("Application Intake",currentUserID);
    assignCap(currentUserID);
}
if(wfTask == "Application Intake" && (wfStatus == "Accepted - Plan Review Req" || wfStatus == "Additional Info Required" || wfStatus == "In Progress")) {
//	var recAsgnStaff = capDetail.getAsgnStaff();
	logDebug('What is recAsgnStaff = ' + vCurrentUser);
	if (vCurrentUser != null) {
		wfTkArray = new Array();
		wfTkArray = loadTasks(capId);
		//added Review task to list - user story3465
		for (x in wfTkArray) {
			if (matches(x, 'Application Intake', 'Plans Distribution','Engineering Review','Plans Coordination','Permit Issuance')) {
				assignTask(x, vCurrentUser);
			}
		}
	}
}



//CASANLAN - 2931

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
    addParameter(params, "$$location$$", vAddress);
    addParameter(params, "$$applicantName$$", conName);
    addParameter(params, "$$altID$$", capId.getCustomID()+"");
    addParameter(params, "$$assignedToStaff$$", wfUserName);
    addParameter(params, "$$assignedUserEmail$$", vEmail);
    addParameter(params, "$$wfTaskComments$$", wfComment);
    addParameter(params, "$$ACAUrl$$", String(lookup("ACA_CONFIGS", "ACA_SITE")).split("/Admin")[0]);


if(wfTask == "Application Intake" && wfStatus == "Additional Info Required"){
	sendEmail("no-reply@sanleandro.org", applicantEmail, "", "ENG_ADDITIONAL_INFO_REQ", params, null, capId);
}

//CASANLAN - 2942
if(wfTask == "Engineering Review" && wfStatus == "Revisions Required"){
   sendEmail("no-reply@sanleandro.org", applicantEmail, "", "ENG_REVISIONS_REQUIRED", params, null, capId);
}

//CASANLAN - 2933
if(wfTask == "Traffic Review" && wfStatus == "Revisions/Resubmittal Required"){
   sendEmail("no-reply@sanleandro.org", applicantEmail, "", "ENG_TRAFFIC_RESUBMITTAL_REQUIRED", params, null, capId);
}

//CASANLAN - 2937
if(wfTask == "Permit Issuance" && wfStatus == "Issue"){
   sendEmail("no-reply@sanleandro.org", applicantEmail, "", "ENG_PERMIT_ISSUE", params, null, capId);
}

//CASANLAN - ????
if(wfTask == "Plans Coordination" && wfStatus == "Resubmittal Required"){
    sendEmail("no-reply@sanleandro.org", applicantEmail, "", "ENG_PLANS_COORDINATION_RESUBMITTAL_REQUIRED", params, null, capId);
}

//CASANLAN - 2931
if(wfTask == "Plans Distribution" && ((wfStatus == "Minor Review and Inspections") || (wfStatus == "Major Review and Inspections"))) {
    sendEmail("no-reply@sanleandro.org", applicantEmail, "", "ENG_APPROVED_FEES_DUE", params, null, capId);
}

//CASANLAN - 2931
if(wfTask == "Plans Coordination" && wfStatus == "Approved - Fees Due"){
    sendEmail("no-reply@sanleandro.org", applicantEmail, "", "ENG_APPROVED_FEES_DUE", params, null, capId);
}

//CASANLAN - 2936
if(wfTask == "Plans Coordination" && wfStatus == "Hold for Signature"){
    sendEmail("no-reply@sanleandro.org", applicantEmail, "", "ENG_PERMIT_SIGNATURE_REQUIRED", params, null, capId);
}

//CASANLAN - 293
if(wfTask == "Inspections" && wfStatus == "Compaction Report"){
    sendEmail("no-reply@sanleandro.org", applicantEmail, "", "ENG_INSPECTION_COMPACTION_RPT_REQ", params, null, capId);
}

//CASANLAN - 3002
if(wfTask == "Plans Coordination" && wfStatus == "Deposit Due"){
	vResDeposit = parseInt(AInfo['Restoration']);
	addParameter(params, "$$restDeposit$$", vResDeposit);
    sendEmail("no-reply@sanleandro.org", applicantEmail, "", "ENG_RESTORATION_DEPOSIT_DUE", params, null, capId);
}

//CASANLAN - 2936
if(wfTask == "Plans Coordination" && wfStatus == "Contractor Expired Notice"){
    sendEmail("no-reply@sanleandro.org", applicantEmail, "", "ENG_CONTRACTOR_EXPIRED_NOTICE", params, null, capId);
}


//CASANLAN - 2960
if(wfTask == "Plans Coordination" && wfStatus == "Fees Paid"){

// get assigned user on record
capDetail = aa.cap.getCapDetail(capId).getOutput();

userObj = aa.person.getUser(capDetail.getAsgnStaff());

if (userObj.getSuccess()) {
    staff = userObj.getOutput();
    userID = staff.getUserID();
    var userObj = aa.person.getUser(userID);
    if (userObj.getSuccess()) {
		var userInfo = userObj.getOutput();
        userEmail = userInfo.getEmail()+"";
        logDebug("userEmail: " + userEmail)
    }
}
    sendEmail("no-reply@sanleandro.org", userEmail, "", "ENG_PERMIT_ISSUE", params, null, capId);
}

//CASANLAN - 2931
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

//CASANLEAN-2978
if(wfTask == "Plans Coordination" && wfStatus == "Hold for Signature") {
    var reportParams = aa.util.newHashtable();
    reportParams.put("RECORD_ID", String(capId.getCustomID()));
    var reportResult = generateReportSavetoEDMS(capId, "Adobe Sign Test Report", "Engineering", reportParams);
    logDebug("Generated report: " + reportResult);
    if(reportResult) {
        runAsyncEvent("ENG_ADOBE_SIGN_ASYNC", String(capId.getCustomID()), "ADMIN");
    }
}

//GQ_CSLB_INTERFACE
if(wfTask == "Application Submittal" && String(wfStatus).indexOf("Accepted") > -1) {
	include("GQ_CSLB_SYNC_TRANSACTIONAL_LP");
}