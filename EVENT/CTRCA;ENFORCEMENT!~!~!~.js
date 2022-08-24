if(matches(currentUserID,"ADMIN"))
{
    showDebug = false;
    showMessage= false;
}
include("COMPLAINTDUPLICATECHECK");
include("SETCONTACTRELATIONSHIPTOCONTACTTYPE");