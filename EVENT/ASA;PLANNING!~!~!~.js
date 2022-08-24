if(matches(currentUserID,"ADMIN"))
{
    showDebug = false;
    showMessage= false;
}
include("SETCONTACTRELATIONSHIPTOCONTACTTYPE");
docPreCache = digEplanPreCache("sanleandro",capIDString,lookup("EXTERNAL_DOC_REVIEW","ENVIRONMENT"));