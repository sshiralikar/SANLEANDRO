var workfHistory = aa.workflow.getWorkflowHistory(capId, null);
if (workfHistory.getSuccess()) {
    var wfhistoryresult = workfHistory.getOutput();
}
for (var i in wfhistoryresult) {
    var pTask = wfhistoryresult[i];
    if (pTask.getTaskDescription() == "Plans Distribution"
        && pTask.getDisposition() == "Resubmittal Required") {
        updateTask("Plans Distribution","Updated Documents","","");
        break;
    }
    if (pTask.getTaskDescription() == "Fire Plan Review"
        && pTask.getDisposition() == "Resubmittal Required") {
        updateTask("Fire Plan Review","Updated Documents","","");
        break;
    }
}
