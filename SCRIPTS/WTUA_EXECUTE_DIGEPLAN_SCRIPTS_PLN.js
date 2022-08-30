//WTUA_EXECUTE_DIGEPLAN_SCRIPTS_PLN
logDebug("Inside WTUA_EXECUTE_DIGEPLAN_SCRIPTS_PLN");

/*-----DEFINE VARIABLES FOR DIGEPLAN SCRIPTS-----*/
//Document Specific Variables for PMT
var docGroupArrayModule = ["PMT","PMT ACA","PLN_ONLINE","PLN"];
var docTypeArrayModule = ["Construction Plans","Plans","Site Plans","Site Plan","Document","Supporting Documents","Other"];

//Workflow Specific variables for PLN
if(matches(wfProcess,"P_PROJ")) {
    var reviewTasksArray = ["ENGINEERING - TRANSPORTATION","WATER POLLUTION CONTROL PLANT","ENGINEERING - LAND USE","POLICE","PUBLIC WORKS","BUILDING","ECONOMIC DEVELOPMENT","FIRE","PLANNING","ENVIRONMENTAL SERVICES","OTHER","LIBRARY - HISTORIC COMMISSION"];
    var taskStatusArray = ["REVIEW COMPLETE","COMMENTS","NO COMMENTS"];
    var routingTaskArray = ["Completeness Review"];
    var routingStatusArray = ["Complete","Full Application"];
    var resubmittalRoutedStatus = "Route";
    var resubmittalRoutedStatusArray = ["Complete","Full Application"];
    var reviewTaskResubmittalReceivedStatus = "Revisions Received";
    var reviewTaskResubmitStatusArray = ["Comments"];
    var reviewTaskApprovedStatusArray = ["No Comments","Review Complete"];
    var reviewTaskStatusPendingArray = [null,"",undefined,"Notes","Revisions Received"];
    var consolidationTask = "Staff Action";
    var consolidationResubmitStatusArray = ["Incomplete"];
    var consolidationApprovedStatus = "Approved";
    var consolidationApprovedStatusArray = ["Approved"];
    var readyToIssueTask = "Staff Action";
    var readyToIssueTaskStatusArray = ["Approved"];
    var issueTask = "Staff Action";
    var issueStatusArray = ["Approved"];
    var finalActionTask = "Final Action";
    var finalActionStatus = "Approved";
}

if(matches(wfProcess,"P_PRE")) {
    var reviewTasksArray = ["PLANNING","FIRE","ENGINEERING","ENVIRONMENTAL SERVICES","PUBLIC WORKS","WPCP OR ORO LOMA","ECONOMIC DEVELOPMENT","BUILDING","OTHER","LIBRARY - HISTORIC COMMISSION"];
    var taskStatusArray = ["REVIEW COMPLETE","COMMENTS","NO COMMENTS"];
    var routingTaskArray = ["Application Submitted"];
    var routingStatusArray = ["Distribution"];
    var resubmittalRoutedStatus = "Distribution";
    var resubmittalRoutedStatusArray = ["Distribution"];
    var reviewTaskResubmittalReceivedStatus = "Revisions Received";
    var reviewTaskResubmitStatusArray = ["Comments"];
    var reviewTaskApprovedStatusArray = ["No Comments","Review Complete"];
    var reviewTaskStatusPendingArray = [null,"",undefined,"Notes","Revisions Received"];
    var consolidationTask = "Staff Determination";
    var consolidationResubmitStatusArray = ["Comments"];
    var consolidationApprovedStatus = "Approved";
    var consolidationApprovedStatusArray = ["Start Entitlement","Work Session"];
    var readyToIssueTask = "Staff Determination";
    var readyToIssueTaskStatusArray = ["Start Entitlement","Work Session"];
    var issueTask = "Staff Determination";
    var issueStatusArray = ["Start Entitlement","Work Session"];
    var finalActionTask = "";
    var finalActionStatus = "";
}


var digEplanReportExists = false;
var digEplanInterimReportExists = false;
var docArray = aa.document.getCapDocumentList(capId,currentUserID).getOutput();
if(docArray != null && docArray.length > 0) {
    for (d in docArray) {
        //logDebug("<font color='green'>*****Document Details*****</font>");
        //logDebug("<font color='green'>DocName: " + docArray[d]["docName"] + " - DocID: " + docArray[d]["documentNo"] + "</font>");
        //logDebug("<font color='green'>DocGroup / DocCategory: " + docArray[d]["docGroup"] + " / " + docArray[d]["docCategory"] + "</font>");
        //logDebug("<font color='green'>DocStatus: " + docArray[d]["docStatus"] + "</font>");
        //logDebug("<font color='green'>FileUploadBy: " + docArray[d]["fileUpLoadBy"] + "</font>");
        //logDebug("<font color='green'>UploadBy Matches API User: " + exists(docArray[d]["fileUpLoadBy"],digEplanAPIUser) + "</font>");
        if(docArray[d]["docName"].indexOf("Interim") == -1 && exists(docArray[d]["fileUpLoadBy"],digEplanAPIUser)) digEplanReportExists = true;
        if(docArray[d]["docName"].indexOf("Interim") > 0 && exists(docArray[d]["fileUpLoadBy"],digEplanAPIUser)) digEplanInterimReportExists = true;
    }
}
if(digEplanReportExists) logDebug("<font color='green'> DIGEPLAN REPORTS EXIST FOR THIS RECORD </font>");
else logDebug("<font color='red'> DIGEPLAN REPORTS DO NOT EXIST FOR THIS RECORD </font>");
//if(digEplanInterimReportExists) logDebug("<font color='green'> DIGEPLAN INTERIM REPORTS EXIST FOR THIS RECORD </font>");
//else logDebug("<font color='red'> DIGEPLAN INTERIM REPORTS DO NOT EXIST FOR THIS RECORD </font>");

//logDebug("<font color='blue'>edrPlansExist: " + edrPlansExist(docGroupArrayModule,docTypeArrayModule) + "</font>");
//logDebug("<font color='blue'>wfTask: " + wfTask + "</font>");
//logDebug("<font color='blue'>wfStatus: " + wfStatus + "</font>");
//logDebug("<font color='blue'>wf criteria met: " + wfTask == consolidationTask && exists(wfStatus,consolidationResubmitStatus) + "</font>");


/*-----START DIGEPLAN EDR SCRIPTS-----*/

//Set "Uploaded" documents by group/category to inReviewDocStatus on routing
if(exists(wfTask,routingTaskArray) && exists(wfStatus,routingStatusArray)) {
    var docArray = aa.document.getCapDocumentList(capId,currentUserID).getOutput();
    if(docArray != null && docArray.length > 0) {
        for (d in docArray) {
            if(exists(docArray[d]["docGroup"],docGroupArrayModule) && exists(docArray[d]["docCategory"],docTypeArrayModule) && docArray[d]["docStatus"] == "Uploaded" && !exists(docArray[d]["fileUpLoadBy"],digEplanAPIUser)) {
                logDebug("<font color='blue'>Update document status to " + inReviewDocStatus + "</font>");
                if(docArray[d]["docGroup"] == "PMT ACA") {
                    docArray[d].setDocGroup("PMT");
                    logDebug("<font color='blue'>Update document group to PMT - cannot be deleted in ACA</font>");
                }
                docArray[d].setDocStatus(inReviewDocStatus);
                docArray[d].setRecStatus("A");
                docArray[d].setSource(getVendor(docArray[d].getSource(), docArray[d].getSourceName()));
                updateDocResult = aa.document.updateDocument(docArray[d]);
            }
        }
    }
}

//update required reviewTaskArray tasks to reviewTaskResubmittalReceivedStatus
if(digEplanReportExists && exists(wfStatus,resubmittalRoutedStatusArray)) {
    //updatePlanReviewTasks4Resubmittal(reviewTasksArray,taskStatusArray,reviewTaskResubmittalReceivedStatus);
}

//send email to Applicant on consolidationTask/consolidationResubmitStatusArray or consolidationTask/consolidationApprovedStatusArray or revisionCompleteTask/revisionCompleteTaskStatus
if(digEplanReportExists &&  ((wfTask == consolidationTask && exists(wfStatus,consolidationResubmitStatusArray)) || (wfTask == consolidationTask && exists(wfStatus,consolidationApprovedStatusArray)))) {
    consolidationApprovedStatus = "";
    if(exists(wfStatus,consolidationApprovedStatusArray)) consolidationApprovedStatus = wfStatus;
    consolidationResubmitStatus = "";
    if(exists(wfStatus,consolidationResubmitStatusArray)) {
        consolidationResubmitStatus = wfStatus;
        updateRevisionDocumentsForResubmit(docGroupArrayModule,docTypeArrayModule,digEplanAPIUser);
    }
    if(digEplanReportExists) emailReviewCompleteNotification(wfStatus,consolidationResubmitStatus,consolidationApprovedStatus,docGroupArrayModule);
}


//send email to Applicant on reviewTaskResubmitStatusArray
/*
if(digEplanInterimReportExists && exists(wfTask.toUpperCase(),reviewTasksArray) && exists(wfStatus,reviewTaskResubmitStatusArray)) {
	//if(digEplanInterimReportExists) emailCorrectionsRequiredNotification(wfTask,wfStatus,wfComment);
}
*/

//activate consolidationTask when all required reviewTasksArray tasks have been completed
if(exists(wfTask.toUpperCase(),reviewTasksArray) /*&& isTaskActive(consolidationTask)*/ && checkForPendingReviews(reviewTasksArray,reviewTaskStatusPendingArray) == false) {
    if(!isTaskActive(consolidationTask)) activateTask(consolidationTask);
    //if(!isTaskStatus(consolidationTask,"Ready for Consolidation")) updateTask(consolidationTask,"Ready for Consolidation","Required Reviews are completed. Permit is ready for comments coordination for electronic plan review.","");
    if(checkForRevisionsNeeded(reviewTasksArray,reviewTaskResubmitStatusArray) == true) var reviewStatus = "Resubmittal/Revision Required";
    else var reviewStatus = "Approved";
    logDebug("<font color='red'>Review Status: " + reviewStatus + "</font>");
    //emailReviewConsolidationNotification(reviewStatus);
}

//Update Approved Document Statuses/Category on consolidationTask/consolidationApprovedStatusArray
if(digEplanReportExists && matches(wfTask,consolidationTask) && exists(wfStatus,consolidationApprovedStatusArray)) {
    docArray = aa.document.getCapDocumentList(capId,currentUserID).getOutput();
    if(docArray != null && docArray.length > 0) {
        for (d in docArray) {
            //logDebug("DocumentID: " + docArray[d]["documentNo"]);
            //logDebug("DocumentGroup: " + docArray[d]["docGroup"]);
            //logDebug("DocName: " + docArray[d]["docName"]);
            //logDebug("DocumentStatus: " + docArray[d]["docStatus"]);
            //logDebug("<font color='green'>UploadBy: " + docArray[d]["fileUpLoadBy"] + "</font>");
            if((exists(docArray[d]["docGroup"],docGroupArrayModule) || docArray[d]["docGroup"] == null) && matches(docArray[d]["docStatus"],reviewCompleteDocStatus,"Uploaded",approvedPendingDocStatus) && exists(docArray[d]["fileUpLoadBy"],digEplanAPIUser)) {
                if(docArray[d]["docName"].indexOf("Interim") == -1 && matches(getParentDocStatus(docArray[d]),approvedDocStatus,approvedPendingDocStatus,reviewCompleteDocStatus)) {
                    if(matches(getParentDocStatus(docArray[d]),approvedDocStatus)) updateParentDocStatus(docArray[d],approvedPendingDocStatus);
                    logDebug("<font color='green'>*Final Report - Approved DocumentID: " + docArray[d]["documentNo"] + "</font>");
                    //updateCheckInDocStatus(docArray[d],revisionsRequiredDocStatus,approvedDocStatus,approvedPendingDocStatus);
                    updateDocPermissionsbyCategory(docArray[d],docInternalCategory);
                    var thisOrigDocName = docArray[d].getDocName().substring(0,docArray[d].getDocName().lastIndexOf(" - Reviewed - Approved"));
                    docArray[d].setDocName(capIDString + "_Approved_" + thisOrigDocName + ".pdf");
                    updateDocResult = aa.document.updateDocument(docArray[d]);
                }
                if(docArray[d]["docName"].indexOf("Sheet Report") >= 0 && docArray[d]["docStatus"] == "Uploaded") {
                    logDebug("<font color='green'>*Sheet Report DocumentID: " + docArray[d]["documentNo"] + "</font>");
                    docArray[d].setDocGroup("PLN_ONLINE");
                    docArray[d].setDocStatus(approvedPendingDocStatus);
                    docArray[d].setDocCategory(docInternalCategory);
                    docArray[d].setDocName(capIDString + "_Approved_Plans_Sheet_Report.pdf");
                    docArray[d].setRecStatus("A");
                    docArray[d].setSource(getVendor(docArray[d].getSource(), docArray[d].getSourceName()));
                    updateDocResult = aa.document.updateDocument(docArray[d]);
                    logDebug("<font color='blue'>Document " + docArray[d]["documentNo"] + " updated</font>");
                }
            }
        }
    }
}

//Update Approved Document Statuses/Category on issueTask/issueStatus
if(digEplanReportExists && wfTask == issueTask && exists(wfStatus,issueStatusArray)) {
    docArray = aa.document.getCapDocumentList(capId,currentUserID).getOutput();
    if(docArray != null && docArray.length > 0) {
        for (d in docArray) {
            if(exists(docArray[d]["docGroup"],docGroupArrayModule) && docArray[d]["docStatus"] == approvedPendingDocStatus) {
                if(docArray[d]["docStatus"] == approvedPendingDocStatus) {
                    var updateCategory = docArray[d].getDocCategory();
                    if(docArray[d].getDocCategory() == docInternalCategory) {
                        if(!matches(getParentDocCategory(docArray[d]),null)) updateCategory = getParentDocCategory(docArray[d]);
                        if(docArray[d]["docName"].indexOf("Approved_Plans_Sheet_Report") > 0) updateCategory = "Plans";
                    }
                    if(exists(docArray[d]["fileUpLoadBy"],digEplanAPIUser)) docArray[d].setDocStatus(approvedIssuedDocStatus);
                    if(!exists(docArray[d]["fileUpLoadBy"],digEplanAPIUser)) docArray[d].setDocStatus(approvedFinalDocStatus);
                    docArray[d].setDocCategory(updateCategory);
                    docArray[d].setRecStatus("A");
                    docArray[d].setSource(getVendor(docArray[d].getSource(), docArray[d].getSourceName()));
                    updateDocResult = aa.document.updateDocument(docArray[d]);
                }
            }
            if(exists(docArray[d]["docGroup"],docGroupArrayModule) && docArray[d]["docStatus"] == inReviewDocStatus) {
                docArray[d].setDocStatus(reviewCompleteDocStatus);
                updateDocResult = aa.document.updateDocument(docArray[d]);
            }
        }
    }
}

if(digEplanReportExists && wfTask == finalActionTask && wfStatus == finalActionStatus) {
    emailFinalActionNotification(wfTask,wfStatus,wfComment);
}


synchronizeDocFileNames();

/*-----END DIGEPLAN EDR SCRIPTS-----*/