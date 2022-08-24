//NOTE: Create new LP for Lic or Temp, if lic and temp exists then temp is disabled must have licCap, licIDString

var vNewLic = aa.licenseScript.createLicenseScriptModel();
vNewLic.setAgencyCode(aa.getServiceProviderCode());
vNewLic.setAuditDate(sysDate);
vNewLic.setAuditID(currentUserID);
vNewLic.setAuditStatus("A");
vNewLic.setLicenseType(LICENSETYPE);
vNewLic.setLicState(LICENSESTATE);
vNewLic.setStateLicense(licIDString);

aa.licenseScript.createRefLicenseProf(vNewLic);
var tmpLicObj = licenseProfObject(licIDString,LICENSETYPE);

if(tmpLicObj.valid)
    isNewLic = true;