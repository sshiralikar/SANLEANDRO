if(wfTask == ("License Issuance") && wfStatus == ("Issued") && balanceDue > 0)
{
    showMessage = true ;
    cancel = true ;
    comment("Cannot issue this license with a balance greater than zero");
}