// Enter your script here...
if(CAENumber > 0 && (CAELienseType == "Contractor")) {
    var cslbObj = validateCSLBClassifications(CAENumber, appTypeString);
    if(!cslbObj.validated) {
        cancel = true;
        showMessage = true;
        message =  "<font size=small color=red>" + cslbObj.message + "</font>";
    }
}