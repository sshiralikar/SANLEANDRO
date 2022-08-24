//NOTE: Update General Items.  Need valid licObj, licCapId, licCap populated
licObj.refLicModel.setState(LICENSESTATE);
licObj.refLicModel.setLicenseBoard(LICENSETYPE);
licObj.refLicModel.setLicenseIssueDate(licCap.getFileDate());
var expObj = null;
var expDt = null;
var expObjRes = aa.expiration.getLicensesByCapID(licCapId);
if(expObjRes.getSuccess())
    expObj = expObjRes.getOutput();
if(expObj != null)
    expDt = aa.date.parseDate(expObj.getExpDateString());
if(expDt != null)
    licObj.refLicModel.setLicenseExpirationDate(expDt); //Expiration Date
if(licCapTypeArr[1] == "Business")
{
    licObj.refLicModel.setLicenseBoard(getAppSpecific("Business Type",licCapId));
}
else
{
    licObj.refLicModel.setLicenseBoard(LICENSETYPE);
}
if(licObj.updateFromRecordContactByType(licCapId,"",true,false))
{
    logDebug("LP Updated from Primary Contact");
}
else
{
    logDebug("LP Failed to Update from Primary Contact trying License Holder");
    if(licObj.updateFromRecordContactByType(licCapId,"License Holder",true,false))
        logDebug("Updated from License Holder");
    else
        logDebug("Couldn't Update Contact Info");
}
if(licObj.updateFromAddress(licCapId))
{
    logDebug("LP Address Updated from License Address");
}
else
{
    logDebug("LP Address Failed to update from License Address");
}