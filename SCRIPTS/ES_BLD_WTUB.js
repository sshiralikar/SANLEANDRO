if(matches(wfStatus,"Certificate of Completion Issued","Certificate of Occupancy Issued","Finaled") && appHasCondition(null,"Not Met",null,null))
{
    showMessage = true;
    comment("<font size=small><b>Active Condition</b></font><br><br>There is an active not met condition on this record. The record cannot be finaled with a condition that has not been met.<br><br>");
    cancel = true;
}
if(matches(wfStatus,"Issued","Re-Issue","Finaled","Closed") && balanceDue > 0)
{
    showMessage = true;
    comment("<font size=small><b>Balance Due:</b></font><br><br>There is a balance due for this permit.  The permit cannot be Issued or Finaled until the balance due has been paid.<br><br>");
    cancel = true;
}
if(!matches(AInfo["ParcelAttribute.FLOODZONE"], "NONE","None","X","X SHADED, NONE","X Shaded","X Shaded, None","XS") && matches(wfStatus,"Issued","Re-Issue") && isTaskComplete("Flood Review") == false && matches(AInfo["Type of Work"],"Addition","New Construction","New Duplex","Move Building"))
{
    showMessage = true;
    comment("<font size=small><b>Flood Zone Review Not Complete</b></font><br><br>This parcel is in a flood zone and requires a Flood Zone Review before being issued.<br><br>");
    cancel = true;
}