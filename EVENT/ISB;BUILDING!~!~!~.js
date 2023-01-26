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