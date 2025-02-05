// ES_ENG_WTUA
if(appMatch("Engineering/Grading/*/*")&& wfTask=="Permit Decision"&& wfStatus =="Issued")
    editAppSpecific("Issued Date", wfDateMMDDYYYY);
if(appMatch("*/Encroachment/*/*") && matches(wfStatus,"Issue"))
    editAppSpecific("Permit Expiration Date",dateAdd(null,91));
if(appMatch("*/Grading/*/*") && matches(wfStatus,"Issued"))
    editAppSpecific("Permit Expiration Date",dateAdd(null,181));
//if(wfStatus == "Route" && AInfo["Traffic Control"] == "Yes" && !isTaskComplete == "Traffic Control")
//   email("rchen@sanleandro.org","noreply@accela.com","Traffic Control Review Requested","A Traffic Control review is requested for " + capIDString + ", " + capName + ".");email("dhsiao@sanleandro.org","noreply@accela.com","Traffic Control Review Requested","A Traffic Control review is requested for " + capIDString + ", " + capName + ".");

if (wfTask == "Plans Coordination" && wfStatus == "Recalculate to Major") { 
	include("ENG_RECALCULATE_TO_MAJOR");
}
if (wfTask == "Plans Coordination" && wfStatus == "Calculate Restoration Deposit") { 
	include("ENG_CALCULATE_RESTORATION_DEPOSIT");
}

// Automatically close Task 'Public Works Review'
if(appMatch("Engineering/Utility/Above Ground/NA") && matches(wfStatus,"Routed for Review") && 
	(AInfo["Tree Removal"] == "No" && AInfo["Tree Trimming"] == "No")) {
		closeTask("Public Works Review","Not Required","","Closed by script");
	}
vFeeCode="STPCR";  // Default fee code to STPCR
if(wfStaffUserID == "JDOLEZAL" || wfStaffUserID == "ASANCHEZ" || wfStaffUserID == "DHOO" || wfStaffUserID == "MZOOBI") {
	vFeeCode="STTAR";
}
if(wfStaffUserID == "SVANIER" || wfStaffUserID == "EAGUAYO" || wfStaffUserID == "RCRAIG" || wfStaffUserID == "EGUERRERO") {
	vFeeCode="STTAR";
}  
if(wfStaffUserID == "ENGINSPECTOR" || wfStaffUserID == "GGARCIA" || wfStaffUserID == "DGUTIERREZ" || wfStaffUserID == "VRUIZVERA" || wfStaffUserID == "JGUERRERO") {
	vFeeCode="STIR";
}
if(wfStaffUserID == "RGONZALES" || wfStaffUserID == "APENA" || wfStaffUserID == "DCOCONNOR" || wfStaffUserID == "VRUIZVERA") {
	vFeeCode="STIR";
}
if(wfStaffUserID == "DPERRY" || wfStaffUserID == "RLEYVA" || wfStaffUserID == "MCATIC") {
	vFeeCode="STIR";
}
if(wfStaffUserID == "JLO" || wfStaffUserID == "LSMITH") {
	vFeeCode="SINSP";
}
if(wfStaffUserID == "NTHOM" || wfStaffUserID == "SMARQUISES") {
	vFeeCode="SPENG";
}
if(wfStaffUserID == "DRODGERS" || wfStaffUserID == "LSMITH") {
	vFeeCode="STSER";
}

if(wfHours > 0) {
	if (wfTimeOT == "Y") {
		vTotHours=0;
		if (wfHours <= 4) {
			vTotHours = (vTotHours+(wfHours*.5));
		} else {
			vTotHours = 6; //this is the OT for the first 4 hours (4 *1.5 = 6)
			vRemain = (wfHours - 4);
			vRemain = (vRemain * 2);
			vTotHours = (vTotHours+vRemain);
		}
		vNote="Task: " + wfTask + " and Overtime for "+wfHours+" hours"; 
		logDebug("Task Fee: " + wfTask + " user: " + wfStaffUserID + " Fee Code: " + vFeeCode + " Hours: "+wfHours+" OT: "+wfTimeOT);
		addFeeWithExtraData(vFeeCode,"E_ENC","FINAL", vTotHours,"N",capId,vNote,null,null);
	} else {
		addFeeWithExtraData(vFeeCode,"E_ENC","FINAL", (1*(wfHours)),"N",capId,"Task: " + wfTask,null,null);
	}
}

//if()
    //email("myoung@youngconsultingllc.com","noreply@accela.com","OVERTIME","A overtime has been triggered" + capIDString + ", " + capName + ".");
//include("WTUA_EXECUTE_DIGEPLAN_SCRIPTS_ENG");

if (wfTask == "Final Processing" && wfStatus == "PAC Monthly (Invoice)") {
	var wfHist = aa.workflow.getWorkflowHistory(capId, null);
	if (wfHist.getSuccess()) {
		wfHist = wfHist.getOutput();
		var vTotHours=0;
		for ( var h in wfHist) {
			debugObject(wfHist[h]);
			//wfHist[h].getTaskDescription() == "" //if needed to check wfTask with wfStatus in history
			vHours = Number(wfHist[i].getHoursSpent());
			vTotHours = (vTotHours+vHours);
			vStatus = wfHist[h].getDisposition();
			vTask = wfHist[h].getTaskDescription();
			vBill = wfHist[h].getBillable();
			vOT = wfHist[h].getOverTime();
			if (vOT == "Y") {
				if (vHours <= 4) {
					vTotHours = (vTotHours+(vHours*.5));
				} else {
					vTotHours = 6; //this is the OT for the first 4 hours (4 +2)
					vRemain = (vHours - 4);
					vTotHours = (vTotHours+vRemain);
				}
			}
			vAssigned = "Not Found";
			//if (matches(wfObj[i].getTaskDescription(), "Review Distribution")) {
			if (!matches(wfHist[h].getAssignedStaff(), null, "")) {
				var userSplit = String(wfHist[h].getAssignedStaff()).split("/")[6];
				var assignUser = aa.people.getUsersByUserIdAndName("", userSplit.split(" ")[0], "", userSplit.split(" ")[1]);
				if (assignUser.getSuccess()) {
					var vAssigned = assignUser.getOutput();			
				}
			}
			logDebug("Task: " + vTask + " Stat: " + vStatus + " Assigned: " + vAssigned + " Hours: " + vHours + " Total: " + vTotHours +" Bill: " + vBill+" OT: " + vOT);
		}//for all hist items
	}
}
function debugObject(object) {
	var output = '';
	for (property in object) {
		output += "<font color=red>" + property + "</font>" + ': ' + "<bold>" + object[property] + "</bold>" + '; ' + "<BR>";
	}
	logDebug(output);
}