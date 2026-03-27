loadCustomScript("DUA_EXECUTE_DIGEPLAN_SCRIPTS");

//CASANLEAN-2982
if(documentModelArray) {
    if(documentModelArray.toArray().length > 0) {
        var documentModel = documentModelArray.toArray()[0];
        var vEntity = documentModel.getEntityID();
        var vParts = vEntity.split("-");
        capId = aa.cap.getCapID(vParts[0], vParts[1], vParts[2]).getOutput();
        var docName = documentModel.getDocName();
        var docCategory = documentModel.getDocCategory();
        var docDescription = documentModel.docDescription;
        var cap = aa.cap.getCap(capId).getOutput();
        if("Permit (Signed)".equals(docCategory) && String(docDescription).indexOf("AdobeSign Agreement") > -1) {
            var existingDocuments = aa.document.getCapDocumentList(capId, "ADMIN").getOutput();
            if(existingDocuments) {
                for(var docIndex in existingDocuments) {
                    var existingDoc = existingDocuments[docIndex];
                    var existingDocCategory = existingDoc.getDocCategory();
                    var existingDocId = existingDoc.getDocumentNo();
                    if(existingDocCategory == "Permit Template" && existingDocId) {
                        var recordTypeArray = String(cap.getCapType()).split("/");
                        var recordModule = recordTypeArray[0];
                        var removeDocResult = aa.document.removeDocumentByPK(String(existingDocId), null, null, recordModule);
                        if(removeDocResult.getSuccess()) {
                            logDebug("Successfully removed " + existingDocCategory);
                        } else {
                            logDebug("Failed to remove " + existingDocCategory + " " + removeDocResult.getErrorType() + " " + removeDocResult.getErrorMessage());
                        }
                        break;
                    }
                }
            }
            var revisions = getChildren("Engineering/Revision/NA/NA", capId);
            var newDocName = String(capId.getCustomID());
            if(revisions && revisions.length > 0) {
                newDocName += "-V" + revisions.length;
            }
            newDocName += ".pdf";
            logDebug("File name: " + newDocName);
            documentModel.setFileName(newDocName);
            documentModel.setDocName(newDocName);
            var result = aa.document.updateDocument(documentModel);
            if(result.getSuccess()) {
                logDebug("Successfully updated doc name");
            }
            var capDetail = aa.cap.getCapDetail(capId).getOutput();
            var capBalance = capDetail.getBalance();
            if(capBalance <= 0) {
                updateTask("Plans Coordination", "Fees Paid", "-Updated via Adobe Sign", "");
            } else {
                resultWorkflowTask("Plans Coordination", "Approved - Fees Due", "-Updated via Adobe Sign", "");
            }
            var capDetail = aa.cap.getCapDetail(capId).getOutput();
            var currentAssignedStaff = capDetail.getAsgnStaff();
            logDebug("Assigned staff: " + currentAssignedStaff);
            if(currentAssignedStaff) {
                var staffUser = aa.person.getUser(currentAssignedStaff).getOutput();
                var staffEmail = staffUser.email;
                logDebug("Staff email: " + staffEmail);
                if(staffEmail) {
                    var emailParams = aa.util.newHashtable();
                    emailParams.put("$$altId$$", String(capId.getCustomID()));
                    sendNotification("", staffEmail, "", "ENG_ADOBE_SIGN_UPLOADED", emailParams, []);
                }
            }

        }
    }
}
// Execute Engineering DUA logic ***DO NOT REMOVE ***
include("ES_ENG_DUA");
//