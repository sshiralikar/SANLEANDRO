//CASANLEAN-1542 - Validates at every step of workflow
var expiredLPData = validateFromCSLB(null, capId, appTypeString);
if(expiredLPData && expiredLPData.length > 0) {
    cancel = true;
    showMessage = true;
    comment(expiredLPData.join("<br>"));
}