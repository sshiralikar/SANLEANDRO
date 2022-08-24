//Issue the business license by doing the following:  Create the license record, create the reference licensed professional for licensee lookup, expiration date and status.  This is run whenever creating or issuing the license
newLic = null;
newLicId = null ;
newLicIdString = null ;
newLicenseType = "Business";
monthsToInitialExpire = 12;
conToChange = null;
newLicId = createParent(appTypeArray[0], appTypeArray[1], appTypeArray[2], "License",null);  // create the license record
if(newLicId)
{
    newLicIdString = newLicId.getCustomID();
    updateAppStatus("Active","Originally Issued",newLicId);
    editAppName(AInfo["Doing Business As (DBA) Name"],newLicId);
    var ignore = lookup("EMSE:ASI Copy Exceptions","License/*/*/*");
    var ignoreArr = new Array();
    if(ignore != null)
        ignoreArr = ignore.split("|");
    copyAppSpecific(newLicId,ignoreArr);
}
tmpNewDate = dateAddMonths(null, monthsToInitialExpire);
if(newLicId)
{
    thisLic = new licenseObject(newLicIdString,newLicId) ;
    thisLic.setExpiration(dateAdd(tmpNewDate,0)) ;
    thisLic.setStatus("Active");

    conToChange = null;
    cons = aa.people.getCapContactByCapID(newLicId).getOutput() ;
    for (thisCon in cons)
        if (cons[thisCon].getCapContactModel().getPeople().getContactType() == "Applicant")
            conToChange = cons[thisCon].getCapContactModel();
}
if(conToChange)
{
    p = conToChange.getPeople();
    p.setContactType("License Holder");
    conToChange.setPeople(p);
    aa.people.editCapContact(conToChange);
}
copyASITables(capId,newLicId);