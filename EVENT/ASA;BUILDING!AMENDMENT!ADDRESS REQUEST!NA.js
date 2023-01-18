var vParentId = getParent();
if (vParentId != null && vParentId != false && vParentId != "undefined") {
    copyContacts(vParentId, capId);
    copyParcels(vParentId,capId);
    copyOwnersByParcel();
    copyAddresses(vParentId, capId);
    updateWorkDesc(vParentId,capId);
}