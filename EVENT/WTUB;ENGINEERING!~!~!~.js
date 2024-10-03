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
                var notifications = [];
                for(var i in cslbResults) {
                    var cslbResult = cslbResults[i];
                    var cslbValidationResults = cslbResult.messages;
                    if(cslbValidationResults.length > 0) {
                        errors.push(cslbValidationResults.join("<BR>"));
                        if(lpRefId && !checkRefLPConditionsBySeq(lpRefId, "Contractor CSLB Information Expired")) {
                            // addRefLPConditionBySeq(lpRefId, "Engineering", "Contractor CSLB Information Expired", cslbValidationResults.join("\n"), "Notice", "Not Met");
                            if(transLP && capId) {
                                var transLPEmail = transLP.email;
                                var capDetail = aa.cap.getCapDetail(capId).getOutput();
                                var currentAssignedStaff = capDetail.getAsgnStaff();
                                logDebug("Assigned staff: " + currentAssignedStaff);
                                var staffUser = aa.person.getUser(currentAssignedStaff).getOutput();
                                var staffEmail = staffUser.email;
                                //CASANLEAN-3005
                                if(transLPEmail && staffEmail) {
                                    var emailObj = {
                                        toAddress: String(transLPEmail).toLowerCase(),
                                        ccAddress: String(staffEmail).toLowerCase(),
                                        parameters: {
                                            licNum: String(transLPNumber),
                                            expiredData: String(cslbValidationResults.join("\n")),
                                            businessName: String(transLP.businessName),
                                            altId: String(capId.getCustomID()),
                                        },
                                        record: String(capId.getCustomID()),
                                        lpRefId: String(lpRefId),
                                    }
                                    notifications.push(emailObj);
                                    // var emailParams = aa.util.newHashtable();
                                    // // emailParams.put("$$licNum$$", String(transLPNumber));
                                    // // emailParams.put("$$expiredData$$", cslbValidationResults.join("\n"));
                                    // // emailParams.put("$$businessName$$", String(transLP.businessName));
                                    // // emailParams.put("$$altId$$", String(capId.getCustomID()));
                                    // // logDebug("Sending email to: " + transLPEmail);
                                    // // logDebug("Staff CC: " + staffEmail);
                                    // // sendNotification("", String(transLPEmail), String(staffEmail), "ENG_CSLB_EXPIRED_CONTRACTOR_INFO", emailParams, [], capId);
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
        comment("<font style='color:red;'><b>" + errors.join("<br>") + "</b></font>");
        aa.print(errors.join("\n"));
        cancel = true;
        if(notifications.length > 0) {
            aa.env.setValue("emailData", JSON.stringify(notifications));
            var result = aa.runScriptInNewTransaction("GQ_CSLB_SEND_EXPIRED_NOTICE");
        }
    }
}

//PINS
if(wfTask == "Plans Coordination" && wfStatus == "Hold for Signature") {
    var pinsValidationErrors = [];
    var professionals = getAllTransactionalLPs(capId);
    if(professionals) {
        var pinIDsToCheck = [];
        var idsToUpdate = [];
        var pinsAuth = getPINSAuthObject();
        var templateRequirementsObj = getPINSTemplateRequirements(capId, pinsAuth);
        for(var i in professionals) {
            var lp = professionals[i];
            var licNum = lp.licenseNbr;
            var pinsId = getLPAttribute(licNum, "PINS Reference ID");
            logDebug(pinsId);
            if(pinsId) {
                logDebug("Already created in PINS");
                pinIDsToCheck.push( {
                    licNum: String(licNum),
                    pinsId: String(pinsId)
                });
                continue;
            }
            logDebug(licNum + " missing in PINS");
            var refLp = grabReferenceLicenseProfessional(licNum);
            var licSeqNumber = refLp.licSeqNbr;
            var lpName = refLp.businessName;
            var lpEmail = refLp.EMailAddress;
            var lpAddress = refLp.address1;
            var lpCity = refLp.city;
            var lpState = refLp.licState;
            var lpCountry = "US";
            var lpZip = refLp.zip;
            var insuredObj = createPINSInsured(lpName, lpEmail, lpName, lpAddress, lpCity, lpState, lpCountry, lpZip, "Contractor", "Contractor", licNum, pinsAuth);
            if(insuredObj) {
                // updateLPAttribute(licNum, "PINS Reference ID", insuredObj.id);
                pinsValidationErrors.push(licNum + " was not in PINS and therefore could not reach requirements");
                idsToUpdate.push({
                    licNum: String(licNum),
                    pinsId: String(insuredObj.id)
                })
                createPINSRecord(insuredObj.id, "", templateRequirementsObj.id, templateRequirementsObj.name, pinsAuth);
            }
        }
        logDebug("IDS to check: " + pinIDsToCheck);
        if(templateRequirementsObj && pinIDsToCheck.length > 0) {
            for(var pinsIdIndex in pinIDsToCheck) {
                var pinsObj = pinIDsToCheck[pinsIdIndex];
                var insuredRecords = getInsuredRecords(pinsObj.pinsId, pinsAuth);
                var createRecord = true;
                if(insuredRecords && insuredRecords.length > 0) {
                    for(var recordIndex in insuredRecords) {
                        var insuredRecord = insuredRecords[recordIndex];
                        var insuredRecordName = insuredRecord.contract_number;
                        if(insuredRecordName == templateRequirementsObj.name) {
                            logDebug("Template " + templateRequirementsObj.name + " is already a record on the insured");
                            createRecord = false;
                            break;
                        }
                    }
                }
                if(createRecord) {
                    pinsValidationErrors.push(pinsObj.licNum + " was missing " + templateRequirementsObj.name + " requirements");
                    createPINSRecord(pinsObj.pinsId, "", templateRequirementsObj.id, templateRequirementsObj.name, pinsAuth);
                } else {
                    var validated = validateInsured(pinsObj.pinsId, templateRequirementsObj.name, pinsAuth);
                    if(!validated) {
                        pinsValidationErrors.push(pinsObj.licNum + " has not fufilled " + templateRequirementsObj.name + " requirements");
                    }
                }
            }
        }
        if(idsToUpdate.length > 0) {
            aa.env.setValue("pinsData", JSON.stringify(idsToUpdate));
            var result = aa.runScriptInNewTransaction("GQ_PINS_UPDATE_REFERENCE_CONTRACTOR");
        }
        if(pinsValidationErrors.length > 0) {
            showMessage = true;
            comment("<font style='color:red;'><b>" + pinsValidationErrors.join("<BR>") + "</b></font>");
            cancel = true;
        }
    }
}