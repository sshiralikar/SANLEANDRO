//CASANLEAN-472
if(wfTask == "Plans Coordination" && wfStatus == "Approved - Fee Due" && balanceDue <= 0)
{
    cancel = true;
    showMessage = true;
    comment("The fee balance is <b>Zero</b>.");
}
//CASANLEAN-472
//CASANLEAN-944
if((wfTask == "Planning Review" || wfTask == "Public Works Review"
        || wfTask == "Environmental Services Review")
    && (wfStatus == "Approved" || wfStatus == "Approved w/ Comments")
    && (wfHours == null || wfHours == ""))
{
    cancel = true;
    showMessage = true;
    comment("Please enter the <b>Hours Spent</b>.");
}
//CASANLEAN-944