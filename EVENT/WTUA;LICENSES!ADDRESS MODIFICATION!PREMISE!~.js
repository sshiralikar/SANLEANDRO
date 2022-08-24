//Workflow results of the premise address modification
addrsToRemove = null;
parentCapId = getParent();
if(parentCapId && wfTask.equals("Amendment Approval") && wfStatus.equals("Approved"))
{
    addrsToRemove = aa.address.getAddressByCapId(parentCapId).getOutput();
}
if(addrsToRemove)
{
    for (x in addrsToRemove )
        aa.address.removeAddress(parentCapId, addrsToRemove[x].getAddressId());
}
if(parentCapId && wfTask.equals("Amendment Approval") && wfStatus.equals("Approved"))
    copyAddresses(capId,parentCapId);
if(parentCapId && wfTask.equals("Amendment Approval") && wfStatus.equals("Approved"))
    include("LICPPROFLOOKUP");