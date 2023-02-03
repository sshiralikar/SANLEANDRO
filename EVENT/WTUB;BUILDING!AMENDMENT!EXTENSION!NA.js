//CASANLEAN-1589
if(wfStatus == "Approved" && (AInfo["Permit New Expiration Date"] == null || AInfo["Permit New Expiration Date"] == ""))
{
    cancel = true;
    showMessage = true;
    comment("Please go populate the Permit New Expiration Date in Project Details tab.");
}