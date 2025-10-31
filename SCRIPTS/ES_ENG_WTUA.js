// ES_ENG_WTUA
//if(appMatch("Engineering/*/Grading/*")&& wfTask=="Permit Decision"&& wfStatus =="Issued")
//    editAppSpecific("Issuance Date", wfDateMMDDYYYY);

if(appMatch("*/*/Grading/*") && matches(wfStatus,"Issued")) {
	editAppSpecific("Permit Expiration Date",dateAdd(null,181));
	editAppSpecific("Issuance Date", wfDateMMDDYYYY);
}
if((appMatch("*/Encroachment/*/*") || (appMatch("*/Utility/*/*"))) && matches(wfStatus,"Hold for Signature")) {
	editAppSpecific("Issuance Date", wfDateMMDDYYYY);
	if (appMatch("*/*/Annual/*")) {
		var vExpDate = new Date();
		var newExpDate = new Date(vExpDate);
		newExpDate.setDate(newExpDate.getDate());
		var expDateString = "12/31/" + newExpDate.getFullYear();
		editAppSpecific("Permit Expiration Date", expDateString);
	} else {
		editAppSpecific("Permit Expiration Date",dateAdd(null,91));
	}
}
if((appMatch("*/Encroachment/*/*") || (appMatch("*/Utility/*/*"))) && matches(wfStatus,"Issue")) {
	if (appMatch("*/*/Annual/*")) {
		var c = new Date();
		if (AInfo["This Year"] == "No") {
			c.setFullYear(c.getFullYear() + 1);
			logDebug("Yr: "+AInfo["This Year"]+" Dt: "+c);
		} else {
			c.setFullYear(c.getFullYear() + 0);
			logDebug("Yr: "+AInfo["This Year"]+" Dt: "+c);
		}
		var newDate = "12/31/" +c.getFullYear();
		editAppSpecific("Permit Expiration Date", newDate);
	} else {
		var issDate = getAppSpecific("Issuance Date");
		if (issDate == null) {
			editAppSpecific("Issuance Date", wfDateMMDDYYYY);
		}
		editAppSpecific("Permit Expiration Date",dateAdd(null,91));
	}
}
//if(wfStatus == "Route" && AInfo["Traffic Control"] == "Yes" && !isTaskComplete == "Traffic Control")
//   email("rchen@sanleandro.org","noreply@accela.com","Traffic Control Review Requested","A Traffic Control review is requested for " + capIDString + ", " + capName + ".");email("dhsiao@sanleandro.org","noreply@accela.com","Traffic Control Review Requested","A Traffic Control review is requested for " + capIDString + ", " + capName + ".");

if (wfTask == "Plans Distribution" && wfStatus == "Calculate Restoration Deposit") {
	include("ENG_CALCULATE_RESTORATION_DEPOSIT");
}

// Automatically close Task 'Public Works Review'
if(appMatch("Engineering/Utility/Above Ground/NA") && matches(wfStatus,"Routed for Review") &&
	(AInfo["Tree Removal"] == "No" && AInfo["Tree Trimming"] == "No")) {
		closeTask("Public Works Review","Not Required","","Closed by script");
}

//08 20 24 - Moved Fees to it's own script
include("ENG_TASK_HOURS_FEES");

//if()
    //email("myoung@youngconsultingllc.com","noreply@accela.com","OVERTIME","A overtime has been triggered" + capIDString + ", " + capName + ".");
//include("WTUA_EXECUTE_DIGEPLAN_SCRIPTS_ENG");
