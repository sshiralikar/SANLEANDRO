if(wfTask == "Application Intake" && (wfStatus == "Accepted - Plan Review Not Req" || wfStatus == "Accepted - Plan Review Req"))
{
    var c = new Date();
    c.setFullYear(c.getFullYear() + 1);
    var newDate = c.getMonth()+1+"/"+c.getDate()+"/"+c.getFullYear();
    editAppSpecific("Application Expiration Date", newDate);
}