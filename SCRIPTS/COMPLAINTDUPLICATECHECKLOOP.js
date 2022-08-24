var vApp = null;
var vApp = recordArray[iRec];
var vCap = aa.cap.getCap(vApp).getOutput();
var vAppTypeString = vCap.getCapType().toString();
var vFileDateObj = vCap.getFileDate();
var bAppTypeMatch = false;
var bASIMatch = false;

if(appMatch(vAppTypeString) && (vApp.equals(capId) == false))
{
    bAppTypeMatch = true;
}
if(bAppTypeMatch && getAppSpecific("Complaint Type",capId).equals(getAppSpecific("Complaint Type",vApp)))
{
    bASIMatch = true;
    //aa.print("Complaint Types: " + getAppSpecific("Complaint Type",capId)+ "=" + getAppSpecific("Complaint Type",vApp));
}
if(bAppTypeMatch && bASIMatch)
{
    sysDateMMDDYYYY = dateFormatted(sysDate.getMonth(),sysDate.getDayOfMonth(),sysDate.getYear(),"MM/DD/YYYY");
    vFileDate = "" + vFileDateObj.getMonth() + "/" + vFileDateObj.getDayOfMonth() + "/" + vFileDateObj.getYear();
}
if(bAppTypeMatch && bASIMatch && dateDiff(vFileDate, sysDateMMDDYYYY) < 3 )
{
    updateAppStatus("Potential Duplicate","This is a potential duplicate of Record ID: " + vApp.getCustomID());
    createCapComment("This is a potential duplicate of Record ID: " + vApp.getCustomID());
}