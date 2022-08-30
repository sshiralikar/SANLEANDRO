//PROD
//WTUA_EXECUTE_DIGEPLAN_SCRIPTS_BLD
logDebug("Inside WTUA_EXECUTE_DIGEPLAN_SCRIPTS_BLD");

/*-----DEFINE VARIABLES FOR DIGEPLAN SCRIPTS-----*/
//Document Specific Variables for PMT
var docGroupArrayModule = ["PMT","PMT ACA","PLN_ONLINE"];
var docTypeArrayModule = ["Construction Plans","Plans","Site Plans","Site Plan","Document","Supporting Documents","Other"];

//Workflow Specific variables for PMT
var reviewTasksArray = ["BUILDING ARCHITECTURAL REVIEW","PLANNING REVIEW","FIRE REVIEW","ENGINEERING REVIEW","ENVIRONMENTAL REVIEW","BUILDING STRUCTURAL REVIEW","WPCP REVIEW","TITLE 24 ENERGY AND MEP REVIEW","PUBLIC WORKS","FLOOD REVIEW","HEALTH DEPARTMENT REVIEW"];
var taskStatusArray = ["WITH CUSTOMER FOR RESPONSE","APPROVED","APPROVED WITH CONDITIONS","APPROVED WITH COMMENTS"];
var routingTaskArray = ["Application Submittal","Resubmittal or Revision"];
var routingStatusArray = ["Route"];
var resubmittalRoutedStatus = "Route";
var resubmittalRoutedStatusArray = ["Route"];
var reviewTaskResubmittalReceivedStatus = "Revisions Received";
var reviewTaskResubmitStatusArray = ["With Customer for Response"];
var reviewTaskApprovedStatusArray = ["Approved","Approved with Conditions"];
var reviewTaskStatusPendingArray = [null,"",undefined,"Notes","On Hold","Revisions Received"];
var consolidationTask = "Consolidated Comments";
var consolidationResubmitStatusArray = ["Resubmittal","Resubmittal1","Resubmittal2","Resubmittal3","Resubmittal4","Revision"];
var consolidationApprovedStatus = "Ready to Issue";
var consolidationApprovedStatusArray = ["Ready to Issue"];
var readyToIssueTask = "Consolidated Comments";
var readyToIssueTaskStatusArray = ["Ready to Issue"];
var issueTask = "Ready to Issue";
var issueStatusArray = ["Issued","Re-Issue"];

if(matches(wfProcess,"B_PHOTO")) {
    var reviewTasksArray = ["BUILDING REVIEW","PLANNING REVIEW","FIRE REVIEW","MEP REVIEW","ENVIRONMENTAL REVIEW"];
    var taskStatusArray = ["WITH CUSTOMER FOR RESPONSE","APPROVED","APPROVED WITH CONDITIONS"];
    var routingTaskArray = ["Application Submittal","Resubmittal or Revision"];
    var routingStatusArray = ["Route"];
    var resubmittalRoutedStatus = "Route";
    var resubmittalRoutedStatusArray = ["Route"];
    var reviewTaskResubmittalReceivedStatus = "Revisions Received";
    var reviewTaskResubmitStatusArray = ["With Customer for Response"];
    var reviewTaskApprovedStatusArray = ["Approved","Approved with Conditions"];
    var reviewTaskStatusPendingArray = [null,"",undefined,"Notes","On Hold","Revisions Received"];
    var consolidationTask = "Consolidated Comments";
    var consolidationResubmitStatusArray = ["Resubmittal","Resubmittal1","Resubmittal2","Resubmittal3","Resubmittal4","Revision"];
    var consolidationApprovedStatus = "Ready to Issue";
    var consolidationApprovedStatusArray = ["Ready to Issue"];
    var readyToIssueTask = "Consolidated Comments";
    var readyToIssueTaskStatusArray = ["Ready to Issue"];
    var issueTask = "Ready to Issue";
    var issueStatusArray = ["Issued","Re-Issue"];
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
if(edrPlansExist(docGroupArrayModule,docTypeArrayModule) && exists(wfTask,routingTaskArray) && exists(wfStatus,routingStatusArray)) {
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
//disabled 06/21/21
if(edrPlansExist(docGroupArrayModule,docTypeArrayModule) && exists(wfStatus,resubmittalRoutedStatusArray)) {
    //updatePlanReviewTasks4Resubmittal(reviewTasksArray,taskStatusArray,reviewTaskResubmittalReceivedStatus);
}

//send email to Applicant on consolidationTask/consolidationResubmitStatusArray or consolidationTask/consolidationApprovedStatusArray or revisionCompleteTask/revisionCompleteTaskStatus
if(edrPlansExist(docGroupArrayModule,docTypeArrayModule) && ((wfTask == consolidationTask && exists(wfStatus,consolidationResubmitStatusArray)) || (wfTask == consolidationTask && exists(wfStatus,consolidationApprovedStatusArray)))) {
    consolidationApprovedStatus = "";
    if(exists(wfStatus,consolidationApprovedStatusArray)) consolidationApprovedStatus = wfStatus;
    consolidationResubmitStatus = "";
    if(exists(wfStatus,consolidationResubmitStatusArray)) {
        consolidationResubmitStatus = wfStatus;
        updateRevisionDocumentsForResubmit(docGroupArrayModule,docTypeArrayModule,digEplanAPIUser);
    }
    //if(digEplanReportExists) emailReviewCompleteNotification(wfStatus,consolidationResubmitStatus,consolidationApprovedStatus,docGroupArrayModule);
}

//send email to Applicant on reviewTaskResubmitStatusArray
/*
if(edrPlansExist(docGroupArrayModule,docTypeArrayModule) && exists(wfTask.toUpperCase(),reviewTasksArray) && exists(wfStatus,reviewTaskResubmitStatusArray)) {
	//if(digEplanInterimReportExists) emailCorrectionsRequiredNotification(wfTask,wfStatus,wfComment);
}
*/

//activate consolidationTask when all required reviewTasksArray tasks have been completed
if(edrPlansExist(docGroupArrayModule,docTypeArrayModule) && exists(wfTask.toUpperCase(),reviewTasksArray) /*&& isTaskActive(consolidationTask)*/ && checkForPendingReviews(reviewTasksArray,reviewTaskStatusPendingArray) == false) {
    if(!isTaskActive(consolidationTask)) activateTask(consolidationTask);
    if(!isTaskStatus(consolidationTask,"Ready for Consolidation") && !isTaskStatus(consolidationTask,"Consolidated Comments")) updateTask(consolidationTask,"Ready for Consolidation","Required Reviews are completed. Permit is ready for comments coordination for electronic plan review.","");
    if(checkForRevisionsNeeded(reviewTasksArray,reviewTaskResubmitStatusArray) == true) var reviewStatus = "Resubmittal/Revision Required";
    else var reviewStatus = "Approved";
    logDebug("<font color='red'>Review Status: " + reviewStatus + "</font>");
    //emailReviewConsolidationNotification(reviewStatus);
}

//Update Approved Document Statuses/Category on consolidationTask/consolidationApprovedStatusArray
if(edrPlansExist(docGroupArrayModule,docTypeArrayModule) && matches(wfTask,consolidationTask) && exists(wfStatus,consolidationApprovedStatusArray)) {
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
                    docArray[d].setDocGroup("PMT");
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
if(edrPlansExist(docGroupArrayModule,docTypeArrayModule) && wfTask == issueTask && exists(wfStatus,issueStatusArray)) {
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

synchronizeDocFileNames();

/*-----END DIGEPLAN EDR SCRIPTS-----*/