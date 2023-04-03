//CASANLEAN-1542, CASANLEAN-2646 - Validates issuance workflow
if(wfStatus == "Issued" && !appHasCondition("General", "Met", "CSLB Expired", null)) {
    var expiredLPData = validateFromCSLB(null, capId, appTypeString);
    if(expiredLPData && expiredLPData.length > 0) {
        cancel = true;
        showMessage = true;
        comment(expiredLPData.join("<br>"));
        addStdCondition("General", "CSLB Expired", capId);
    }
} else {
    logDebug("Condition for CSLB Expired met...");
}