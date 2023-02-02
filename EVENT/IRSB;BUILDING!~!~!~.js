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

if(!publicUser && inspType == "2050 Electrical Service Release")
{
    var fields = "";
    if(AInfo["Service Status"] == null || AInfo["Service Status"] == "")
        fields +="<br>  "+"Service Status";
    if(AInfo["Supply Service"] == null || AInfo["Supply Service"] == "")
        fields +="<br>  "+"Supply Service";
    if(AInfo["Meter Socket"] == null || AInfo["Meter Socket"] == "")
        fields +="<br>  "+"Meter Socket";
    if(AInfo["Amps"] == null || AInfo["Amps"] == "")
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
    if(AInfo["Service Status"] == null || AInfo["Service Status"] == "")
        fields +="<br>  "+"Service Status";
    if(AInfo["Supply Service"] == null || AInfo["Supply Service"] == "")
        fields +="<br>  "+"Supply Service";
    if(AInfo["BTU"] == null || AInfo["BTU"] == "")
        fields +="<br>  "+"Amps";
    if(fields!="")
    {
        cancel = true;
        showMessage = true;
        comment("Please fill out the following fields: "+ fields);
    }
}
//CASANLEAN-1554