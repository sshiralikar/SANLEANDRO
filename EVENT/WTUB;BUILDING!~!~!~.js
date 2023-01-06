if((wfTask == "Application Intake" && wfStatus == "Accepted - Plan Review Not Req") || (wfTask == "Plans Coordination" && wfStatus == "Approved - Fee Due")) {
    var expiredLPData = validateFromCSLB(null, capId);
    if(expiredLPData && expiredLPData.length > 0) {
        cancel = true;
        showMessage = true;
        comment(expiredLPData.join("<br>"));
    }
}