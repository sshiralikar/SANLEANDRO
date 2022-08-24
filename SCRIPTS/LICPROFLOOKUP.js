logDebug("Using LICENSESTATE = " + LICENSESTATE + " from EMSE:GlobalFlags"); //Issue State
LICENSETYPE = ""; //License Type to be populated
licCapId = null;
isNewLic = false;
licIDString = null;
licObj = null;
licCap = null;

include("LICPROFLOOKUP_GETLICENSES"); //Get License CAP
if(licCapId !=null)
    include("LICPROFLOOKUP_GETLICENSETYPE");
licObj = licenseProfObject(licIDString,LICENSETYPE); //Get LicArray

if(!licObj.valid && lookup("LICENSED PROFESSIONAL TYPE",LICENSETYPE) != null)
{
    include("LICPROFLOOKUP_CREATELP");
    licObj = licenseProfObject(licIDString,LICENSETYPE );
}
if(licObj.valid)
{
    include("LICPROFLOOKUP_UPDATELP");
}
else
{
    logDebug("LP Not found to update");
}