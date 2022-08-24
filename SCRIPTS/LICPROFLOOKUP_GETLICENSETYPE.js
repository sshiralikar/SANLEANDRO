//Used to resolve the license type
if(licCapId !=null)
{
    licIDString = licCapId.getCustomID();
}
if(licCapId !=null)
{
    licCap = aa.cap.getCap(licCapId).getOutput();
    licCapType = licCap.getCapType().toString();
    licCapTypeArr = licCapType.split("/");
    licCapStatus = licCap.getCapStatus();
}
if(licCapId !=null)
{
    if(licCapTypeArr[1] == "Business")
        LICENSETYPE = "Business";
    else
        LICENSETYPE = getAppSpecific("License Type",licCapId)+"";
}