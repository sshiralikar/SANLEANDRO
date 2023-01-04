if(isTaskActive("Inspection") && inspResult == "Finaled")
{
    updateTask("Inspection"," Final Inspection Complete","","");
    //activateTask("Permit Issuance");
    deactivateTask("Inspection");
    aa.workflow.adjustTask(capId, "Inspection", "N", "Y", null, null);
    updateAppStatus("Finaled","Updated through script");
}