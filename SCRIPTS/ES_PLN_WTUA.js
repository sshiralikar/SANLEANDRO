if(wfTask == "Completeness Review" && matches(wfStatus,"Complete","Full Application"))
    activateTask("CEQA Review");
if(wfTask == "CEQA Review" && matches(wfStatus,"CEQA Process Complete","Project Exempt","Not a Project Under CEQA","Post Notice of Exemption"))
    setTask("CEQA Review","N","Y");
if(wfTask == "Staff Action" && wfStatus == "SDSC")
{
    activateTask("Site Development Sub-Commission");
    setTask("Staff Action","N","Y");
    updateAppStatus("Site Dev Sub-Commission","Updated by Script");
}
if(wfTask == "Staff Action" && wfStatus == "PC")
{
    activateTask("Planning Commission");
    setTask("Staff Action","N","Y");
    updateAppStatus("Planning Commission","Updated by Script");
}
if(wfTask == "Staff Action" && wfStatus == "BZA")
{
    activateTask("Board of Zoning Adjustments");
    setTask("Staff Action","N","Y");
    updateAppStatus("Board of Zoning Adjustments","Updated by Script");
}
if(appMatch("*/Pre Application/*/*") && wfStatus == "Start Entitlement")
    createChild("Planning","Project","NA","NA","");
if(appMatch("*/Project/*/*") && wfTask == "Final Action" && wfStatus == "Appealed")
    createChild("Planning","Appeal","NA","NA","");
if(appMatch("*/Project/*/*"))
    editAppSpecific("ENG Due Date", jsDateToASIDate(getTaskDueDate("Engineering - Land Use")));
if(wfStatus ==  "Resubmittal")
    editAppSpecific("Resubmittal", wfDateMMDDYYYY);
include("WTUA_EXECUTE_DIGEPLAN_SCRIPTS_PLN");