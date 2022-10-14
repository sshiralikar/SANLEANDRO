//CASANLEAN-1244
if(wfTask == "Plans Coordination" && wfStatus == "Hold for Hard Copies")
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
    sendEmail("", applicantEmail, "", "BLD_HOLD_FOR_HARD_COPIES", params, null, capId);
}
//CASANLEAN-1244