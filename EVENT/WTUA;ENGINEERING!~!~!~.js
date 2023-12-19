if(wfTask == "Plans Coordination" && wfStatus == "Hold for Signature") {
    var reportParams = aa.util.newHashtable();
    reportParams.put("RECORD_ID", String(capId.getCustomID()));
    var reportResult = generateReportSavetoEDMS(capId, "Adobe Sign Test Report", "Engineering", reportParams);
    logDebug("Generated report: " + reportResult);
    if(reportResult) {
        runAsyncEvent("ENG_ADOBE_SIGN_ASYNC", String(capId.getCustomID()), "ADMIN");
    }
}