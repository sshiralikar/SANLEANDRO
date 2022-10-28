include("LICPROFLOOKUP_UPDATELP_APPLICATIONSTATUS");
include("LICPROFLOOKUP_UPDATELP_BASEFIELDS");
if(licObj.updateRecord())
    logDebug("LP Updated Successfully");
else
    logDebug("LP Update Failed");