//CASANLEAN-2983
if(wfTask == "Plans Coordination" && wfStatus == "Hold for Signature") {
    var transLPS = getAllTransactionalLPs(capId);
    var errors = [];
    if(transLPS) {
        logDebug("LPS total: " + transLPS.length);
        for(var i in transLPS) {
            var transLP = transLPS[i];
            var transLPNumber = transLP.licenseNbr;
            var transLPType = transLP.licenseType;
            logDebug(transLPNumber + " : " + transLPType);
            if(transLPType == "Contractor") {
                var refLpModel = grabReferenceLicenseProfessional(transLPNumber);
                var hasOverride = false;
                if(refLpModel) {
                    var lpRefId = refLpModel.licSeqNbr;
                    hasOverride = checkRefLPConditionsBySeq(lpRefId, "CSLB Override");
                }
                if(hasOverride) {
                    logDebug("No longer blocking due to override on reference LP");
                    continue;
                }
                var cslbResults = validateLPWithCSLB(transLPNumber, null, true, true, false, true, appTypeString);
                for(var i in cslbResults) {
                    var cslbResult = cslbResults[i];
                    var cslbValidationResults = cslbResult.messages;
                    if(cslbValidationResults.length > 0) {
                        errors.push(cslbValidationResults.join("<BR>"));
                    }
                }
            }
        }

    }
    if(errors.length > 0)  {
        showMessage = true;
        comment(errors.join("<br>"));
        aa.print(errors.join("\n"));
        cancel = true;
    }
}