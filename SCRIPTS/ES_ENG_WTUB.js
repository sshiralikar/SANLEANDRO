if(matches(wfStatus,"Issue","Finaled","Fees Collected","Closed") && AInfo["Blanket CN"] != "Yes" && balanceDue > 0)
{
    showMessage = true;
    comment("<font size=small><b>Balance Due:</b></font><br><br>There is a balance due for this permit.  The permit cannot be Issued or Finaled until the balance due has been paid.<br><br>");
    cancel = true;
}
if(wfStatus == "Issue" && AInfo["City Business License Verified"] == null)
{
    showMessage = true;
    comment("<font size=small><b>City Business License not Verified</b></font><br><br>The permit cannot be issued until the City License has been verified or marked not required. Please verify the city license or mark the field as not required and then issue the permit.");
    cancel=true;
}
if(matches(wfStatus,"Issue","Issued") && AInfo["OSHA Notification Required"] == "Yes" && AInfo["OSHA Notification Received"] == null)
{
    showMessage = true;
    comment("<font size=small><b>OSHA Notification Required</b></font><br><br>OSHA notification is required and has not been received. This permit cannot be issued until the OSHA notification has been marked received in the record details.<br><br>");
    cancel=true;
}
if(wfStatus == "Issue" && AInfo["Verified Insurance"] == null)
{
    showMessage = true;
    comment("<font size=small><b>Insurance Not Verified</b></font><br><br>The permit cannot be issued until the insurance requirement has been verified.");
    cancel=true;
}
if(wfStatus == "Issue" && (isTaskActive("Application Submittal","E_ENC") || isTaskActive("Engineering Review","E_ENC") || isTaskActive("Traffic Review","E_ENC") ))
{
    showMessage = true;
    comment("<font size=small><b>Active Review Task</b></font><br><br>The permit cannot be issued with an active review task.");
    cancel=true;
}
if(wfStatus == "Fees Collected" && (isTaskActive("Application Submittal","E_ENC") || isTaskActive("Engineering Review","E_ENC") || isTaskActive("Traffic Review","E_ENC") || isTaskActive("Permit Decision","E_ENC") || isTaskActive("Inspections","E_ENC") ))
{
    showMessage = true;
    comment("<font size=small><b>Active Workflow Task</b></font><br><br>The permit cannot be finaled with an active workflow task.");
    cancel=true;
}
if(matches(wfStatus,"Issue","Fees Collected") && (isTaskStatus("Engineering Review","Denied") || isTaskStatus("Traffic Review","Denied")))
{
    showMessage = true;
    comment("<font size=small><b>Denied Engineering or Traffic Review</b></font><br><br>The permit cannot be issued or finaled with a denied engineering or traffic review.");
    cancel=true;
}
if(wfStatus == "Fees Collected" && AInfo["Compaction Report Acceptable"] == "No")
{
    showMessage = true;
    comment("<font size=small><b>Compaction Report Not Acceptable</b></font><br><br>The permit cannot be finaled with a Compaction Report that is not marked acceptable.");
    cancel=true;
}
if(wfStatus == "Inspections Completed" && isScheduled(checkInspectionResult("","Scheduled")))
{
    showMessage = true;
    comment("<font size=small><b>Scheduled Inspection</b></font><br><br>There is a scheduled inspection on the permit. A permit cannot be finaled with a scheduled inspection.<br><br>");
    cancel = true;
}
if(wfStatus == "Fees Collected" && appHasCondition(null,"Not Met",null,null))
{
    showMessage = true;
    comment("<font size=small><b>Active Condition</b></font><br><br>There is an active not met condition on this record. The record cannot be finaled with a condition that has not been met.<br><br>");
    cancel = true;
}