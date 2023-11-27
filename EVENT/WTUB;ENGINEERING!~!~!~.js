//CASANLEAN-2983
if(wfTask == "Permit Issuance" && wfStatus == "Issued") {
    var expiredLPData = validateFromCSLB(null, capId, appTypeString);
    if(expiredLPData && expiredLPData.length > 0) {
        cancel = true;
        showMessage = true;
        comment(expiredLPData.join("<br>"));
    }
}