//GQ_CSLB_INTERFACE
var transLPS = getAllTransactionalLPs(capId);
for(var i in transLPS) {
    var transactionalLP = transLPS[i];
    var transactionalLPNumber = transactionalLP.licenseNbr;
    var transactionalLPType = transactionalLP.licenseType;

    //only sync with contractor types from CSLB
    if(transactionalLPType == "Contractor") {
        logDebug("Syncing " + transactionalLPNumber + " from " + capId.getCustomID());
        var refModel = null;
        if(!grabReferenceLicenseProfessional(transactionalLPNumber, transactionalLPType)) {
            logDebug("Creating reference");
            refModel = createReferenceLicenseProf(transactionalLP, transactionalLPNumber, transactionalLPType);
        } else {
            refModel = syncTransactionalLPToReferenceLP(transactionalLPNumber, transactionalLPType, transactionalLP);
        }
        syncReferenceLPToRecord(capId, transactionalLPNumber, transactionalLPType, refModel);
    }
}