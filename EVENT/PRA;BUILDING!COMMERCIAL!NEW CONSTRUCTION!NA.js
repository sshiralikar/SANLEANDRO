//CASANLEAN-960
if(publicUser && isTaskActive("Plans Distribution") && balanceDue == 0)
    updateTask("Plans Distribution","Fees Paid","","");
//CASANLEAN-960
//CASANLEAN-963
if((wfTask == "Planning Review" || wfTask == "Public Works Review"
        || wfTask == "Environmental Services Review" || wfTask == "Engineering & Transportation")
    && (wfStatus == "Approved" || wfStatus == "Approved w/ Comments")
    && (wfHours == null || wfHours == ""))
{
    cancel = true;
    showMessage = true;
    comment("Please enter the <b>Hours Spent</b>.");
}
//CASANLEAN-963