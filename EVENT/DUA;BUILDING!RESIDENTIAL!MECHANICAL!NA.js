var workfHistory = aa.workflow.getWorkflowHistory(capId, null);
if (workfHistory.getSuccess()) {
    var wfhistoryresult = workfHistory.getOutput();
}
for (var i in wfhistoryresult) {
    var pTask = wfhistoryresult[i];
    if (pTask.getTaskDescription() == "Plans Distribution"
        && pTask.getDisposition() == "Resubmittal Required") {
        updateTask("Plans Distribution","Updated Documents","","");
        updateAppStatus("In Review","Updated through script");
        break;
    }
    if (isTaskActive("Fire Plan Review") && pTask.getTaskDescription() == "Fire Plan Review"
        && pTask.getDisposition() == "Resubmittal Required") {
        updateTask("Fire Plan Review","Updated Documents","","");
        updateAppStatus("In Review","Updated through script");
        break;
    }
    if (isTaskActive("Plans Distribution") && pTask.getTaskDescription() == "Plans Coordination"
        && pTask.getDisposition() == "Resubmittal Required") {
        updateTask("Plans Distribution","Updated Documents","","");
        updateAppStatus("In Review","Updated through script");
        break;
    }
}
