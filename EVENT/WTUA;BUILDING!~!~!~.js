//CASANLEAN-1393
if(wfTask == "Plans Distribution" && wfStatus == "Fees Due") {
    addFee("PLNC  ","B_COMBO","FINAL",1,"Y");

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
    sendEmail("", applicantEmail, "", "BLD_PLAN_CHECK_FEES_DUE", params, null, capId);
}
if(wfTask == "Plans Distribution" && wfStatus == "Fees Due with cc Fees") {

    var feeAmt =  addFeeReturnAmt("PLNC  ","B_COMBO","FINAL",1,"Y");
    addFee("CCFEE","CC FEES","FINAL",Math.floor(feeAmt),"Y");

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
    sendEmail("", applicantEmail, "", "BLD_PLAN_CHECK_FEES_DUE", params, null, capId);
}
//CASANLEAN-1393

//CASANLEAN-1420
if(wfTask == "Plans Distribution" && wfStatus == "Routed for Review" && !feeExists("BPMT","NEW","INVOICED"))
{
    addFee("BPMT","B_COMBO","FINAL",1,"N");
}
//CASANLEAN-1420

//CASANLEAN-806, CASANLEAN-831, CASANLEAN-863, CASANLEAN-967, CASANLEAN-989, CASANLEAN-1019
if(wfTask == "Public Works Review" && (wfStatus == "Approved" || wfStatus == "Approved w/ Comments"))
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
    if(feeAmt <= 100000)
        addFee("XSWR","B_COMBO","FINAL",1,"N");
    else
        addFee("XSWMR","B_COMBO","FINAL",1,"N");

}
//CASANLEAN-806, CASANLEAN-831, CASANLEAN-863, CASANLEAN-967, CASANLEAN-989, CASANLEAN-1019

//CASANLEAN-1449
if(wfTask == "Application Intake" && String(wfStatus).indexOf("Accepted") >= 0) {
    checkLP(capId);
}

//CASANLEAN-766
if((wfTask == "Application Intake" && wfStatus == "Accepted - Plan Review Not Req") || (wfTask == "Plans Coordination" && String(wfStatus).indexOf("Approved") >= 0)) {
    var expiredLPData = validateFromCSLB(null, capId);
    if(expiredLPData && expiredLPData.length > 0) {
        cancel = true;
        showMessage = true;
        comment(expiredLPData.join("<br>"));
    }
}

function addFeeReturnAmt(fcode,fsched,fperiod,fqty,finvoice) // Adds a single fee, optional argument: fCap
{
    // Updated Script will return feeSeq number or null if error encountered (SR5112)
    var feeCap = capId;
    var feeCapMessage = "";
    var feeSeq_L = new Array();				// invoicing fee for CAP in args
    var paymentPeriod_L = new Array();			// invoicing pay periods for CAP in args
    var feeSeq = null;
    if (arguments.length > 5)
    {
        feeCap = arguments[5]; // use cap ID specified in args
        feeCapMessage = " to specified CAP";
    }

    assessFeeResult = aa.finance.createFeeItem(feeCap,fsched,fcode,fperiod,fqty);
    if (assessFeeResult.getSuccess())
    {
        feeSeq = assessFeeResult.getOutput();
        logMessage("Successfully added Fee " + fcode + ", Qty " + fqty + feeCapMessage);
        logDebug("The assessed fee Sequence Number " + feeSeq + feeCapMessage);

        if (finvoice == "Y" && arguments.length == 5) // use current CAP
        {
            feeSeqList.push(feeSeq);
            paymentPeriodList.push(fperiod);
        }
        if (finvoice == "Y" && arguments.length > 5) // use CAP in args
        {
            feeSeq_L.push(feeSeq);
            paymentPeriod_L.push(fperiod);
            var invoiceResult_L = aa.finance.createInvoice(feeCap, feeSeq_L, paymentPeriod_L);
            if (invoiceResult_L.getSuccess())
                logMessage("Invoicing assessed fee items" + feeCapMessage + " is successful.");
            else
                logDebug("**ERROR: Invoicing the fee items assessed" + feeCapMessage + " was not successful.  Reason: " +  invoiceResult.getErrorMessage());
        }
    }
    else
    {
        logDebug( "**ERROR: assessing fee (" + fcode + "): " + assessFeeResult.getErrorMessage());
        feeSeq = null;
    }
    var feeAmt = aa.finance.getFeeItemByPK(feeCap, feeSeq).getOutput().getF4FeeItem().getFee();

    return feeAmt;
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