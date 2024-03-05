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
                var lpRefId = null;
                if(refLpModel) {
                    lpRefId = refLpModel.licSeqNbr;
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
                        if(lpRefId && !checkRefLPConditionsBySeq(referenceSeqNumber, "Contractor CSLB Information Expired")) {
                            addRefLPConditionBySeq(lpRefId, "Engineering", "Contractor CSLB Information Expired", cslbValidationResults.join("\n"), "Notice", "Not Met");
                            if(transLP && capId) {
                                var transLPEmail = transLP.email;
                                var capDetail = aa.cap.getCapDetail(capId).getOutput();
                                var currentAssignedStaff = capDetail.getAsgnStaff();
                                logDebug("Assigned staff: " + currentAssignedStaff);
                                var staffUser = aa.person.getUser(currentAssignedStaff).getOutput();
                                var staffEmail = staffUser.email;
                                //CASANLEAN-3005
                                if(transLPEmail && staffEmail) {
                                    var emailParams = aa.util.newHashtable();
                                    emailParams.put("$$licNum$$", String(transLPNumber));
                                    emailParams.put("$$expiredData$$", cslbValidationResults.join("\n"));
                                    emailParams.put("$$businessName$$", String(transLP.businessName));
                                    emailParams.put("$$altId$$", String(capId.getCustomID()));
                                    logDebug("Sending email to: " + transLPEmail);
                                    logDebug("Staff CC: " + staffEmail);
                                    sendNotification("", String(transLPEmail), String(staffEmail), "ENG_CSLB_EXPIRED_CONTRACTOR_INFO", emailParams, [], capId);
                                }
                            }
                        } else {
                            logDebug(transLPNumber + " already has condition");
                        }
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