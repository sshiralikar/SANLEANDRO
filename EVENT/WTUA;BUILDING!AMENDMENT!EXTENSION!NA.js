//CASANLEAN-1641
if(wfTask == "Extension" && wfStatus == "Approved")
{
    var c = new Date();
    c.setFullYear(c.getFullYear() + 1);
    var newDate = c.getMonth()+1+"/"+c.getDate()+"/"+c.getFullYear();
    editAppSpecific("Permit New Expiration Date", newDate);

    var pCapId = getParent();
    editAppSpecific("Permit Expiration Date", newDate, pCapId);
    updateAppStatus("Ready for Inspection", "", pCapId);
    aa.workflow.adjustTask(pCapId, "Inspection", "Y", "N", null, null);
    updateTask("Inspection","In Progress","","","",pCapId);

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

    addParameter(params, "$$wfStatus$$", wfStatus);
    addParameter(params, "$$altID$$", capId.getCustomID()+"");
    addParameter(params, "$$wfStatusDate$$", sysDateMMDDYYYY);
    addParameter(params, "$$wfComment$$", wfComment);
    addParameter(params, "$$ChiefBuildingOfficialPhone$$", lookup("REPORT_VARIABLES","ChiefBuildingOfficialPhone"));
    addParameter(params, "$$ChiefBuildingOfficialEmail$$", lookup("REPORT_VARIABLES","ChiefBuildingOfficialEmail"));
    addParameter(params, "$$ChiefBuildingOfficialName$$", lookup("REPORT_VARIABLES","ChiefBuildingOfficialName"));
    addParameter(params, "$$ChiefBuildingOfficialTitle$$", lookup("REPORT_VARIABLES","ChiefBuildingOfficialTitle"));

    var applicantEmail = "";
    var conName = "";
    var contactResult = aa.people.getCapContactByCapID(capId);
    if (contactResult.getSuccess()) {
        var capContacts = contactResult.getOutput();
        for (var i in capContacts) {
            //if (capContacts[i].getPeople().getContactType() == "Applicant") {
                addParameter(params, "$$FullNameBusName$$", getContactName(capContacts[i]));
                sendEmail("no-reply@sanleandro.org", capContacts[i].getPeople().getEmail()+"", "", "BLD_WTUA_EXT_APPROVED", params, null, capId);
            //}
        }
    }
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