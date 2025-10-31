// WTUA ENGINEERING
//
vCurrentUser=currentUserID;
if(wfTask == "Application Intake") {
    assignCapAndDate(currentUserID);
}
if(wfTask == "Application Intake" && (wfStatus == "Accepted - Plan Review Req" || wfStatus == "Additional Info Required" || wfStatus == "In Progress")) {
	//logDebug('What is recAsgnStaff = ' + vCurrentUser);
	if (vCurrentUser != null) {
		wfTkArray = new Array();
		wfTkArray = loadTasks(capId);
		//added Review task to list - user story3465
		for (x in wfTkArray) {
			if (matches(x, 'Application Intake', 'Plans Distribution','Engineering Review','Plans Coordination','Permit Issuance','Post-Issuance Activity')) {
				assignTask(x, vCurrentUser);
			}
		}
	}
	if(wfTask == "Application Intake" && (wfStatus == "Accepted - Plan Review Req" || wfStatus == "In Progress")) {
		var appExpDate = new Date();
		var newAppExpDate = new Date(appExpDate);
		newAppExpDate.setDate(newAppExpDate.getDate() + 90);
		var appExpDateString = (newAppExpDate.getMonth() + 1) + "/" + newAppExpDate.getDate() + "/" + newAppExpDate.getFullYear();
		var expDate = getAppSpecific("Application Expiration Date");
		if (expDate == null) {
			editAppSpecific("Application Expiration Date", appExpDateString);
		}
	}
	//CASANLAN - 2942 - Add Customer Number for Utility Permits
	if (appMatch("*/Utility/*/*")) {
		profArry = new Array();
		profArry = aa.licenseProfessional.getLicenseProf(capId).getOutput();
		vCustNo="";
		for (x in profArry) {
			var LP = profArry[x];
			//vLPName = profArry[x]["businessName"];
			vLP = LP.getLicenseNbr();
			if (LP.getPrintFlag() == "Y")	{
				var vCustNo = lookup("ENG_UTILITY_CUST_NOS", vLP);
				if (vCustNo != 'undefined' && vCustNo != null && vCustNo != "") {
					editAppSpecific("Customer Number", vCustNo);
					logDebug("Primary: "+vLP+" Customer Number Set: "+vCustNo);
				}
				break;
			}
		}
	}
}
//Send Notifications
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
if (capAddressResult1.getSuccess()) {

	var Address = capAddressResult1.getOutput();
	for (yy in Address) {

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
addParameter(params, "$$actionByStaff$$", wfUserName);
addParameter(params, "$$appName$$", capName);
addParameter(params, "$$workDesc$$", workDescGet(capId));
addParameter(params, "$$assignedUserEmail$$", vEmail);
addParameter(params, "$$wfTaskComments$$", wfComment);
addParameter(params, "$$ACAUrl$$", String(lookup("ACA_CONFIGS", "ACA_SITE")).split("/Admin")[0]);

//CASANLAN -3153 - Added Plans Distribution option
if((wfTask == "Application Intake" || wfTask == "Plans Distribution") && wfStatus == "Additional Info Required"){
	sendEmail("noreply@sanleandro.org", applicantEmail, "", "ENG_ADDITIONAL_INFO_REQ", params, null, capId);
}
//CASANLAN - 3070
if(wfTask == "Engineering Review" && (wfStatus == "Approved" || wfStatus == "Approved w/ Comments")){
	vDesc=workDescGet(capId);
	if (wfComment!=null && wfComment!="") {
		if (vDesc!=null && vDesc!=null) {
			VNewDesc= vDesc+"\n\n"+wfComment;
			updateWorkDesc(VNewDesc,capId);
		} else {
			VNewDesc= wfComment;
			updateWorkDesc(VNewDesc,capId);
		}
	}
}
//CASANLAN - 3130
if(wfTask == "Traffic Review" && (wfStatus == "Approved" || wfStatus == "Approved w/ Comments")){
	var vAssignEmail = "";
	var vRecAsgnStaff = capDetail.getAsgnStaff();
	logDebug("Assigned to: "+vRecAsgnStaff);
	var currentUsrVar = aa.person.getUser(vRecAsgnStaff).getOutput();

	if (currentUsrVar != null) {
		vStaffId = currentUsrVar.getGaUserID();
		title = currentUsrVar.title;
		vAssignEmail = currentUsrVar.email;
		//wfUserName = currentUsrVar.firstName + " "+ currentUsrVar.middleName+ " "+ currentUsrVar.lastName;
	}
	//if user email blank - send to etpermits
	if (vAssignEmail=="")
		vAssignEmail = "etpermits@sanleandro.org";
	logDebug("Send Email To: "+vRecAsgnStaff+ " Email: "+vAssignEmail);
	sendEmail("noreply@sanleandro.org", vAssignEmail, "", "ENG_TRAFFIC_REVIEW_APPROVED", params, null, capId);
}

//CASANLAN - 2932 and 3103 for Grading
if(wfTask == "Plans Distribution" && wfStatus == "Resubmittal Required"){
	if (appMatch("Engineering/Land Development/Grading/NA")) {
		sendEmail("noreply@sanleandro.org", applicantEmail, "", "ENG_GRADE_RESUBMITTAL_REQUIRED", params, null, capId);
	} else {
		sendEmail("noreply@sanleandro.org", applicantEmail, "", "ENG_RESUBMITTAL_REQUIRED", params, null, capId);
	}
}

//INVOICE FEES
if(wfTask == "Application Intake" && wfStatus == "In Progress") {
	include("ENG_SEND_INVOICES");
}
//CASANLEAN-3153  //ENG_REC_AND_PARK_REVIEW_APPROVED
if (appMatch("Engineering/Encroachment/Tree/NA")) {
	if(wfTask == "Application Intake" && wfStatus == "Accepted - Plan Review Req") {
		var vParkEmail = lookup("ENG_REC_PARK_EMAIL", "ENG_REC_PARK_EMAIL");
		sendEmail("noreply@sanleandro.org", vParkEmail, "", "ENG_REC_AND_PARK_REVIEW_ASSIGNED", params, null, capId);
	}
	if(wfTask == "Recreation and Parks Review" && (wfStatus == "Approved" || wfStatus == "Approved w/ Comments")) {
		var vAssignEmail = "";
		var vRecAsgnStaff = capDetail.getAsgnStaff();
		logDebug("Assigned to: "+vRecAsgnStaff);
		var currentUsrVar = aa.person.getUser(vRecAsgnStaff).getOutput();
		if (currentUsrVar != null) {
			vStaffId = currentUsrVar.getGaUserID();
			title = currentUsrVar.title;
			vAssignEmail = currentUsrVar.email;
			//wfUserName = currentUsrVar.firstName + " "+ currentUsrVar.middleName+ " "+ currentUsrVar.lastName;
		}
		//if user email blank - send to etpermits
		if (vAssignEmail=="")
			vAssignEmail = "etpermits@sanleandro.org";
		logDebug("Send Email To: "+vRecAsgnStaff+ " Email: "+vAssignEmail);
		sendEmail("noreply@sanleandro.org", vAssignEmail, "", "ENG_REC_AND_PARK_REVIEW_APPROVED", params, null, capId);
	}
}
//CASANLAN - 2933
if(wfTask == "Traffic Review" && wfStatus == "Revisions/Resubmittal Required"){
   sendEmail("noreply@sanleandro.org", applicantEmail, "", "ENG_TRAFFIC_RESUBMITTAL_REQUIRED", params, null, capId);
}
//Only for Revisions
//Update 5/6/25 for Revisions
if (appMatch("*/Revision/*/*")) {
	if ((wfTask == "Plans Coordination" || wfTask == "Overtime Review") && wfStatus == "Update Revision") {
		include("ES_ENG_UPDATE_REVISION");
	}
}
//CASANLEAN-3188 Add Denied option to Revision Records
if (appMatch("Engineering/Revision/Overtime/NA")) {
	if(wfTask == "Request Review" && wfStatus == "Approved"){
		sendEmail("noreply@sanleandro.org", "etpermits@sanleandro.org", "", "ENG_OVERTIME_REQUEST_APPROVED", params, null, capId);
	}
	if(wfTask == "Request Review" && wfStatus == "Denied"){
		closeTask("Overtime Review","Denied","","Closed in workflow");
		closeTask("Permit Issuance","Denied","","Closed in workflow");
		sendEmail("noreply@sanleandro.org", applicantEmail, "etpermits@sanleandro.org", "ENG_OVERTIME_REQUEST_DENIED_NOTICE", params, null, capId);
	}
}
//CASANLAN - 2937
if(wfTask == "Permit Issuance" && wfStatus == "Issue"){
	if (!appMatch("*/Revision/*/*")) {
		if(appMatch("*/Encroachment/Annual/*")) {  // CASANLEAN - 3041
			sendEmail("noreply@sanleandro.org", applicantEmail, "etinspections@sanleandro.org", "ENG_ANNUAL_PERMIT_ISSUE", params, null, capId);
		} else {
			if (appMatch("Engineering/Land Development/Grading/NA")) { // CASANLEAN - 3103
				sendEmail("noreply@sanleandro.org", applicantEmail, "etinspections@sanleandro.org", "ENG_GRADE_PERMIT_ISSUE", params, null, capId);
			} else {
				sendEmail("noreply@sanleandro.org", applicantEmail, "etinspections@sanleandro.org", "ENG_PERMIT_ISSUE", params, null, capId);
			}
		}
	} else {
		logDebug("Issue Revision");
		include("ES_ENG_ISSUE_REVISION");
		sendEmail("noreply@sanleandro.org", applicantEmail, "", "ENG_REVISION_ISSUE", params, null, capId);
	}
}

//CASANLAN - 2942
if(wfTask == "Plans Coordination" && wfStatus == "Resubmittal Required"){
    sendEmail("noreply@sanleandro.org", applicantEmail, "", "ENG_PLANS_COORDINATION_RESUBMITTAL_REQUIRED", params, null, capId);
}
//CASANLAN - 3160
if (appMatch("Engineering/Encroachment/Monitoring Wells/NA")) {
	if((wfTask == "Engineering Review" || wfTask == "Environmental Services Review") && wfStatus == "Revisions Required"){
		sendEmail("noreply@sanleandro.org", applicantEmail, "", "ENG_REVISIONS_REQUIRED", params, null, capId);
	}
}
//CASANLAN - 2931
if(wfTask == "Plans Distribution" && ((wfStatus == "Minor Review and Inspections") || (wfStatus == "Major Review and Inspections"))) {
	//Invoice Rest Deposit
	vRestDeposit=AInfo["Restoration"];
	if (vRestDeposit > 0) {
		updateFee("ERES_DEP", "E_RESTOR", "FINAL", vRestDeposit, "Y");
	}
	if (vRestDeposit > 0) {
		vCCFee = (vRestDeposit * .025);
		updateFee("RD_CC_FEE", "E_RESTOR", "FINAL", vCCFee, "Y");
	}
	if (vRestDeposit > 0) {
		invoiceFeeAllNew(capId);
	}
	include("ENG_CALCULATE_TO_MINOR_MAJOR");
	include("ENG_SEND_INVOICES");
}
if(wfTask == "Plans Distribution" && (wfStatus == "Calculate Restoration Deposit")) {
	vRestDeposit=(feeAmount("ERES_DEP"));
	if (vRestDeposit > 0) {
		vCCFee = (vRestDeposit * .025);
		//updateFee("RD_CC_FEE", "E_RESTOR", "FINAL", vCCFee, "Y");
		addParameter(params, "$$restDeposit$$", vRestDeposit);
		sendEmail("noreply@sanleandro.org", applicantEmail, "", "ENG_RESTORATION_DEPOSIT_DUE", params, null, capId);
	}
}

//CASANLAN - 2931
if(wfTask == "Plans Coordination" && wfStatus == "Approved - Fees Due"){
    sendEmail("noreply@sanleandro.org", applicantEmail, "", "ENG_APPROVED_FEES_DUE", params, null, capId);
}

//CASANLAN - 2936
if(wfTask == "Plans Coordination" && wfStatus == "Hold for Signature"){
    sendEmail("noreply@sanleandro.org", applicantEmail, "", "ENG_PERMIT_SIGNATURE_REQUIRED", params, null, capId);
}

//CASANLAN - 293
if(wfTask == "Inspections" && wfStatus == "Compaction Report"){
    sendEmail("noreply@sanleandro.org", applicantEmail, "", "ENG_INSPECTION_COMPACTION_RPT_REQ", params, null, capId);
}

//CASANLAN - 3002
if(wfTask == "Plans Coordination" && wfStatus == "Deposit Due"){
	vResDeposit = parseInt(AInfo['Restoration']);
	addParameter(params, "$$restDeposit$$", vResDeposit);
    sendEmail("noreply@sanleandro.org", applicantEmail, "", "ENG_RESTORATION_DEPOSIT_DUE", params, null, capId);
}

//CASANLAN - 2936
if(wfTask == "Plans Coordination" && wfStatus == "Contractor Expired Notice"){
    sendEmail("noreply@sanleandro.org", applicantEmail, "", "ENG_CONTRACTOR_EXPIRED_NOTICE", params, null, capId);
}

//CASANLAN - 3103
if ((appMatch("*/*/Parcel Map/*")) || (appMatch("*/*/Street Vacation/*"))) {
	if(wfTask == "Plans Coordination" && wfStatus == "Ready for Approval"){
		sendEmail("noreply@sanleandro.org", applicantEmail, "", "ENG_MAPPING_READY_TO_ISSUE", params, null, capId);
	}
}

//CASANLAN - Post Issuance Activity - Finaled
if(wfTask == "Post-Issuance Activity" && wfStatus == "Permit - FINAL Review - Forward to Final Processing"){
    sendEmail("noreply@sanleandro.org", applicantEmail, "", "ENG_PERMIT_FINALED", params, null, capId);
}

//CASANLAN - Post Issuance Activity - Expired
if(wfTask == "Post-Issuance Activity" && wfStatus == "Permit - Expired - Forward to Final Processing"){
    sendEmail("noreply@sanleandro.org", applicantEmail, "", "ENG_PERMIT_EXPIRED", params, null, capId);
}

//CASANLAN - Final Processing - Finaled
// If Minor Review and Inspections was selected on Plans Distribution close Finance Task
if(wfTask == "Final Processing" && wfStatus == "Finaled"){
	//if Plans Distribution = Minor Review and Inspections
	vMinorReview=false;
	var workfHistory = aa.workflow.getWorkflowHistory(capId, null);
	if (workfHistory.getSuccess()) {
		var wfhistoryresult = workfHistory.getOutput();
	}
	for (var i in wfhistoryresult) {
		var pTask = wfhistoryresult[i];
		if (pTask.getTaskDescription() == "Plans Distribution" && pTask.getDisposition() == "Minor Review and Inspections") {
        	vMinorReview=true;
			break;
		}
	}
	if (vMinorReview==true) {
		closeTask("Finance","Finaled","","Closed by script");
		logDebug("Close Finance as Finaled");
	}
}
//REFUND RESTORATION DEPOSIT
if(wfTask == "Finance" && wfStatus == "Reconciled / Refunded") {
	logDebug("ENG_FIN_RETURN_REST_DEP 1");
	if(appMatch("*/*/Concrete/*") || appMatch("*/*/Monitoring Wells/*") || appMatch("*/*/Street/*") || appMatch("*/*/Sewer/*") || appMatch("*/Utility/*/*") || appMatch("*/*/Tree/*")) {
		logDebug("ENG_FIN_RETURN_REST_DEP 1");
		if ((AInfo["Minor Major"] == "Minor")) {
			include("ENG_FIN_RETURN_REST_DEP");
		}
	}
}

//REFUND TRUST ACCOUNT from Adhoc Workflow task
if(wfTask == "Refund Trust Account" && wfStatus == "Process Trust Refund") {
	logDebug("REFUND TRUST ACCOUNT");
	include("ENG_FIN_REFUND_TRUST_ACCT");
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
//if(wfTask == "Plans Coordination" && wfStatus == "Hold for Signature") {
//Need to include Overtime Review
if((wfTask == "Plans Coordination" || wfTask == "Overtime Review") && wfStatus == "Hold for Signature") {
    var recordId = null;
    if(appMatch("Engineering/Revision/NA/NA") || appMatch("Engineering/Revision/Overtime/NA")) {
        recordId = getParentByCapId(capId);
    } else {
        recordId = capId;
    }
    if(recordId) {
        var reportParams = aa.util.newHashtable();
        reportParams.put("RecordID", String(recordId.getCustomID()));
        var reportName = "Encroachment Permit Adobe Sign";
        if(appMatch("Engineering/Land Development/Grading/NA")) {
            reportName = "Grading Permit Adobe Sign";
        }
        var reportResult = generateReportSavetoEDMS(recordId, reportName, "Engineering", reportParams);
        logDebug("Generated report: " + reportResult);
        if(reportResult) {
            runAsyncEvent("ENG_ADOBE_SIGN_ASYNC", String(recordId.getCustomID()), "ADMIN");
        }
    }
}

//GQ_CSLB_INTERFACE
if((wfTask == "Application Intake" || wfTask == "Application Submittal") && String(wfStatus).indexOf("Accepted") > -1) {
	include("GQ_CSLB_SYNC_TRANSACTIONAL_LP");
}

//PINS
if((wfTask == "Application Intake" || wfTask == "Application Submittal") && String(wfStatus).indexOf("Accepted") > -1) {
    var professionals = getAllTransactionalLPs(capId);
    if(professionals) {
        var pinIDsToCheck = [];
        var pinsAuth = getPINSAuthObject();
        var templateRequirementsObj = getPINSTemplateRequirements(capId, pinsAuth);
        var validPINSLPMap = loadStdChoiceObj("PINS_LICENSE_PROFESSIONAL_TYPES");

        var utilityPermit = appMatch("Engineering/Utility/*/*", capId);

        for(var i in professionals) {
            var lp = professionals[i];
            var lpType = lp.licenseType;
            if(validPINSLPMap[lpType] != "true") {
               continue;
            }
            var licNum = lp.licenseNbr;
            var pinsId = getLPAttribute(licNum, lpType, "PINS Reference ID");
            logDebug("Checking PINS reference on " + licNum + " " + lpType);
            logDebug(pinsId);
            if(pinsId) {
                logDebug("Already created in PINS");
                pinIDsToCheck.push(pinsId);
                continue;
            }

            var refLp = grabReferenceLicenseProfessional(licNum, lpType);
            var licSeqNumber = refLp.licSeqNbr;
            pinsId = searchPINSIDByRefLPSeq(licSeqNumber, pinsAuth);
            if(pinsId) {
                logDebug("Found PINS insured " + pinsId);
                updateLPAttribute(licNum, lpType, "PINS Reference ID", pinsId);
                pinIDsToCheck.push(pinsId);
                continue;
            }

            logDebug(licNum + " missing in PINS");

            var lpName = refLp.businessName;
            if(!lpName) {
                lpName = refLp.contactFirstName + " " + refLp.contactLastName;
            }

            var lpEmail = refLp.EMailAddress ? refLp.EMailAddress : "";
            var lpAddress = refLp.address1 ? refLp.address1 : "";
            var lpCity = refLp.city ? refLp.city : "";
            var lpState = refLp.licState ? refLp.licState : "";
            var lpCountry = "US";
            var lpZip = refLp.zip ? refLp.zip : "";
            var description = ["License Number: " + licNum, "License Type: " + lpType];
            var insuredObj = createPINSInsured(lpName + " - " + licNum, lpEmail, lpName, lpAddress, lpCity, lpState, lpCountry, lpZip, description.join("\n"), lpType, licSeqNumber, pinsAuth);
            if(insuredObj) {
                updateLPAttribute(licNum, lpType, "PINS Reference ID", insuredObj.id);

                if(utilityPermit && lpType != "Utility") {
                    logDebug("Only the utility needs PINS requirements skipping record creation");
                    continue;
                }

                createPINSRecord(insuredObj.id, "", templateRequirementsObj.id, templateRequirementsObj.name, pinsAuth);
            }
        }
        logDebug("IDS to check: " + pinIDsToCheck);
        if(templateRequirementsObj && pinIDsToCheck.length > 0) {
            for(var pinsIdIndex in pinIDsToCheck) {
                var pinsInsuredId = pinIDsToCheck[pinsIdIndex];
                logDebug(pinsInsuredId);
                var insuredRecords = getInsuredRecords(pinsInsuredId, pinsAuth);
                var createRecord = true;
                if(insuredRecords && insuredRecords.length > 0) {
                    for(var recordIndex in insuredRecords) {
                        var insuredRecord = insuredRecords[recordIndex];
                        var insuredRecordName = insuredRecord.contract_number;
                        if(insuredRecordName == templateRequirementsObj.name) {
                            logDebug("Template " + templateRequirementsObj.name + " is already a record on the insured");
                            createRecord = false;
                            break;
                        }
                    }
                }
                if(createRecord) {
                    createPINSRecord(pinsInsuredId, "", templateRequirementsObj.id, templateRequirementsObj.name, pinsAuth);
                }
            }
        }
    }
}
//
function assignCapAndDate(assignId) { // option CapId
	var itemCap = capId
	if (arguments.length > 1) itemCap = arguments[1]; // use cap ID specified in args

	var cdScriptObjResult = aa.cap.getCapDetail(itemCap);
	if (!cdScriptObjResult.getSuccess())
		{ logDebug("**ERROR: No cap detail script object : " + cdScriptObjResult.getErrorMessage()) ; return false; }

	var cdScriptObj = cdScriptObjResult.getOutput();
	if (!cdScriptObj)
		{ logDebug("**ERROR: No cap detail script object") ; return false; }
	cd = cdScriptObj.getCapDetailModel();

	iNameResult  = aa.person.getUser(assignId);
	if (!iNameResult.getSuccess())
		{ logDebug("**ERROR retrieving  user model " + assignId + " : " + iNameResult.getErrorMessage()) ; return false ; }

	iName = iNameResult.getOutput();
	cd.setAsgnDept(iName.getDeptOfUser());
	cd.setAsgnStaff(assignId);
	var vAssignDate = new Date();
	cd.setAsgnDate(vAssignDate);
	cdWrite = aa.cap.editCapDetail(cd);
	if (cdWrite.getSuccess())
		{ logDebug("Assigned CAP to " + assignId) }
	else
		{ logDebug("**ERROR writing capdetail : " + cdWrite.getErrorMessage()) ; return false ; }
}
function invoiceFeeAllNew(itemCap) {
	//invoices all assessed fees with a status of NEW
	var vFeeSeqList = [];
	var vPaymentPeriodList = [];
	var vFeeList;
	var vGetFeeResult = new Array();
	var vFeeNum;
	var vFeeSeq;
	var vFperiod
	vGetFeeResult = aa.fee.getFeeItems(itemCap);
	if (vGetFeeResult.getSuccess()) {
		vFeeList = vGetFeeResult.getOutput();
		for (vFeeNum in vFeeList)
			if (vFeeList[vFeeNum].getFeeitemStatus().equals("NEW")) {
				vFeeSeq = vFeeList[vFeeNum].getFeeSeqNbr();
				vFperiod = vFeeList[vFeeNum].getPaymentPeriod();
				vFeeSeqList.push(vFeeSeq);
				vPaymentPeriodList.push(vFperiod);
			}
		vInvoiceResult = aa.finance.createInvoice(itemCap, vFeeSeqList, vPaymentPeriodList);
		if (vInvoiceResult.getSuccess())
			logDebug("Invoicing assessed fee items is successful.");
		else
			logDebug("**ERROR: Invoicing the fee items assessed to app # " + itemCap.getCustomID() + " was not successful.  Reason: " + vInvoiceResult.getErrorMessage());
	}
}