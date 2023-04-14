var batchJobName = "PURGE_TMP_RECORDS";
var batchJobDesc = "PURGE_TMP_RECORDS";
var batchJobResult = "PURGE_TMP_RECORDS";
var sysDate = aa.date.getCurrentDate();
var batchJobID = aa.batchJob.getJobID().getOutput();
var removeResult = aa.cap.removeExpiredIncompleteCAP();
if(removeResult.getSuccess())
{
    aa.print("passed");
    aa.env.setValue("ScriptReturnCode","0");
    aa.env.setValue("ScriptReturnMessage","Remove expired incomplete CAPS successful");
    aa.eventLog.createEventLog("Cleared Incomplete CAPs successfully", "Batch Process", batchJobName, sysDate, sysDate,batchJobDesc, batchJobResult, batchJobID);
}
else
{
    aa.print("failed");
    aa.env.setValue("ScriptReturnCode","1");
    aa.env.setValue("ScriptReturnMessage","Remove expired incomplete CAPS failed");
}