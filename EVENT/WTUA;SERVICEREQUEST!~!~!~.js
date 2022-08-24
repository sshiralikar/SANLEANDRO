//Schedule initial investigation when Intake task status is updated to Accepted.
//Update appStatus to Closed% when final task complete

if(wfTask == "SR Intake" && wfStatus == "Accepted")
    scheduleInspectDate("Initial Investigation",dateAdd(null,1,true));
if(wfTask == "SR Intake" && wfStatus == "Duplicate")
{
    closeTask("Final Notification","Notification Sent");
    include("SERVICEREQUESTCLOSECASE");
}
if(wfTask == "SR Intake" && wfStatus == "Referred")
{
    closeTask("Final Notification","Notification Sent");
    include("SERVICEREQUESTCLOSECASE");
}
if(wfTask == "Final Notification" && wfStatus == "Send Email")
    include("SERVICEREQUESTCLOSECASE");
if(wfTask == "Final Notification" && wfStatus == "Notification Sent")
    include("SERVICEREQUESTCLOSECASE");
if(wfTask == "Final Notification" && wfStatus == "No Notification Sent")
    include("SERVICEREQUESTCLOSECASE");