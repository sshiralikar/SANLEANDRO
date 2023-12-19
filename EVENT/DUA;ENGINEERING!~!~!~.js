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
        if("Signed Issued Permit".equals(docCategory) && String(docDescription).indexOf("AdobeSign Agreement") > -1) {            
            var capDetail = aa.cap.getCapDetail(capId).getOutput();
            var capBalance = capDetail.getBalance();                
            if(capBalance <= 0) {
                updateTask("Plans Coordination", "Fees Paid", "-Updated via Adobe Sign", "");
            } else {
                resultWorkflowTask("Plans Coordination", "Approved - Fees Due", "-Updated via Adobe Sign", "");
            }
        }
    }    
}