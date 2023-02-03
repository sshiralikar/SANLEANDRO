//CASANLEAN-1540
showDebug = false;
var vBalanceDue = 0.0;
var capDetailObjResult = aa.cap.getCapDetail(capId);
if (capDetailObjResult.getSuccess())
{
    capDetail = capDetailObjResult.getOutput();
    vBalanceDue = parseFloat(capDetail.getBalance());
}
aa.print("Balance Due: "+ vBalanceDue);

if(((appMatch("Building/Combo/NA/NA") && (inspType =="3000 Final - Building Permit"))||
    (appMatch("Building/Commercial/Accessory/NA") && (inspType =="3000 Final Building Permit"))||
    (appMatch("Building/Commercial/Addition/NA") && (inspType =="3000 Final Building Permit"))||
    (appMatch("Building/Commercial/Alteration/NA") && (inspType =="3000 Final Building Permit"))||
    (appMatch("Building/Commercial/Cell/NA") && (inspType =="2030 Final Electrical"))||
    (appMatch("Building/Commercial/Demolition/NA") && (inspType =="3000 Final Building Permit"))||
    (appMatch("Building/Commercial/Electric/NA") && (inspType =="2030 Final Electrical"))||
    (appMatch("Building/Commercial/Mechanical/NA") && (inspType =="2020 Final Mechanical"))||
    (appMatch("Building/Commercial/New Construction/NA") && (inspType =="3000 Final Building Permit"))||
    (appMatch("Building/Commercial/Plumbing/NA") && (inspType =="2010 Final Plumbing"))||
    (appMatch("Building/Commercial/Pool/NA") && (inspType =="3000 Final Building Permit"))||
    (appMatch("Building/Commercial/Roofing/NA") && (inspType =="1540 Final Re-Roof"))||
    (appMatch("Building/Commercial/Sign/NA") && (inspType =="1930 Final Sign"))||
    (appMatch("Building/Commercial/Solar/NA") && (inspType =="2030 Final Electrical"))||
    (appMatch("Building/Residential/Accessory/NA") && (inspType =="3000 Final Building Permit"))||
    (appMatch("Building/Residential/Addition/NA") && (inspType =="3000 Final Building Permit"))||
    (appMatch("Building/Residential/ADU/NA") && (inspType =="3000 Final Building Permit"))||
    (appMatch("Building/Residential/Alteration/NA") && (inspType =="3000 Final Building Permit"))||
    (appMatch("Building/Residential/Demolition/NA") && (inspType =="3000 Final Building Permit"))||
    (appMatch("Building/Residential/Electric/NA") && (inspType =="2030 Final Electrical"))||
    (appMatch("Building/Residential/Mechanical/NA") && (inspType =="2020 Final Mechanical"))||
    (appMatch("Building/Residential/New Construction/NA") && (inspType =="3000 Final Building Permit"))||
    (appMatch("Building/Residential/Plumbing/NA") && (inspType =="2010 Final Plumbing"))||
    (appMatch("Building/Residential/Pool/NA") && (inspType =="3000 Final Building Permit"))||
    (appMatch("Building/Residential/Roofing/NA") && (inspType =="1540 Final Re-Roof"))||
    (appMatch("Building/Residential/Solar/NA") && (inspType =="2030 Final Electrical")))
    && vBalanceDue > 0)
{
    cancel = true;
    showMessage = true;
    comment("Balance Due, Final inspection cannot be scheduled.");
}
//CASANLEAN-1504
if(publicUser && getAppStatus(capId) != "Ready for Inspection")
{
    cancel = true;
    showMessage = true;
    comment("Inspections can only be scheduled when the permit is in the status: <b>'Ready for Inspection'</b>.");
}
//CASANLEAN-1504

//CASANLEAN-1554
var useAppSpecificGroupName = true;
loadAppSpecific(AInfo);

if(!publicUser && inspType == "2050 Electrical Service Release")
{
    var fields = "";
    if(AInfo["ELECTRIC SERVICE RELEASE.Service Status"] == null || AInfo["Service Status"] == "")
        fields +="<br>  "+"Service Status";
    if(AInfo["ELECTRIC SERVICE RELEASE.Supply Service"] == null || AInfo["Supply Service"] == "")
        fields +="<br>  "+"Supply Service";
    if(AInfo["ELECTRIC SERVICE RELEASE.Meter Socket"] == null || AInfo["Meter Socket"] == "")
        fields +="<br>  "+"Meter Socket";
    if(AInfo["ELECTRIC SERVICE RELEASE.Amps"] == null || AInfo["Amps"] == "")
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
    if(AInfo["GAS SERVICE RELEASE.Service Status"] == null || AInfo["Service Status"] == "")
        fields +="<br>  "+"Service Status";
    if(AInfo["GAS SERVICE RELEASE.Supply Service"] == null || AInfo["Supply Service"] == "")
        fields +="<br>  "+"Supply Service";
    if(AInfo["GAS SERVICE RELEASE.BTU"] == null || AInfo["BTU"] == "")
        fields +="<br>  "+"Amps";
    if(fields!="")
    {
        cancel = true;
        showMessage = true;
        comment("Please fill out the following fields: "+ fields);
    }
}
var useAppSpecificGroupName = false;
loadAppSpecific(AInfo);
//CASANLEAN-1554


function getAppStatus() {
    var itemCap = capId;
    if (arguments.length == 1) itemCap = arguments[0]; // use cap ID specified in args

    var appStatus = null;
    var capResult = aa.cap.getCap(itemCap);
    if (capResult.getSuccess()) {
        licCap = capResult.getOutput();
        if (licCap != null) {
            appStatus = "" + licCap.getCapStatus();
        }
    } else {
        logDebug("ERROR: Failed to get app status: " + capResult.getErrorMessage());
    }
    return appStatus;
}