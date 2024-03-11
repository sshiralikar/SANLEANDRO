//GQ_CSLB_INTERFACE
var transLPS = getAllTransactionalLPs(capId);
for(var i in transLPS) {
    var transLP = transLPS[i];
    var transLPNumber = transLP.licenseNbr;
    var transLPType = transLP.licenseType;

    //only sync with contractor types from CSLB
    if(transLPType == "Contractor") {
        logDebug("Syncing " + transLPNumber + " from " + capId.getCustomID());
        var syncedRefModel = syncTransactionalLPToReferenceLP(transLPNumber, transLP);

        //get all current records and sync them.
        //not doing incase agency wants transactional info of lp on cap
        // var currentRecords = getRefrenceLPRecords(transLPNumber, syncedRefModel);
        // for(var currentRecordsIndex in currentRecords) {
        //     var currentRec = currentRecords[currentRecordsIndex];
        //     syncReferenceLPToRecord(currentRec, transLPNumber, syncedRefModel);
        // }

        //finally sync the currently submitted one
        syncReferenceLPToRecord(capId, transLPNumber, syncedRefModel);
    }
}