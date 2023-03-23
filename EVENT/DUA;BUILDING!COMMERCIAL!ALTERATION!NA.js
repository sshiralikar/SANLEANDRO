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
if (isTaskStatusActive("Plans Coordination", "Resubmittal Required")) {
    updateTask("Plans Coordination","In Progress","","");
}
if (isTaskStatusActive("Plans Distribution", "Resubmittal Required")) {
    updateTask("Plans Distribution","In Progress","","");
}
function isTaskStatusActive(wfstr,status) // optional process name
{
    var useProcess = false;
    var processName = "";
    if (arguments.length == 2)
    {
        processName = arguments[1]; // subprocess
        useProcess = true;
    }

    var workflowResult = aa.workflow.getTasks(capId);
    if (workflowResult.getSuccess())
        wfObj = workflowResult.getOutput();
    else
    { logMessage("**ERROR: Failed to get workflow object: " + s_capResult.getErrorMessage()); return false; }

    for (i in wfObj)
    {
        fTask = wfObj[i];
        if (fTask.getTaskDescription().toUpperCase().equals(wfstr.toUpperCase())  && (!useProcess || fTask.getProcessCode().equals(processName)))
            if (fTask.getActiveFlag().equals("Y") && fTask.getDisposition() == status)
                return true;
            else
                return false;
    }
}
