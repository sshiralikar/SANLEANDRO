if(wfTask == "Application Intake" && (wfStatus == "Accepted - Plan Review Not Req" || wfStatus == "Accepted - Plan Review Req"))
{
    var d = new Date();
    var year = d.getFullYear();
    var month = d.getMonth();
    var day = d.getDate();
    var c = new Date(year + 1, month+1, day);
    var newDate = c.getMonth()+"/"+c.getDate()+"/"+c.getFullYear();
    editAppSpecific("Application Expiration Date", newDate);
}
if(wfTask == "Permit Issuance" && wfStatus == "Issued")
{
    var d = new Date();
    var year = d.getFullYear();
    var month = d.getMonth();
    var day = d.getDate();
    var c = new Date(year + 1, month+1, day);
    var newDate = c.getMonth()+"/"+c.getDate()+"/"+c.getFullYear();
    editAppSpecific("Permit Expiration Date", newDate);
    editAppSpecific("Permit Issued Date", (d.getMonth()+1)+"/"+d.getDate()+"/"+d.getFullYear());
}