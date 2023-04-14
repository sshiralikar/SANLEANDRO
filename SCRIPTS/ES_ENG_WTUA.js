showDebug=true;
showMessage=true;
if(appMatch("Engineering/Grading/*/*")&& wfTask=="Permit Decision"&& wfStatus =="Issued")
    editAppSpecific("Issued Date", wfDateMMDDYYYY);
if(appMatch("*/Encroachment/*/*") && matches(wfStatus,"Issue"))
    editAppSpecific("Permit Expiration Date",dateAdd(null,91));
if(appMatch("*/Grading/*/*") && matches(wfStatus,"Issued"))
    editAppSpecific("Permit Expiration Date",dateAdd(null,181));
if(wfStatus == "Route" && AInfo["Traffic Control"] == "Yes" && !isTaskComplete == "Traffic Control")
    email("rchen@sanleandro.org","noreply@accela.com","Traffic Control Review Requested","A Traffic Control review is requested for " + capIDString + ", " + capName + ".");email("dhsiao@sanleandro.org","noreply@accela.com","Traffic Control Review Requested","A Traffic Control review is requested for " + capIDString + ", " + capName + ".");
if(wfHours > 0 && wfStaffUserID == "ASANCHEZ")
{
    logDebug("adding Fee: StaffUserID is ASANCHEZ");
    addFeeWithExtraData("STTAR","E_ENC","FINAL", (1*(wfHours)),"N",capId,"Task: " + wfTask,null,null);
}
if(wfHours > 0 && wfStaffUserID == "ENGINSPECTOR")
{
    logDebug("adding Fee: StaffUserID is ENGINSPECTOR");
    addFeeWithExtraData("STIR","E_ENC","FINAL", (1*(wfHours)),"N",capId,"Task: " + wfTask,null,null);
}
if(wfHours > 0 && wfStaffUserID == "DGUTIERREZ")
{
    logDebug("adding Fee: StaffUserID is DGUTIERREZ");
    addFeeWithExtraData("STIR","E_ENC","FINAL", (1*(wfHours)),"N",capId,"Task: " + wfTask,null,null);
}
if(wfHours > 0 && wfStaffUserID == "DHSIAO")
{
    logDebug("adding Fee: StaffUserID is DHSIAO");
    addFeeWithExtraData("STPCR","E_ENC","FINAL", (1*(wfHours)),"N",capId,"Task: " + wfTask,null,null);
}
if(wfHours > 0 && wfStaffUserID == "DHOO")
{
    logDebug("adding Fee: StaffUserID is DHOO");
    addFeeWithExtraData("STTAR","E_ENC","FINAL", (1*(wfHours)),"N",capId,"Task: " + wfTask,null,null);
}
if(wfHours > 0 && wfStaffUserID == "GGARCIA")
{
    logDebug("adding Fee: StaffUserID is GGARCIA");
    addFeeWithExtraData("STIR","E_ENC","FINAL", (1*(wfHours)),"N",capId,"Task: " + wfTask,null,null);
}
if(wfHours > 0 && wfStaffUserID == "JLO")
{
    logDebug("adding Fee: StaffUserID is JLO");
    addFeeWithExtraData("SINSP","E_ENC","FINAL",((AInfo["JLO Rate"]*(wfHours))*274/100),"N",capId,"Task: " + wfTask,null,null);
}
if(wfHours > 0 && wfStaffUserID == "JODRISCOLL")
{
    logDebug("adding Fee: StaffUserID is JODRISCOLL");
    addFeeWithExtraData("STPCR","E_ENC","FINAL", (1*(wfHours)),"N",capId,"Task: " + wfTask,null,null);
}
if(wfHours > 0 && wfStaffUserID == "RMAGNO")
{
    logDebug("adding Fee: StaffUserID is RMAGNO");
    addFeeWithExtraData("STPCR","E_ENC","FINAL", (1*(wfHours)),"N",capId,"Task: " + wfTask,null,null);
}
if(wfHours > 0 && wfStaffUserID == "LSMITH")
{
    logDebug("adding Fee: StaffUserID is LSMITH");
    addFeeWithExtraData("SINSP","E_ENC","FINAL",((AInfo["LSMITH Rate"]*(wfHours))*274/100),"N",capId,"Task: " + wfTask,null,null);
}
if(wfHours > 0 && wfStaffUserID == "NTHOM")
{
    logDebug("adding Fee: StaffUserID is NTHOM");
    addFeeWithExtraData("SPENG","E_ENC","FINAL", (1*(wfHours)),"N",capId, "Task: " + wfTask,null,null);
}
if(wfHours > 0 && wfStaffUserID == "VRUIZVERA")
{
    logDebug("adding Fee: StaffUserID is VRUIZVERA");
    addFeeWithExtraData("STIR","E_ENC","FINAL", (1*(wfHours)),"N",capId,"Task: " + wfTask,null,null);
}
if(wfHours > 0 && wfStaffUserID == "NCASTELINO")
{
    logDebug("adding Fee: StaffUserID is NCASTELINO");
    addFeeWithExtraData("STPCR","E_ENC","FINAL", (1*(wfHours)),"N",capId,"Task: " + wfTask,null,null);
}
if(wfHours > 0 && wfStaffUserID == "PTOSTE")
{
    logDebug("adding Fee: StaffUserID is PTOSTE");
    addFeeWithExtraData("STPCR","E_ENC","FINAL", (1*(wfHours)),"N",capId,"Task: " + wfTask,null,null);
}
if(wfHours > 0 && wfStaffUserID == "RCHEE")
{
    logDebug("adding Fee: StaffUserID is RCHEE");
    addFeeWithExtraData("STPCR","E_ENC","FINAL", (1*(wfHours)),"N",capId,"Task: " + wfTask,null,null);
}
if(wfHours > 0 && wfStaffUserID == "MCHAUDHARY")
{
    logDebug("adding Fee: StaffUserID is MCHAUDHARY");
    addFeeWithExtraData("STPCR","E_ENC","FINAL", (1*(wfHours)),"N",capId,"Task: " + wfTask,null,null);
}
if(wfHours > 0 && wfStaffUserID == "ATOSCANO")
{
    logDebug("adding Fee: StaffUserID is ATOSCANO");
    addFeeWithExtraData("STPCR","E_ENC","FINAL", (1*(wfHours)),"N",capId,"Task: " + wfTask,null,null);
}
if(wfHours > 0 && wfStaffUserID == "MZOOBI")
{
    logDebug("adding Fee: StaffUserID is MZOOBI");
    addFeeWithExtraData("STTAR","E_ENC","FINAL", (1*(wfHours)),"N",capId,"Task: " + wfTask,null,null);
}
if(wfHours > 0 && wfStaffUserID == "RGONZALES")
{
    addFeeWithExtraData("STIR","E_ENC","FINAL", (1*(wfHours)),"N",capId,"Task: " + wfTask,null,null);
}
if(wfHours > 0 && wfStaffUserID == "SMARQUISES")
    addFeeWithExtraData("SPENG","E_ENC","FINAL", (1*(wfHours)),"N",capId,"Task: " + wfTask,null,null);
if(wfHours > 0 && wfStaffUserID == "RCRAIG")
    addFeeWithExtraData("STTAR","E_ENC","FINAL", (1*(wfHours)),"N",capId,"Task: " + wfTask,null,null);
if(wfHours > 0 && wfStaffUserID == "DRODGERS")
    addFeeWithExtraData("STSER","E_ENC","FINAL", (1*(wfHours)),"N",capId,"Task: " + wfTask,null,null);
if(wfHours > 0 && wfStaffUserID == "APENA")
    addFeeWithExtraData("STIR","E_ENC","FINAL", (1*(wfHours)),"N",capId,"Task: " + wfTask,null,null);
if(wfHours > 0 && wfStaffUserID == "EGUERRERO")
    addFeeWithExtraData("STTAR","E_ENC","FINAL", (1*(wfHours)),"N",capId,"Task: " + wfTask,null,null);
if(wfHours > 0 && wfStaffUserID == "KHAMIDI")
    addFeeWithExtraData("STIR","E_ENC","FINAL", (1*(wfHours)),"N",capId,"Task: " + wfTask,null,null);
if(wfHours > 0 && wfStaffUserID == "DCOCONNOR")
    addFeeWithExtraData("STIR","E_ENC","FINAL", (1*(wfHours)),"N",capId,"Task: " + wfTask,null,null);
if(wfHours > 0 && wfStaffUserID == "DPERRY")
    addFeeWithExtraData("STIR","E_ENC","FINAL", (1*(wfHours)),"N",capId,"Task: " + wfTask,null,null);
if(wfHours > 0 && wfStaffUserID == "MZOOBI")
    addFeeWithExtraData("STTAR","E_ENC","FINAL", (1*(wfHours)),"N",capId,"Task: " + wfTask,null,null);
if(wfHours > 0 && wfStaffUserID == "RLEYVA")
    addFeeWithExtraData("STIR","E_ENC","FINAL", (1*(wfHours)),"N",capId,"Task: " + wfTask,null,null);
if(wfTimeOT  == "Y")
    email("myoung@youngconsultingllc.com","noreply@accela.com","OVERTIME","A overtime has been triggered" + capIDString + ", " + capName + ".");
include("WTUA_EXECUTE_DIGEPLAN_SCRIPTS_ENG");