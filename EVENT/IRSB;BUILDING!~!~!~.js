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