/*if(matches(currentUserID,"ADMIN"))
{
	showDebug = 1;
	showMessage= true;
}*/
var iRec = null;
var recordArray = new Array();
recordArray = capIdsGetByAddr();
aa.print("Length: " + recordArray.length);
if(recordArray.length > 0)
{
    for(var iRec in recordArray)
        include("COMPLAINTDUPLICATECHECKLOOP");
}