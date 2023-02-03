assignInspection(inspId, currentUserID, capId);
/*if(inspType == "2030 Final Electrical" &&
    isTaskActive("Inspection") &&
    (inspResult == "Finaled" || inspResult == "Pass") &&
    isAllConditionsMet(capId) &&
    balanceDue <= 0)
{
    var flag = true;
    var relChildren = getChildren("Building/!*!/!*!/!*", capId);
    if (!matches(relChildren, null, false)) {
        for (var r in relChildren) {
            var capDetailObjResult = aa.cap.getCapDetail(relChildren[r]);            // Detail
            if (capDetailObjResult.getSuccess())
            {
                capDetail = capDetailObjResult.getOutput();
                var vBalanceDue = capDetail.getBalance();
                if(parseFloat(vBalanceDue) > 0 || !isAllConditionsMet(relChildren[r]))
                    flag = false;
            }
        }
    }
    if(flag)
    {
        updateTask("Inspection"," Final Inspection Complete","","");
        aa.workflow.adjustTask(capId, "Inspection", "N", "Y", null, null);
        updateAppStatus("Finaled","Updated through script");

        var relChildren = getChildren("Building/!*!/!*!/!*", capId);
        if (!matches(relChildren, null, false)) {
            for (var r in relChildren) {
                updateAppStatus("Finaled","Updated through script",relChildren[r]);
                updateTask("Inspection"," Final Inspection Complete","","","",relChildren[r]);
                aa.workflow.adjustTask(relChildren[r], "Inspection", "N", "Y", null, null);
            }
        }
    }
}*/


//CASANLEAN-1499
try
{
    var params = aa.util.newHashtable();
    var applicantEmail = "";
    var conName = "";
    var vBalanceDue = 0.0;
    var capDetailObjResult = aa.cap.getCapDetail(capId);
    var hm = new Array();
    if (capDetailObjResult.getSuccess())
    {
        capDetail = capDetailObjResult.getOutput();
        vBalanceDue = parseFloat(capDetail.getBalance());
    }
    var contactResult = aa.people.getCapContactByCapID(capId);
    if (contactResult.getSuccess()) {
        var capContacts = contactResult.getOutput();
        for (var i in capContacts) {
            var VRFiles = null;
            var conName = getContactName(capContacts[i]);
            var applicantEmail = capContacts[i].getPeople().getEmail()+"";
            var inspectorName = getInspectorName(inspId);
            if(!inspectorName)
                inspectorName = "Inspector";
            var reportNames = new Array();
            var rParamss = new Array();
            reportNames.push("Inspection Report");
            var rParams = aa.util.newHashMap();
            rParams.put("RecordID", capId.getCustomID()+"");
            rParams.put("InspID", inspId);
            rParams.put("Inspector", inspectorName);
            rParamss.push(rParams);

            var reportUser = "ADMIN";
            var rFiles = [];

            if(inspType == "3000 Final Building Permit" && (appMatch("Building/Commercial/New Construction/NA")
                    ||appMatch("Building/Residential/ADU/NA") ||appMatch("Building/Residential/New Construction/NA"))
                && vBalanceDue <= 0 && inspResult == "Pass")
            {
                var startDate = new Date();
                var todayDate = (startDate.getMonth() + 1) + "/" + startDate.getDate() + "/" + startDate.getFullYear();
                editAppSpecific("COO Date", todayDate);

                reportNames.push("Certificate of Occupancy - SSRS");
                var rParams = aa.util.newHashMap();
                rParams.put("RecordID", capId.getCustomID()+"");
                rParams.put("COODate", todayDate);
                rParamss.push(rParams);
            }
            //sleep(20);
            for(var i in reportNames)
            {
                var reportName = reportNames[i];
                var rParams = rParamss[i];
                var reportInfoResult = aa.reportManager.getReportInfoModelByName(reportName);
                if(reportInfoResult.getSuccess() == false) {
                    // Notify adimistrator via Email, for example
                    aa.print("Could not found this report " + reportName);
                }

                report = reportInfoResult.getOutput();
                report.setModule("Building");
                report.setCapId(capId.getID1() + "-" + capId.getID2() + "-" + capId.getID3());
                report.setReportParameters(rParams);

                var permissionResult = aa.reportManager.hasPermission(reportName,reportUser);
                if(permissionResult.getSuccess() == false || permissionResult.getOutput().booleanValue() == false) {
                    // Notify adimistrator via Email, for example
                    aa.print("The user " + reportUser + " does not have perssion on this report " + reportName);
                }

                var reportResult = aa.reportManager.getReportResult(report);
                if(reportResult.getSuccess() == false){
                    // Notify adimistrator via Email, for example
                    aa.print("Could not get report from report manager normally, error message please refer to (): " + reportResult.getErrorType() + ":" + reportResult.getErrorMessage());
                }

                reportResult = reportResult.getOutput();
                var reportFileResult = aa.reportManager.storeReportToDisk(reportResult);
                if(reportFileResult.getSuccess() == false) {
                    // Notify adimistrator via Email, for example
                    aa.print("The appliation does not have permission to store this temporary report " + reportName + ", error message please refer to:" + reportResult.getErrorMessage());
                }

                var reportFile = reportFileResult.getOutput();
                rFiles.push(reportFile);
            }
            VRFiles = rFiles;
            addParameter(params, "$$InspectorOfRecord1$$", inspectorName);
            addParameter(params, "$$InspectorOfRecord2$$", inspectorName);
            addParameter(params, "$$InspectorPhoneNumber$$", getInspectorPhone(inspId));
            addParameter(params, "$$InspectorEmail$$", getInspectorEmail(inspId));
            addParameter(params, "$$altId$$", capId.getCustomID()+"");
            addParameter(params, "$$InspectionStatus$$", inspResult);
            addParameter(params, "$$FullNameBusName$$", conName);
            addParameter(params, "$$InspectionType$$", inspType);
            addParameter(params, "$$InspectionResultComment$$", inspComment);
            if(hm[applicantEmail+""] != 1)
            {
                sendEmail("no-reply@sanleandro.org", applicantEmail, "", "BLD_INSPECTION_RESULT_EMAIL", params, VRFiles, capId);
                hm[applicantEmail+""] = 1;
            }
        }
    }
    var capLps = getLicenseProfessional(capId);
    for (var thisCapLpNum in capLps) {
        var thisCapLp = capLps[thisCapLpNum];
        var conName = thisCapLp.getContactFirstName()+" "+ thisCapLp.getContactLastName();
        if(thisCapLp.getContactFirstName() == null || thisCapLp.getContactFirstName() == "")
            conName = thisCapLp.getBusinessName();
        var applicantEmail = thisCapLp.getEmail()+"";
        var VRFiles = null;
        //var conName = getContactName(capContacts[i]);
        //var applicantEmail = capContacts[i].getPeople().getEmail()+"";
        var inspectorName = getInspectorName(inspId);
        if(!inspectorName)
            inspectorName = "Inspector";
        var reportNames = new Array();
        var rParamss = new Array();
        reportNames.push("Inspection Report");
        var rParams = aa.util.newHashMap();
        rParams.put("RecordID", capId.getCustomID()+"");
        rParams.put("InspID", inspId);
        rParams.put("Inspector", inspectorName);

        rParamss.push(rParams);

        var reportUser = "ADMIN";
        var rFiles = [];

        if(inspType == "3000 Final Building Permit" && (appMatch("Building/Commercial/New Construction/NA")
                ||appMatch("Building/Residential/ADU/NA") ||appMatch("Building/Residential/New Construction/NA"))
            && vBalanceDue <= 0 && inspResult == "Pass")
        {
            var startDate = new Date();
            var todayDate = (startDate.getMonth() + 1) + "/" + startDate.getDate() + "/" + startDate.getFullYear();
            editAppSpecific("COO Date", todayDate);

            reportNames.push("Certificate of Occupancy - SSRS");
            var rParams = aa.util.newHashMap();
            rParams.put("RecordID", capId.getCustomID()+"");
            rParams.put("COODate", todayDate);
            rParamss.push(rParams);
        }

        for(var i in reportNames)
        {
            var reportName = reportNames[i];
            var rParams = rParamss[i];
            var reportInfoResult = aa.reportManager.getReportInfoModelByName(reportName);
            if(reportInfoResult.getSuccess() == false) {
                // Notify adimistrator via Email, for example
                aa.print("Could not found this report " + reportName);
            }

            report = reportInfoResult.getOutput();
            report.setModule("Building");
            report.setCapId(capId.getID1() + "-" + capId.getID2() + "-" + capId.getID3());
            report.setReportParameters(rParams);

            var permissionResult = aa.reportManager.hasPermission(reportName,reportUser);
            if(permissionResult.getSuccess() == false || permissionResult.getOutput().booleanValue() == false) {
                // Notify adimistrator via Email, for example
                aa.print("The user " + reportUser + " does not have perssion on this report " + reportName);
            }

            var reportResult = aa.reportManager.getReportResult(report);
            if(reportResult.getSuccess() == false){
                // Notify adimistrator via Email, for example
                aa.print("Could not get report from report manager normally, error message please refer to (): " + reportResult.getErrorType() + ":" + reportResult.getErrorMessage());
            }

            reportResult = reportResult.getOutput();
            var reportFileResult = aa.reportManager.storeReportToDisk(reportResult);
            if(reportFileResult.getSuccess() == false) {
                // Notify adimistrator via Email, for example
                aa.print("The appliation does not have permission to store this temporary report " + reportName + ", error message please refer to:" + reportResult.getErrorMessage());
            }

            var reportFile = reportFileResult.getOutput();
            rFiles.push(reportFile);
        }
        VRFiles = rFiles;
        addParameter(params, "$$InspectorOfRecord1$$", inspectorName);
        addParameter(params, "$$InspectorOfRecord2$$", inspectorName);
        addParameter(params, "$$InspectorPhoneNumber$$", getInspectorPhone(inspId));
        addParameter(params, "$$InspectorEmail$$", getInspectorEmail(inspId));
        addParameter(params, "$$altId$$", capId.getCustomID()+"");
        addParameter(params, "$$InspectionStatus$$", inspResult);
        addParameter(params, "$$FullNameBusName$$", conName);
        addParameter(params, "$$InspectionType$$", inspType);
        addParameter(params, "$$InspectionResultComment$$", inspComment);
        if(hm[applicantEmail+""] != 1)
        {
            sendEmail("no-reply@sanleandro.org", applicantEmail, "", "BLD_INSPECTION_RESULT_EMAIL", params, VRFiles, capId);
            hm[applicantEmail+""] = 1;
        }
    }
}
catch(err)
{
    logDebug(err);
}
//CASANLEAN-1499

//CASANLEAN-1554
if(inspType == "2050 Electrical Service Release" && inspResult == "Pass") {
    try
    {
        var flag = false;
        var params = aa.util.newHashtable();
        var applicantEmail = "";
        var conName = "";
        var vBalanceDue = 0.0;
        var capDetailObjResult = aa.cap.getCapDetail(capId);
        var hm = new Array();
        if (capDetailObjResult.getSuccess())
        {
            capDetail = capDetailObjResult.getOutput();
            vBalanceDue = parseFloat(capDetail.getBalance());
        }
        var contactResult = aa.people.getCapContactByCapID(capId);
        if (contactResult.getSuccess()) {
            var capContacts = contactResult.getOutput();
            for (var i in capContacts) {
                var VRFiles = null;
                var conName = getContactName(capContacts[i]);
                var applicantEmail = capContacts[i].getPeople().getEmail()+"";
                var inspectorName = getInspectorName(inspId);
                if(!inspectorName)
                    inspectorName = "Inspector";
                var reportNames = new Array();
                var rParamss = new Array();
                reportNames.push("PG&E Electric Service Release");
                var rParams = aa.util.newHashMap();
                rParams.put("RecordID", capId.getCustomID()+"");
                rParams.put("InspID", inspId);
                rParams.put("Inspector", inspectorName);
                var startDate = new Date();
                var todayDate = (startDate.getMonth() + 1) + "/" + startDate.getDate() + "/" + startDate.getFullYear();
                rParams.put("InspectionDate", todayDate);
                rParamss.push(rParams);

                var reportUser = "ADMIN";
                var rFiles = [];

                for(var i in reportNames)
                {
                    var reportName = reportNames[i];
                    var rParams = rParamss[i];
                    var reportInfoResult = aa.reportManager.getReportInfoModelByName(reportName);
                    if(reportInfoResult.getSuccess() == false) {
                        // Notify adimistrator via Email, for example
                        aa.print("Could not found this report " + reportName);
                    }

                    report = reportInfoResult.getOutput();
                    report.setModule("Building");
                    report.setCapId(capId.getID1() + "-" + capId.getID2() + "-" + capId.getID3());
                    report.setReportParameters(rParams);

                    var permissionResult = aa.reportManager.hasPermission(reportName,reportUser);
                    if(permissionResult.getSuccess() == false || permissionResult.getOutput().booleanValue() == false) {
                        // Notify adimistrator via Email, for example
                        aa.print("The user " + reportUser + " does not have perssion on this report " + reportName);
                    }

                    var reportResult = aa.reportManager.getReportResult(report);
                    if(reportResult.getSuccess() == false){
                        // Notify adimistrator via Email, for example
                        aa.print("Could not get report from report manager normally, error message please refer to (): " + reportResult.getErrorType() + ":" + reportResult.getErrorMessage());
                    }

                    reportResult = reportResult.getOutput();
                    var reportFileResult = aa.reportManager.storeReportToDisk(reportResult);
                    if(reportFileResult.getSuccess() == false) {
                        // Notify adimistrator via Email, for example
                        aa.print("The appliation does not have permission to store this temporary report " + reportName + ", error message please refer to:" + reportResult.getErrorMessage());
                    }

                    var reportFile = reportFileResult.getOutput();
                    rFiles.push(reportFile);
                }
                VRFiles = rFiles;

                var vAddress = "";
                var vCity = "";
                var capAddressResult1 = aa.address.getAddressByCapId(capId);
                if (capAddressResult1.getSuccess())
                {
                    var Address = capAddressResult1.getOutput();
                    for (yy in Address)
                    {
                        vAddress = Address[yy].getHouseNumberStart();
                        if (Address[yy].getStreetDirection())
                            vAddress += " " + Address[yy].getStreetDirection();
                        vAddress += " " + Address[yy].getStreetName();
                        if (Address[yy].getStreetSuffix())
                            vAddress += " " + Address[yy].getStreetSuffix();
                        if (Address[yy].getUnitStart())
                            vAddress += " " + Address[yy].getUnitStart();
                        if(Address[yy].getCity())
                            vCity = Address[yy].getCity()+"";
                    }
                }
                addParameter(params, "$$altID$$", capId.getCustomID()+"");
                addParameter(params, "$$address$$", vAddress);
                addParameter(params, "$$city$$", vCity);
                addParameter(params, "$$ChiefBuildingOfficialPhone$$", lookup("REPORT_VARIABLES","ChiefBuildingOfficialPhone"));
                //addParameter(params, "$$ChiefBuildingOfficialEmail$$", lookup("REPORT_VARIABLES","ChiefBuildingOfficialEmail"));
                addParameter(params, "$$ChiefBuildingOfficialName$$", lookup("REPORT_VARIABLES","ChiefBuildingOfficialName"));
                addParameter(params, "$$ChiefBuildingOfficialTitle$$", lookup("REPORT_VARIABLES","ChiefBuildingOfficialTitle"));
                if(hm[applicantEmail+""] != 1)
                {
                    sendEmail("no-reply@sanleandro.org", applicantEmail, "", "BLD_IRSA_SERVICE_RELEASE", params, VRFiles, capId);
                    hm[applicantEmail+""] = 1;
                }
                if(!flag)
                {
                    sendEmail("no-reply@sanleandro.org", lookup("REPORT_VARIABLES","PGE_Email"), "", "BLD_IRSA_SERVICE_RELEASE", params, VRFiles, capId);
                }
            }
        }
        var capLps = getLicenseProfessional(capId);
        for (var thisCapLpNum in capLps) {
            var thisCapLp = capLps[thisCapLpNum];
            var conName = thisCapLp.getContactFirstName()+" "+ thisCapLp.getContactLastName();
            if(thisCapLp.getContactFirstName() == null || thisCapLp.getContactFirstName() == "")
                conName = thisCapLp.getBusinessName();
            var applicantEmail = thisCapLp.getEmail()+"";
            var VRFiles = null;
            //var conName = getContactName(capContacts[i]);
            //var applicantEmail = capContacts[i].getPeople().getEmail()+"";
            var inspectorName = getInspectorName(inspId);
            if(!inspectorName)
                inspectorName = "Inspector";
            var reportNames = new Array();
            var rParamss = new Array();

            reportNames.push("PG&E Electric Service Release");
            var rParams = aa.util.newHashMap();
            rParams.put("RecordID", capId.getCustomID()+"");
            rParams.put("InspID", inspId);
            rParams.put("Inspector", inspectorName);
            var startDate = new Date();
            var todayDate = (startDate.getMonth() + 1) + "/" + startDate.getDate() + "/" + startDate.getFullYear();
            rParams.put("InspectionDate", todayDate);
            rParamss.push(rParams);

            var reportUser = "ADMIN";
            var rFiles = [];

            for(var i in reportNames)
            {
                var reportName = reportNames[i];
                var rParams = rParamss[i];
                var reportInfoResult = aa.reportManager.getReportInfoModelByName(reportName);
                if(reportInfoResult.getSuccess() == false) {
                    // Notify adimistrator via Email, for example
                    aa.print("Could not found this report " + reportName);
                }

                report = reportInfoResult.getOutput();
                report.setModule("Building");
                report.setCapId(capId.getID1() + "-" + capId.getID2() + "-" + capId.getID3());
                report.setReportParameters(rParams);

                var permissionResult = aa.reportManager.hasPermission(reportName,reportUser);
                if(permissionResult.getSuccess() == false || permissionResult.getOutput().booleanValue() == false) {
                    // Notify adimistrator via Email, for example
                    aa.print("The user " + reportUser + " does not have perssion on this report " + reportName);
                }

                var reportResult = aa.reportManager.getReportResult(report);
                if(reportResult.getSuccess() == false){
                    // Notify adimistrator via Email, for example
                    aa.print("Could not get report from report manager normally, error message please refer to (): " + reportResult.getErrorType() + ":" + reportResult.getErrorMessage());
                }

                reportResult = reportResult.getOutput();
                var reportFileResult = aa.reportManager.storeReportToDisk(reportResult);
                if(reportFileResult.getSuccess() == false) {
                    // Notify adimistrator via Email, for example
                    aa.print("The appliation does not have permission to store this temporary report " + reportName + ", error message please refer to:" + reportResult.getErrorMessage());
                }

                var reportFile = reportFileResult.getOutput();
                rFiles.push(reportFile);
            }
            VRFiles = rFiles;
            var vAddress = "";
            var vCity = "";
            var capAddressResult1 = aa.address.getAddressByCapId(capId);
            if (capAddressResult1.getSuccess())
            {
                var Address = capAddressResult1.getOutput();
                for (yy in Address)
                {
                    vAddress = Address[yy].getHouseNumberStart();
                    if (Address[yy].getStreetDirection())
                        vAddress += " " + Address[yy].getStreetDirection();
                    vAddress += " " + Address[yy].getStreetName();
                    if (Address[yy].getStreetSuffix())
                        vAddress += " " + Address[yy].getStreetSuffix();
                    if (Address[yy].getUnitStart())
                        vAddress += " " + Address[yy].getUnitStart();
                    if(Address[yy].getCity())
                        vCity = Address[yy].getCity()+"";
                }
            }
            addParameter(params, "$$altID$$", capId.getCustomID()+"");
            addParameter(params, "$$address$$", vAddress);
            addParameter(params, "$$city$$", vCity);
            addParameter(params, "$$ChiefBuildingOfficialPhone$$", lookup("REPORT_VARIABLES","ChiefBuildingOfficialPhone"));
            //addParameter(params, "$$ChiefBuildingOfficialEmail$$", lookup("REPORT_VARIABLES","ChiefBuildingOfficialEmail"));
            addParameter(params, "$$ChiefBuildingOfficialName$$", lookup("REPORT_VARIABLES","ChiefBuildingOfficialName"));
            addParameter(params, "$$ChiefBuildingOfficialTitle$$", lookup("REPORT_VARIABLES","ChiefBuildingOfficialTitle"));
            if(hm[applicantEmail+""] != 1)
            {
                sendEmail("no-reply@sanleandro.org", applicantEmail, "", "BLD_IRSA_SERVICE_RELEASE", params, VRFiles, capId);
                hm[applicantEmail+""] = 1;
            }
        }
    }
    catch(err)
    {
        logDebug(err);
    }
}
if(inspType == "2060 Gas Service Release" && inspResult == "Pass") {
    try
    {
        var flag = false;
        var params = aa.util.newHashtable();
        var applicantEmail = "";
        var conName = "";
        var vBalanceDue = 0.0;
        var capDetailObjResult = aa.cap.getCapDetail(capId);
        var hm = new Array();
        if (capDetailObjResult.getSuccess())
        {
            capDetail = capDetailObjResult.getOutput();
            vBalanceDue = parseFloat(capDetail.getBalance());
        }
        var contactResult = aa.people.getCapContactByCapID(capId);
        if (contactResult.getSuccess()) {
            var capContacts = contactResult.getOutput();
            for (var i in capContacts) {
                var VRFiles = null;
                var conName = getContactName(capContacts[i]);
                var applicantEmail = capContacts[i].getPeople().getEmail()+"";
                var inspectorName = getInspectorName(inspId);
                if(!inspectorName)
                    inspectorName = "Inspector";
                var reportNames = new Array();
                var rParamss = new Array();
                reportNames.push("PG&E Gas Service Release");
                var rParams = aa.util.newHashMap();
                rParams.put("RecordID", capId.getCustomID()+"");
                rParams.put("InspID", inspId);
                rParams.put("Inspector", inspectorName);
                var startDate = new Date();
                var todayDate = (startDate.getMonth() + 1) + "/" + startDate.getDate() + "/" + startDate.getFullYear();
                rParams.put("InspectionDate", todayDate);
                rParamss.push(rParams);

                var reportUser = "ADMIN";
                var rFiles = [];

                for(var i in reportNames)
                {
                    var reportName = reportNames[i];
                    var rParams = rParamss[i];
                    var reportInfoResult = aa.reportManager.getReportInfoModelByName(reportName);
                    if(reportInfoResult.getSuccess() == false) {
                        // Notify adimistrator via Email, for example
                        aa.print("Could not found this report " + reportName);
                    }

                    report = reportInfoResult.getOutput();
                    report.setModule("Building");
                    report.setCapId(capId.getID1() + "-" + capId.getID2() + "-" + capId.getID3());
                    report.setReportParameters(rParams);

                    var permissionResult = aa.reportManager.hasPermission(reportName,reportUser);
                    if(permissionResult.getSuccess() == false || permissionResult.getOutput().booleanValue() == false) {
                        // Notify adimistrator via Email, for example
                        aa.print("The user " + reportUser + " does not have perssion on this report " + reportName);
                    }

                    var reportResult = aa.reportManager.getReportResult(report);
                    if(reportResult.getSuccess() == false){
                        // Notify adimistrator via Email, for example
                        aa.print("Could not get report from report manager normally, error message please refer to (): " + reportResult.getErrorType() + ":" + reportResult.getErrorMessage());
                    }

                    reportResult = reportResult.getOutput();
                    var reportFileResult = aa.reportManager.storeReportToDisk(reportResult);
                    if(reportFileResult.getSuccess() == false) {
                        // Notify adimistrator via Email, for example
                        aa.print("The appliation does not have permission to store this temporary report " + reportName + ", error message please refer to:" + reportResult.getErrorMessage());
                    }

                    var reportFile = reportFileResult.getOutput();
                    rFiles.push(reportFile);
                }
                VRFiles = rFiles;

                var vAddress = "";
                var vCity = "";
                var capAddressResult1 = aa.address.getAddressByCapId(capId);
                if (capAddressResult1.getSuccess())
                {
                    var Address = capAddressResult1.getOutput();
                    for (yy in Address)
                    {
                        vAddress = Address[yy].getHouseNumberStart();
                        if (Address[yy].getStreetDirection())
                            vAddress += " " + Address[yy].getStreetDirection();
                        vAddress += " " + Address[yy].getStreetName();
                        if (Address[yy].getStreetSuffix())
                            vAddress += " " + Address[yy].getStreetSuffix();
                        if (Address[yy].getUnitStart())
                            vAddress += " " + Address[yy].getUnitStart();
                        if(Address[yy].getCity())
                            vCity = Address[yy].getCity()+"";
                    }
                }
                addParameter(params, "$$altID$$", capId.getCustomID()+"");
                addParameter(params, "$$address$$", vAddress);
                addParameter(params, "$$city$$", vCity);
                addParameter(params, "$$ChiefBuildingOfficialPhone$$", lookup("REPORT_VARIABLES","ChiefBuildingOfficialPhone"));
                //addParameter(params, "$$ChiefBuildingOfficialEmail$$", lookup("REPORT_VARIABLES","ChiefBuildingOfficialEmail"));
                addParameter(params, "$$ChiefBuildingOfficialName$$", lookup("REPORT_VARIABLES","ChiefBuildingOfficialName"));
                addParameter(params, "$$ChiefBuildingOfficialTitle$$", lookup("REPORT_VARIABLES","ChiefBuildingOfficialTitle"));
                if(hm[applicantEmail+""] != 1)
                {
                    sendEmail("no-reply@sanleandro.org", applicantEmail, "", "BLD_IRSA_SERVICE_RELEASE", params, VRFiles, capId);
                    hm[applicantEmail+""] = 1;
                }
                if(!flag)
                {
                    sendEmail("no-reply@sanleandro.org", lookup("REPORT_VARIABLES","PGE_Email"), "", "BLD_IRSA_SERVICE_RELEASE", params, VRFiles, capId);
                }
            }
        }
        var capLps = getLicenseProfessional(capId);
        for (var thisCapLpNum in capLps) {
            var thisCapLp = capLps[thisCapLpNum];
            var conName = thisCapLp.getContactFirstName()+" "+ thisCapLp.getContactLastName();
            if(thisCapLp.getContactFirstName() == null || thisCapLp.getContactFirstName() == "")
                conName = thisCapLp.getBusinessName();
            var applicantEmail = thisCapLp.getEmail()+"";
            var VRFiles = null;
            //var conName = getContactName(capContacts[i]);
            //var applicantEmail = capContacts[i].getPeople().getEmail()+"";
            var inspectorName = getInspectorName(inspId);
            if(!inspectorName)
                inspectorName = "Inspector";
            var reportNames = new Array();
            var rParamss = new Array();

            reportNames.push("PG&E Gas Service Release");
            var rParams = aa.util.newHashMap();
            rParams.put("RecordID", capId.getCustomID()+"");
            rParams.put("InspID", inspId);
            rParams.put("Inspector", inspectorName);
            var startDate = new Date();
            var todayDate = (startDate.getMonth() + 1) + "/" + startDate.getDate() + "/" + startDate.getFullYear();
            rParams.put("InspectionDate", todayDate);
            rParamss.push(rParams);

            var reportUser = "ADMIN";
            var rFiles = [];

            for(var i in reportNames)
            {
                var reportName = reportNames[i];
                var rParams = rParamss[i];
                var reportInfoResult = aa.reportManager.getReportInfoModelByName(reportName);
                if(reportInfoResult.getSuccess() == false) {
                    // Notify adimistrator via Email, for example
                    aa.print("Could not found this report " + reportName);
                }

                report = reportInfoResult.getOutput();
                report.setModule("Building");
                report.setCapId(capId.getID1() + "-" + capId.getID2() + "-" + capId.getID3());
                report.setReportParameters(rParams);

                var permissionResult = aa.reportManager.hasPermission(reportName,reportUser);
                if(permissionResult.getSuccess() == false || permissionResult.getOutput().booleanValue() == false) {
                    // Notify adimistrator via Email, for example
                    aa.print("The user " + reportUser + " does not have perssion on this report " + reportName);
                }

                var reportResult = aa.reportManager.getReportResult(report);
                if(reportResult.getSuccess() == false){
                    // Notify adimistrator via Email, for example
                    aa.print("Could not get report from report manager normally, error message please refer to (): " + reportResult.getErrorType() + ":" + reportResult.getErrorMessage());
                }

                reportResult = reportResult.getOutput();
                var reportFileResult = aa.reportManager.storeReportToDisk(reportResult);
                if(reportFileResult.getSuccess() == false) {
                    // Notify adimistrator via Email, for example
                    aa.print("The appliation does not have permission to store this temporary report " + reportName + ", error message please refer to:" + reportResult.getErrorMessage());
                }

                var reportFile = reportFileResult.getOutput();
                rFiles.push(reportFile);
            }
            VRFiles = rFiles;
            var vAddress = "";
            var vCity = "";
            var capAddressResult1 = aa.address.getAddressByCapId(capId);
            if (capAddressResult1.getSuccess())
            {
                var Address = capAddressResult1.getOutput();
                for (yy in Address)
                {
                    vAddress = Address[yy].getHouseNumberStart();
                    if (Address[yy].getStreetDirection())
                        vAddress += " " + Address[yy].getStreetDirection();
                    vAddress += " " + Address[yy].getStreetName();
                    if (Address[yy].getStreetSuffix())
                        vAddress += " " + Address[yy].getStreetSuffix();
                    if (Address[yy].getUnitStart())
                        vAddress += " " + Address[yy].getUnitStart();
                    if(Address[yy].getCity())
                        vCity = Address[yy].getCity()+"";
                }
            }
            addParameter(params, "$$altID$$", capId.getCustomID()+"");
            addParameter(params, "$$address$$", vAddress);
            addParameter(params, "$$city$$", vCity);
            addParameter(params, "$$ChiefBuildingOfficialPhone$$", lookup("REPORT_VARIABLES","ChiefBuildingOfficialPhone"));
            //addParameter(params, "$$ChiefBuildingOfficialEmail$$", lookup("REPORT_VARIABLES","ChiefBuildingOfficialEmail"));
            addParameter(params, "$$ChiefBuildingOfficialName$$", lookup("REPORT_VARIABLES","ChiefBuildingOfficialName"));
            addParameter(params, "$$ChiefBuildingOfficialTitle$$", lookup("REPORT_VARIABLES","ChiefBuildingOfficialTitle"));
            if(hm[applicantEmail+""] != 1)
            {
                sendEmail("no-reply@sanleandro.org", applicantEmail, "", "BLD_IRSA_SERVICE_RELEASE", params, VRFiles, capId);
                hm[applicantEmail+""] = 1;
            }
        }
    }
    catch(err)
    {
        logDebug(err);
    }
}
//CASANLEAN-1554

//CASANLEAN-1537
if((appMatch("Building/Combo/NA/NA") && (inspType =="3000 Final - Building Permit"))||
    (appMatch("Building/Commercial/Accessory/NA") && (inspType =="3000 Final Building Permit"))||
    (appMatch("Building/Commercial/Addition/NA") && (inspType =="3000 Final Building Permit"))||
    (appMatch("Building/Commercial/Alteration/NA") && (inspType =="3000 Final Building Permit"))||
    (appMatch("Building/Commercial/Cell/NA") && (inspType =="2030 Final Electrical"))||
    (appMatch("Building/Commercial/Demolition/NA") && (inspType =="3000 Final Building Permit"))||
    (appMatch("Building/Commercial/Electric/NA") && (inspType =="2030 Final Electrical"))||
    (appMatch("Building/Commercial/Mechanic/NA") && (inspType =="2020 Final Mechanical"))||
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
    (appMatch("Building/Residential/Solar/NA") && (inspType =="2030 Final Electrical"))
    && inspResult == "Pass")
{
    if(vBalanceDue <= 0)
    {
        updateTask("Inspection","Final Inspection Complete","","");
        aa.workflow.adjustTask(capId, "Inspection", "N", "Y", null, null);
        updateAppStatus("Finaled","Updated through script");
    }
    else
    {
        updateTask("Inspection","Final Inspection Complete","","");
        aa.workflow.adjustTask(capId, "Inspection", "N", "Y", null, null);
        updateAppStatus("Final Passed - Balance Due","Updated through script");
        addStdCondition("General", "Balance Due", capId);
    }
}
//CASANLEAN-1537

//CASANLEAN-1496
if( inspResult == "Pass" || inspResult == "Fail")
{
    var date = new Date();
    date.setFullYear(date.getFullYear() + 1);
    var newDate = date.getMonth()+1+"/"+date.getDate()+"/"+date.getFullYear();
    editAppSpecific("Permit Expiration Date", newDate);
}
//CASANLEAN-1496
showDebug = false;
function getInspectorName(pInspId) {
    var inspResultObj = aa.inspection.getInspection(capId, pInspId);
    if (inspResultObj.getSuccess()) {
        iObj = inspResultObj.getOutput();
        inspUserObj = aa.person.getUser(currentUserID).getOutput();
        return inspUserObj.getFirstName()  +" " + inspUserObj.getLastName();
    }
    return false;
}
function getInspectorEmail(pInspId) {
    var inspResultObj = aa.inspection.getInspection(capId, pInspId);
    if (inspResultObj.getSuccess()) {
        iObj = inspResultObj.getOutput();
        inspUserObj = aa.person.getUser(currentUserID).getOutput();
        return inspUserObj.getEmail();
    }
    return false;
}
function getInspectorPhone(pInspId) {
    var inspResultObj = aa.inspection.getInspection(capId, pInspId);
    if (inspResultObj.getSuccess()) {
        iObj = inspResultObj.getOutput();
        inspUserObj = aa.person.getUser(currentUserID).getOutput();
        return inspUserObj.phoneNumber;
    }
    return false;
}
function isAllConditionsMet(vCapId)
{
    var condResult = aa.capCondition.getCapConditions(vCapId);
    if (condResult.getSuccess()) {
        var capConds = condResult.getOutput();
        for (var cc in capConds) {
            var thisCondX = capConds[cc];
            var cNbr = thisCondX.getConditionNumber();
            var thisCond = aa.capCondition.getCapCondition(vCapId,cNbr).getOutput();
            var cStatus = thisCond.getConditionStatus();
            //var isCOA = thisCond.getConditionOfApproval();
            if(matches(cStatus, "Not Met", "Applied"))
            {
                return false;
            }
        }
    }
    return true;
}
function runEmailThroughSLEmailFilter(vEmail)
{
    var filter = lookup("SL_EMAIL_CONTROL", "FILTER");
    if(filter == "ON")
    {
        var domains = String(lookup("SL_EMAIL_CONTROL", "DOMAIN_EXCEPTIONS"));
        var emails = String(lookup("SL_EMAIL_CONTROL", "EMAIL_EXCEPTIONS"));
        var vOriginalDomain = vEmail.substring(vEmail.indexOf("@") + 1, vEmail.length).toLowerCase();

        if(domains.toLowerCase().indexOf(String(vOriginalDomain).toLowerCase()) != -1)
            return vEmail;
        if(emails.toLowerCase().indexOf(String(vOriginalDomain).toLowerCase()) != -1)
            return vEmail;


        vEmail = vEmail.replace(vOriginalDomain, "DoNotSend.com");
    }
    return vEmail;
}
function sendEmail(fromEmail, toEmail, CC, template, eParams, files) { // optional: itemCap
    var itemCap = capId;
    if (arguments.length == 7)
        itemCap = arguments[6]; // use cap ID specified in args

    //var sent = aa.document.sendEmailByTemplateName(fromEmail, toEmail, CC, template, eParams, files);
    toEmail = runEmailThroughSLEmailFilter(toEmail);
    var itempAltIDScriptModel = aa.cap.createCapIDScriptModel(itemCap.getID1(), itemCap.getID2(), itemCap.getID3());
    var sent = aa.document.sendEmailAndSaveAsDocument(fromEmail, toEmail, CC, template, eParams, itempAltIDScriptModel, files);
    if (!sent.getSuccess()) {
        logDebug("**WARN sending email failed, error:" + sent.getErrorMessage());
    }
}
function getContactName(vConObj) {
    if (vConObj.people.getContactTypeFlag() == "organization") {
        if (vConObj.people.getBusinessName() != null && vConObj.people.getBusinessName() != "")
            return vConObj.people.getBusinessName();

        return vConObj.people.getBusinessName2();
    }
    else {
        if (vConObj.people.getFullName() != null && vConObj.people.getFullName() != "") {
            return vConObj.people.getFullName();
        }
        if (vConObj.people.getFirstName() != null && vConObj.people.getLastName() != null) {
            return vConObj.people.getFirstName() + " " + vConObj.people.getLastName();
        }
        if (vConObj.people.getBusinessName() != null && vConObj.people.getBusinessName() != "")
            return vConObj.people.getBusinessName();

        return vConObj.people.getBusinessName2();
    }
}
function sleep(seconds)
{
    var e = new Date().getTime() + (seconds * 1000);
    while (new Date().getTime() <= e) {}
}