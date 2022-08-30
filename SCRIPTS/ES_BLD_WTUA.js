if(matches(wfTask,"Inspections","Consolidated Comments") && matches(wfStatus,"Revision") && AInfo["RevisionNo"] != null)
{
    nextRev = parseInt(AInfo["RevisionNo"]) + 1;
    editAppSpecific("RevisionNo",nextRev);
    updateAppStatus("Revision "+nextRev);
}
if(matches(wfTask,"Inspections","Consolidated Comments") && matches(wfStatus,"Revision") && AInfo["RevisionNo"] == null)
    editAppSpecific("RevisionNo","1"); updateAppStatus("Revision 1","Revision needed");
if(matches(wfTask,"Consolidated Comments") && matches(wfStatus,"Resubmittal") && AInfo["ResubmittalNo"] != null)
{
    nextRes = parseInt(AInfo["ResubmittalNo"]) + 1;
    editAppSpecific("ResubmittalNo",nextRes);updateAppStatus("Resubmittal "+nextRes);
}
if(matches(wfTask,"Consolidated Comments") && matches(wfStatus,"Resubmittal") && AInfo["ResubmittalNo"] == null)
    editAppSpecific("ResubmittalNo","1"); updateAppStatus("Resubmittal 1","Resubmittal");
if(appMatch("*/*/Residential Water Heater/*") && AInfo["Water Heater 90 Gallons or Less"] == "CHECKED")
    addFee("PWTH","B_WTRHTR","FINAL",1,"N");
if(appMatch("*/*/Residential Water Heater/*") && AInfo["Water Heater 90 Gallons or Less"] != "CHECKED")
    addFee("PWTI","B_WTRHTR","FINAL",1,"N");
if(appMatch("Building/*/*/*") && matches(wfStatus,"Issued","Re-Issue"))
    editAppSpecific("Permit Expiration Date",dateAdd(null,181));
if(wfTask == "Inspections" && wfStatus == "180 Day Extension")
    editAppSpecific("Permit Expiration Date",dateAdd(null,180));
if(appMatch("*/Service Request/*/*") && wfStatus == "Courtesy Notice of Violation")
    editAppSpecific("Initial Violation Date",dateAdd(null,0));
if(appMatch("*/Service Request/*/*") && wfStatus == "Notice of Violation 1")
    editAppSpecific("Notice 1",dateAdd(null,0));
if(appMatch("*/Service Request/*/*") && wfStatus == "Notice of Violation 2")
    editAppSpecific("Notice 2",dateAdd(null,0));
if(appMatch("*/Combo/*/*")&& wfTask == "Engineering Review")
    editAppSpecific("ENG Due Date", jsDateToASIDate(getTaskDueDate("Engineering Review")));
if(wfStatus ==  "Resubmittal")
    editAppSpecific("Resubmittal", wfDateMMDDYYYY);
if(appMatch("*/Combo/*/*"))
    editAppSpecific("Engineering Review Status", taskStatus("Engineering Review"));
include("WTUA_EXECUTE_DIGEPLAN_SCRIPTS_BLD");