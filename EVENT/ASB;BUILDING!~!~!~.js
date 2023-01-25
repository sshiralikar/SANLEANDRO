//CASANLEAN-1519
var lpList = aa.env.getValue("LicProfList");
if(lpList) {
    lpList = lpList.toArray();
    logDebug("LPs: " + lpList.length);
    var errors = [];
    for(var lpIndex in lpList) {
        var lpObj = lpList[lpIndex];
        var lpType = lpObj.licenseType;
        var licenseNumber = lpObj.licenseNbr;
        if(lpType == "Contractor") {
            var cslbObj = validateCSLBClassifications(licenseNumber, appTypeString);
            if(!cslbObj.validated) {
                errors.push("<font size=small color=red>" + cslbObj.message + "</font>");
            }
        }    
    }
    if(errors.length > 0) {
        showMessage = true;
        comment(errors.join("<br>"));
        cancel = true;
        logDebug(errors.join("<br>"));
    }
}