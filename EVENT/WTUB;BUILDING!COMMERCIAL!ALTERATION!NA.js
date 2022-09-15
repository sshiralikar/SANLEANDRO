if(wfTask == "Plans Coordination" && wfStatus == "Approved - Fee Due" && balanceDue <= 0)
{
    cancel = true;
    showMessage = true;
    comment("The fee balance is <b>Zero</b>.");
}