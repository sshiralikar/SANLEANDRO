//CASANLEAN-480
var params = aa.util.newHashtable();

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
addParameter(params, "$$ACAUrl$$", lookup("ACA_CONFIGS", "ACA_SITE"));
sendEmail("", applicantEmail, "", "BLD_ACA_APPLICATION_RECEIVED", params, null, capId);
//CASANLEAN-124

function sendEmail(fromEmail, toEmail, CC, template, eParams, files) { // optional: itemCap
    var itemCap = capId;
    if (arguments.length == 7)
        itemCap = arguments[6]; // use cap ID specified in args

    //var sent = aa.document.sendEmailByTemplateName(fromEmail, toEmail, CC, template, eParams, files);

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