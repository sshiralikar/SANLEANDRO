//CASANLEAN-1525
if((!inspResultComment  || inspResultComment  == "")
    && (inspResult == "Canceled"||inspResult == "Cancelled"||inspResult == "Partial-Revised"||inspResult == "Partial-Revised"))
{
    cancel = true;
    showMessage = true;
    comment("Enter a result comment.");
}

//CASANLEAN-1554

if(inspResult == "Pass"||inspResult == "Fail"||inspResult == "Partial")
{
    showMessage = true;
    comment("You are selecting a status that will NOT generate an email or report to the customer");
}
//CASANLEAN-2666
if((inspResult == "Pass"||inspResult == "Pass-Revised"||inspResult == "Partial"||inspResult == "Partial-Revised"))
{
    var vGSObj;
    var x = 0;
    var vRequiredItem = "";
    var wasThereANo = false;
    var pleaseEnterComment = "";
    var r = aa.inspection.getInspections(capId);
    if (r.getSuccess()) {
        var inspArray = r.getOutput();
        for (i in inspArray) {
            if (inspArray[i].getIdNumber() == inspId) {
                var inspModel = inspArray[i].getInspection();
                var gs = inspModel.getGuideSheets()
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
                                //pleaseEnterComment = "Please enter a comment for the below items marked as 'No'. <br>";
                                pleaseEnterComment = "You cannot result this inspection with failed guidesheet item(s), please either correct guidesheet item(s) or fail the inspection. <br>";
                                vRequiredItem += "-> " + vGSObj.text;
                                vRequiredItem += "<br>";
                            }
                        }
                    }
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