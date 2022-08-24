if(matches(currentUserID,"ADMIN"))
{
    showDebug = 1;
    showMessage= true;
}
iRec = null;
recordArray = new Array();
recordArray = capIdsGetByAddr();
aa.print("Length: " + recordArray.length);
if(recordArray.length > 0)
    for(iRec in recordArray)
        include("SERVICEREQUESTDUPLICATECHECKLOOP");