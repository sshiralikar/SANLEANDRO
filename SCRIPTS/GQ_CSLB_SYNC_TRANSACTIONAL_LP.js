//GQ_CSLB_INTERFACE
var transLPS = getAllTransactionalLPs(capId);
for(var i in transLPS) {
    var transactionalLP = transLPS[i];
    var transactionalLPNumber = transactionalLP.licenseNbr;
    var transactionalLPType = transactionalLP.licenseType;

    //only sync with contractor types from CSLB
    if(transLPType == "Contractor") {
        logDebug("Syncing " + transactionalLPNumber + " from " + capId.getCustomID());
        var syncedRefModel = syncTransactionalLPToReferenceLP(transactionalLPNumber, transactionalLPType, transactionalLP);

        //get all current records and sync them.
        //not doing incase agency wants transactional info of lp on cap
        // var currentRecords = getRefrenceLPRecords(syncedRefModel);
        // for(var currentRecordsIndex in currentRecords) {
        //     var currentRec = currentRecords[currentRecordsIndex];
        //     syncReferenceLPToRecord(currentRec, transLPNumber, syncedRefModel);
        // }

        //finally sync the currently submitted one
        syncReferenceLPToRecord(capId, transactionalLPNumber, syncedRefModel);
    }
}