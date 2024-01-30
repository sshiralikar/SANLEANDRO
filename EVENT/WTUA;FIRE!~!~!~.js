
if(wfTask == "Permit Issuance" || wfTask == "Issued")
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
        addParameter(params, "$$assignedToStaff$$", wfUserName);
        addParameter(params, "$$assignedUserEmail$$", vEmail);
        addParameter(params, "$$wfTaskComments$$", wfComment);
        addParameter(params, "$$ACAUrl$$", String(lookup("ACA_CONFIGS", "ACA_SITE")).split("/Admin")[0]);


        sendEmail("no-reply@sanleandro.org", applicantEmail, "", "FIRE_PERMIT_ISSUE", params, null, capId);

}