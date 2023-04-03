//CASANLEAN-1542, CASANLEAN-2646 - Validates issuance workflow
if(wfStatus == "Issued" && !appHasCondition("General", "Met", "CSLB Expired", null)) {
    var expiredLPData = validateFromCSLB(null, capId, appTypeString);
    if(expiredLPData && expiredLPData.length > 0) {
        cancel = true;
        showMessage = true;
        comment(expiredLPData.join("<br>"));
        aa.env.setValue("capId", String(capId.getCustomID()));
        var result = aa.runScriptInNewTransaction("BLD_APPLY_CSLB_CONDITION");
        //comment(result);
    }
} else {
    logDebug("Condition for CSLB Expired met...");
}