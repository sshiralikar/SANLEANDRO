//CASANLEAN-1525
showDebug = false;
if((!inspComment || inspComment == "")
    && (inspResult == "Canceled"||inspResult == "Cancelled"||inspResult == "Partial"||inspResult == "Fail"))
{
    cancel = true;
    showMessage = true;
    showDebug = false;
    comment("Enter a result comment.");
}

//CASANLEAN-1554

//CASANLEAN-2666
if((inspResult == "Pass"||inspResult == "Pass-Revised"||inspResult == "Partial"||inspResult == "Partial-Revised"))
{
    var vGSObj;
    var x = 0;
    var vRequiredItem = "";
    var wasThereANo = false;
    var pleaseEnterComment = "";
    var gs = inspObj.getInspection().getGuideSheets();
    if (gs) {
        gsArray = gs.toArray();
        for (var loopk in gsArray) {
            var vGSItems = gsArray[loopk].getItems().toArray();
            for (x in vGSItems) {
                vGSObj = new guideSheetObject(gsArray[loopk], vGSItems[x]);
                // Check for generally required fields
                vGSObj.loadInfo();
                logDebug("vGSObj.text: " + vGSObj.text + " vGSObj.status " + vGSObj.status + "vGSObj.comment: " + vGSObj.comment);
                if (matches(vGSObj.status, "No"))//&& matches(vGSObj.comment, null, '', undefined, " "))
                {
                    wasThereANo = true;
                    pleaseEnterComment = "Please enter a comment for the below items marked as 'No'. <br>";
                    vRequiredItem += "-" + vGSObj.text;
                    vRequiredItem += "<br>";
                }
            }
        }
    }
    if (wasThereANo)
    {
        cancel = true;
        showMessage = true;
        comment( pleaseEnterComment + vRequiredItem);
    }
}
//CASANLEAN-2666

useAppSpecificGroupName = true;
loadAppSpecific(AInfo);
if(!publicUser && inspType == "2050 Electrical Service Release")
{
    var fields = "";
    if(AInfo["ELECTRIC SERVICE RELEASE.Service Status"] == null || AInfo["ELECTRIC SERVICE RELEASE.Service Status"] == "")
        fields +="<br>  "+"Service Status";
    if(AInfo["ELECTRIC SERVICE RELEASE.Supply Service"] == null || AInfo["ELECTRIC SERVICE RELEASE.Supply Service"] == "")
        fields +="<br>  "+"Supply Service";
    if(AInfo["ELECTRIC SERVICE RELEASE.Meter Socket"] == null || AInfo["ELECTRIC SERVICE RELEASE.Meter Socket"] == "")
        fields +="<br>  "+"Meter Socket";
    if(AInfo["ELECTRIC SERVICE RELEASE.Amps"] == null || AInfo["ELECTRIC SERVICE RELEASE.Amps"] == "")
        fields +="<br>  "+"Amps";
    if(fields!="")
    {
        cancel = true;
        showMessage = true;
        comment("Please fill out the following fields: "+ fields);
    }
}

if(!publicUser && inspType == "2060 Gas Service Release")
{
    var fields = "";
    if(AInfo["GAS SERVICE RELEASE.Service Status"] == null || AInfo["GAS SERVICE RELEASE.Service Status"] == "")
        fields +="<br>  "+"Service Status";
    if(AInfo["GAS SERVICE RELEASE.Supply Service"] == null || AInfo["GAS SERVICE RELEASE.Supply Service"] == "")
        fields +="<br>  "+"Supply Service";
    if(AInfo["GAS SERVICE RELEASE.BTU"] == null || AInfo["GAS SERVICE RELEASE.BTU"] == "")
        fields +="<br>  "+"Amps";
    if(fields!="")
    {
        cancel = true;
        showMessage = true;
        comment("Please fill out the following fields: "+ fields);
    }
}
useAppSpecificGroupName = false;
loadAppSpecific(AInfo);
//CASANLEAN-1554