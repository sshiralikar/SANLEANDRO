//CASANLEAN-473
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
}
//CASANLEAN-473