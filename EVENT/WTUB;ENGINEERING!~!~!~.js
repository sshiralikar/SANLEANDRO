//CASANLEAN-2983
if(wfTask == "Plans Coordination" && wfStatus == "Hold for Signature") {
    var expiredLPData = validateFromCSLBEng(null, capId, appTypeString);
    if(expiredLPData && expiredLPData.length > 0) {
        cancel = true;
        showMessage = true;
        comment(expiredLPData.join("<br>"));
    }
    //Contractor CSLB Information Expired
}