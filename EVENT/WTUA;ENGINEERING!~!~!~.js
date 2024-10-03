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
//CASANLAN - 3070
if(wfTask == "Engineering Review" && (wfStatus == "Approved" || wfStatus == "Approved w/ Comments")){
	vDesc=workDescGet(capId);
	VNewDesc= vDesc+"\n\n "+wfComment;
	updateWorkDesc(VNewDesc,capId);
}
//CASANLAN - 2932
if(wfTask == "Plans Distribution" && wfStatus == "Resubmittal Required"){
   sendEmail("no-reply@sanleandro.org", applicantEmail, "", "ENG_RESUBMITTAL_REQUIRED", params, null, capId);
}

//CASANLAN - 2942
if(wfTask == "Plans Coordination" && wfStatus == "Resubmittal Required"){
   sendEmail("no-reply@sanleandro.org", applicantEmail, "", "ENG_REVISIONS_REQUIRED", params, null, capId);
}

//CASANLAN - 2933
//if(wfTask == "Traffic Review" && wfStatus == "Revisions Required"){
   //sendEmail("no-reply@sanleandro.org", applicantEmail, "", "ENG_TRAFFIC_RESUBMITTAL_REQUIRED", params, null, capId);
// }
//Only for Revisions
if (appMatch("*/Revision/*/*")) {
	if (wfTask == "Plans Coordination" && wfStatus == "Update Revision") {
		include("ES_ENG_UPDATE_REVISION");
	}
}
//CASANLAN - 2937
if(wfTask == "Permit Issuance" && wfStatus == "Issue"){
	if (!appMatch("*/Revision/*/*")) {
		if(appMatch("*/Encroachment/Annual/*")) {  // CASANLEAN - 3041
			sendEmail("no-reply@sanleandro.org", applicantEmail, "etinspections@sanleandro.org", "ENG_ANNUAL_PERMIT_ISSUE", params, null, capId);
		} else {
			sendEmail("no-reply@sanleandro.org", applicantEmail, "etinspections@sanleandro.org", "ENG_PERMIT_ISSUE", params, null, capId);
		}
	} else {
		include("ES_ENG_ISSUE_REVISION");
		sendEmail("no-reply@sanleandro.org", applicantEmail, "", "ENG_REVISION_ISSUE", params, null, capId);
	}
}

//CASANLAN - ????
if(wfTask == "Plans Coordination" && wfStatus == "Resubmittal Required"){
    sendEmail("no-reply@sanleandro.org", applicantEmail, "", "ENG_PLANS_COORDINATION_RESUBMITTAL_REQUIRED", params, null, capId);
}

//CASANLAN - 2931
if(wfTask == "Plans Distribution" && ((wfStatus == "Minor Review and Inspections") || (wfStatus == "Major Review and Inspections"))) {
	include("ENG_CALCULATE_TO_MINOR_MAJOR");
	if (wfStatus == "Minor Review and Inspections") {
		if((appMatch("*/*/Street/*")) || appMatch("*/*/Concrete/*") || appMatch("*/*/Sewer/*") || appMatch("*/*/Monitoring Wells/*")) {
			sendEmail("no-reply@sanleandro.org", applicantEmail, "", "ENG_MINOR_FEES_AND_REST_DEPOSIT", params, null, capId);
		} else {
			sendEmail("no-reply@sanleandro.org", applicantEmail, "", "ENG_MINOR_FEES_DUE", params, null, capId);
		}
	}
	if (wfStatus == "Major Review and Inspections") {
		if((appMatch("*/*/Street/*")) || appMatch("*/*/Concrete/*") || appMatch("*/*/Sewer/*") || appMatch("*/*/Monitoring Wells/*")) {
			sendEmail("no-reply@sanleandro.org", applicantEmail, "", "ENG_MAJOR_FEES_AND_REST_DEPOSIT", params, null, capId);
		} else {
			sendEmail("no-reply@sanleandro.org", applicantEmail, "", "ENG_MAJOR_DEPOSIT_DUE", params, null, capId);
		}
	}
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

//CASANLAN - Post Issuance Activity - Finaled
if(wfTask == "Post-Issuance Activity" && wfStatus == "Permit - FINAL Review - Forward to Final Processing"){
    sendEmail("no-reply@sanleandro.org", applicantEmail, "", "ENG_PERMIT_FINALED", params, null, capId);
}

//CASANLAN - Post Issuance Activity - Expired
if(wfTask == "Post-Issuance Activity" && wfStatus == "Permit - Expired - Forward to Final Processing"){
    sendEmail("no-reply@sanleandro.org", applicantEmail, "", "ENG_PERMIT_EXPIRED", params, null, capId);
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
//showDebug = true;
/*
START SHASHANK
Trust Account Creation Logic
Create a Trust Account using the ALT ID and related to that record.
Link the Trust Account to the Applicant account (public user)
*/
//if(wfStatus == "Calculate Restoration Deposit")
//{
//  processTrustAccount(capId.getCustomID()+"");
//}
function processTrustAccount(orgAcctID) {
    logDebug("START: processTrustAccount");
    //Get Applicant
    vApplicantRefNum = null;

    var name = "";
    var EOContact = null;
    var vContacts = aa.people.getCapContactByCapID(capId).getOutput();
    for (var vCounter in vContacts) {
        var vContact = vContacts[vCounter].getCapContactModel();
        if (vContact.getContactType() == "Applicant") {
            EOContact = vContact;
            //vContact.setPrimaryFlag("Y");
            // name = String(vContact.firstName).substring(0, 3) + "" + String(vContact.lastName).substring(0, 3);
            vApplicantRefNum = vContact.refContactNumber;
            //aa.people.editCapContact(vContact);
            break;
        }
    }


    //Create Trust Account
    var vAcctID = orgAcctID+"";
    if(!doesTrustAccountsExist(vAcctID+""))
    {
        var vDesc = "" + vAcctID;
        var vTrustAcctountObj = aa.trustAccount.createTrustAccountScriptModel().getTrustAccountModel();
        vTrustAcctountObj.setServProvCode("SANLEANDRO");
        vTrustAcctountObj.setOverdraft("N");
        vTrustAcctountObj.setAcctID(vAcctID);
        vTrustAcctountObj.setTransactions(null);
        vTrustAcctountObj.setAcctBalance(0);
        vTrustAcctountObj.setAcctStatus("Active");
        vTrustAcctountObj.setRecStatus("A");
        vTrustAcctountObj.setThresholdAmount(null);
        vTrustAcctountObj.setOverdraftLimit(parseInt(0));
        //vTrustAcctountObj.setLedgerAccount(vSAPNumber);
        vTrustAcctountObj.setDescription(vDesc);
        vTrustAcctountObj.setRecFulName("ADMIN");
        vTrustAcctountObj.setPrimary(null);
        logDebug("ERROR MESSAGE"+aa.trustAccount.createTrustAccount(vTrustAcctountObj).getErrorMessage());
    }


    //editAppSpecific("Account ID", vAcctID);
    //editAppName(vAcctID);
    //editAppSpecific("Ledger Account", vSAPNumber);
    //editAppSpecific("Description", vDesc);

    // Get Public User Sequence Id
    //var capObjResult = aa.cap.getCapDetail(capId).getOutput();
    usr = null;
    var usrArr = aa.publicUser.getPublicUserListByContactNBR(parseInt(vApplicantRefNum)).getOutput();

    // Get Trust Account Sequence Id
    var accountObj = aa.trustAccount.getTrustAccountByAccountID(vAcctID).getOutput().getTrustAccountModel();
    var mapRefContactNbrs = aa.util.newHashMap();
    mapRefContactNbrs.put(vApplicantRefNum, vApplicantRefNum);

    var mapPublicUserNbrs = aa.util.newHashMap();
    for (var u = 0; u < usrArr.size() ; u++) {
        var usr = usrArr.get(u);
        if (!mapPublicUserNbrs.containsKey(usr.getUserSeqNum())) {
            mapPublicUserNbrs.put(usr.getUserSeqNum(), usr.getUserSeqNum());
        }
    }

    /*var vContacts = aa.people.getCapContactByCapID(capId).getOutput();
    for (var vCounter in vContacts) {
        var vContact = vContacts[vCounter].getCapContactModel();
        if (vContact.getContactType() == "Authorized Agent" && (vApplicantRefNum != vContact.refContactNumber)) {
            var usr = null;
            var usrArr = aa.publicUser.getPublicUserListByContactNBR(parseInt(vContact.refContactNumber)).getOutput();
            for (var u = 0; u < usrArr.size() ; u++) {
                var usr = usrArr.get(u);
                if (!mapPublicUserNbrs.containsKey(usr.getUserSeqNum())) {
                    mapPublicUserNbrs.put(usr.getUserSeqNum(), usr.getUserSeqNum());
                }
            }
            if (!mapRefContactNbrs.containsKey(vContact.refContactNumber)) {
                mapRefContactNbrs.put(vContact.refContactNumber, vContact.refContactNumber);
            }
        }
    }*/

    insertEscrowPublicUserPermission(accountObj, mapPublicUserNbrs,usr);
    insertEscrowContactAssociation(accountObj, mapRefContactNbrs,vApplicantRefNum);

    logDebug("END: processTrustAccount");
}
function insertEscrowPublicUserPermission(accountObj, mapPublicUserNbrs,usr) {
    logDebug("START: insertEscrowPublicUserPermission");
    var vError = '';
    var conn = null;
    var sStmt = null;
    var rSet = null;
    var sql = "";

    try {

        var keyArray = mapPublicUserNbrs.keySet().toArray();
        for (k in keyArray) {
            var max_Ent = getSysNextSequence("XENTITY_PERMISSION_SEQ");

            if (sql != "") {
                sql += " UNION ALL ";
            }
            sql += " SELECT '" + aa.getServiceProviderCode() + "'," + max_Ent + "," + accountObj.getAcctSeq() + ",'TRUST_ACCOUNT','TRUST_ACCOUNT_ACCESS_ROLE','A',GETDATE(),'A','ADMIN'," + keyArray[k] + " ";
        }


        var vError = '';
        var conn = null;
        var sStmt = null;
        var rSet = null;

        /*var initialContext = aa.proxyInvoker.newInstance("javax.naming.InitialContext").getOutput();
        var ds = initialContext.lookup("java:/AA");
        var conn = ds.getConnection();*/


        var insertString = "INSERT INTO XENTITY_PERMISSION (SERV_PROV_CODE,ENTITY_SEQ_NBR,ENTITY_ID,ENTITY_TYPE,PERMISSION_TYPE,PERMISSION_VALUE,REC_DATE,REC_STATUS,REC_FUL_NAM,ENTITY_ID2) ";
        insertString += "VALUES ('SANLEANDRO'," + max_Ent + "," + accountObj.getAcctSeq() + ",'TRUST_ACCOUNT','TRUST_ACCOUNT_ACCESS_ROLE','A',GETDATE(),'A','ADMIN'," + usr.getUserSeqNum() + ")";
        //insertString += sql;
        logDebug(insertString);
        doSQLInsert(insertString);
        /*sStmt = conn.prepareStatement(insertString);
        sStmt.execute();
        conn.close();*/
    } catch (vError) {
        logDebug("Runtime error occurred: " + vError);
    }

    //closeDBQueryObject(rSet, sStmt, conn);
    logDebug("END: insertEscrowPublicUserPermission");
}

function insertEscrowContactAssociation(accountObj, mapRefContactNbrs,vApplicantRefNum) {
    logDebug("START: insertEscrowContactAssociation");
    var vError = '';
    var conn = null;
    var sStmt = null;
    var rSet = null;
    var sql = "";

    try {
        var keyArray = mapRefContactNbrs.keySet().toArray();
        for (k in keyArray) {
            if (sql != "") {
                sql += " UNION ALL ";
            }
            sql += " SELECT '" + aa.getServiceProviderCode() + "'," + accountObj.getAcctSeq() + ",'Contact'," + keyArray[k] + ",'" + accountObj.getAcctID() + "',GETDATE(),'A','ADMIN',0,'N/A' ";

        }

        /*var initialContext = aa.proxyInvoker.newInstance("javax.naming.InitialContext").getOutput();
        var ds = initialContext.lookup("java:/AA");
        var conn = ds.getConnection();*/

        // Insert data into XACCT_PEOPLE
        var insertString = "INSERT INTO XACCT_PEOPLE (SERV_PROV_CODE,ACCT_SEQ_NBR,PEOPLE_TYPE,PEOPLE_SEQ_NBR,ACCT_ID,REC_DATE,REC_STATUS,REC_FUL_NAM,SOURCE_SEQ_NBR,PARCEL_NBR) ";
        insertString += "VALUES ('SANLEANDRO'," + accountObj.getAcctSeq() + ",'Contact'," + vApplicantRefNum + ",'" + accountObj.getAcctID() + "',GETDATE(),'A','ADMIN',0,'N/A')";
        //insertString += sql;
        logDebug(insertString);
        doSQLInsert(insertString);
        /*sStmt = conn.prepareStatement(insertString);
        sStmt.execute();
        conn.close();*/
    } catch (vError) {
        logDebug("Runtime error occurred: " + vError);
    }
    //closeDBQueryObject(rSet, sStmt, conn);
    logDebug("END: insertEscrowContactAssociation");
}
function doesTrustAccountsExist(acctId)
{
    logDebug("doesTrustAccountsExist");
    var ta = aa.trustAccount.getTrustAccountByAccountID(acctId + "").getOutput().getTrustAccountModel();
    if (ta) {
        logDebug("doesTrustAccountsExist: true");
        return true;
    }
    logDebug("doesTrustAccountsExist: true");
    return false;
}
function getTrustAccountBalance(acctId)
{
    var bal = 0;
    var ta = aa.trustAccount.getTrustAccountByAccountID(acctId + "").getOutput().getTrustAccountModel();
    if (ta) {
        bal = ta.getAcctBalance();
    }
    return bal;
}
function getSysNextSequence(sSeqName) {
    var sysSeqBiz = aa.proxyInvoker.newInstance("com.accela.sequence.SequenceGeneratorBusiness")
        .getOutput();
    var seq;
    try {
        var seqObj = sysSeqBiz.getNextValue(sSeqName);
        seq = sysSeqBiz.getNextValue(sSeqName)
            .longValue();
        logDebug(seq);

    } catch (err) {
        logDebug("An error occurred in SCRIPT: INCLUDES_COMMON: Function: getNextSequence :: Sequence Name is not valid " + err.message);
        seq = -1;
    }
    return seq;
}
function doSQLInsert(sql) {
    logDebug("Inside doSQLInsert");
    var uresult = aa.db.update(sql,[]);
    logDebug("uresult: "+ uresult.getErrorMessage());
}
function doSQL(sql) {
    var dq = aa.db.select(sql, []);
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
                    //aa.print(ks[c] + ": " + (row.get(ks[c])));
                }
                a.push(r);
            }
        }
        //aa.print(JSON.stringify(a));
        return a;
    } else {
        aa.print("Error: " + dq.getErrorMessage());
    }
}
/*
END SHASHANK
Trust Account Creation Logic
Create a Trust Account using the ALT ID and related to that record.
Link the Trust Account to the Applicant account (public user)
*/
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
    var recordId = null;
    if(appMatch("Engineering/Revision/NA/NA")) {
        recordId = getParentByCapId(capId);
    } else {
        recordId = capId;
    }
    if(recordId) {
        var reportParams = aa.util.newHashtable();
        reportParams.put("RecordID", String(recordId.getCustomID()));
        var reportResult = generateReportSavetoEDMS(recordId, "Encroachment Permit Adobe Sign", "Engineering", reportParams);
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
        for(var i in professionals) {
            var lp = professionals[i];
            var licNum = lp.licenseNbr;
            var pinsId = getLPAttribute(licNum, "PINS Reference ID");
            logDebug(pinsId);
            if(pinsId) {
                logDebug("Already created in PINS");
                pinIDsToCheck.push(pinsId);
                continue;
            }
            logDebug(licNum + " missing in PINS");
            var refLp = grabReferenceLicenseProfessional(licNum);
            var licSeqNumber = refLp.licSeqNbr;
            var lpName = refLp.businessName;
            var lpEmail = refLp.EMailAddress;
            var lpAddress = refLp.address1;
            var lpCity = refLp.city;
            var lpState = refLp.licState;
            var lpCountry = "US";
            var lpZip = refLp.zip;
            var insuredObj = createPINSInsured(lpName, lpEmail, lpName, lpAddress, lpCity, lpState, lpCountry, lpZip, "Contractor", "Contractor", licNum, pinsAuth);
            if(insuredObj) {
                updateLPAttribute(licNum, "PINS Reference ID", insuredObj.id);
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