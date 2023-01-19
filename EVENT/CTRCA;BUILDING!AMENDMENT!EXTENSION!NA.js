//AAA
if(publicUser)
    aa.sendMail("no-reply@sanleandro.org", lookup("REPORT_VARIABLES","ChiefBuildingOfficialEmail"), "", capId.getCustomID()+" has been submitted please process.", "Hello "+ lookup("REPORT_VARIABLES","ChiefBuildingOfficialName")+", "+capId.getCustomID()+" has been submitted please process.");