if(wfTask == "Extension" && wfStatus == "Approved")
{
    var c = new Date();
    c.setFullYear(c.getFullYear() + 1);
    var newDate = c.getMonth()+1+"/"+c.getDate()+"/"+c.getFullYear();
    editAppSpecific("Permit New Expiration Date", newDate);
}