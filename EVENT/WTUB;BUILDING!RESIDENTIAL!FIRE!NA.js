if((wfTask == "Plans Coordination" || wfTask == "Fire Plan Review")
    && (wfStatus == "Approved - Fee Due" || wfStatus == "Approved - Fees Due") && balanceDue <= 0)
{
    cancel = true;
    showMessage = true;
    comment("The fee balance is <b>Zero</b>.");
}
if((wfTask == "Planning Review" || wfTask == "Public Works Review"
        || wfTask == "Environmental Services Review")
    && (wfStatus == "Approved" || wfStatus == "Approved w/ Comments")
    && (wfHours == null || wfHours == ""))
{
    cancel = true;
    showMessage = true;
    comment("Please enter the <b>Hours Spent</b>.");
}