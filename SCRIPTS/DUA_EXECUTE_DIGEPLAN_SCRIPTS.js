//DUA_EXECUTE_DIGEPLAN_SCRIPTS
logDebug("Inside DUA_EXECUTE_DIGEPLAN_SCRIPTS");

/*-----DEFINE VARIABLES FOR DIGEPLAN SCRIPTS-----*/
//Document Specific Variables
var docGroupArrayModule = ["PMT","PMT ACA","PLN_ONLINE","ENGR","GRA","ENC"];
var docTypeArrayModule = ["Construction Plans","Plans","Site Plans","Site Plan","Document","Other","Application Materials","Markups","Other Documents","Standard Plans","Sidewalk Repair Exhibit","Soils Reports","Traffic Control Plans","Sewer Repair Forms","OSHA Documents","Compaction Report"];
var originalDocStatusOnResubmit = "Resubmitted";
var parentDocStatusOnResubmit = "Resubmitted";
var resubmitDocStatusOnResubmit = "Uploaded";

//Workflow Specific variables
var routingTask = "Plans Distribution";
var routingStatus = "Resubmittal or Revision";
var routingResubmittalStatus = "Revisions Received";

//set Routing Task and Routing Status by Workflow Process
var wfProcessCode = getCapProcessCode(capId);
if(matches(wfProcessCode,"")) {
    routingTask = "Plan Review";
    routingResubmittalStatus = "Revisions Received";
}


/*------------START EDR UPLOAD/RESUBMITTAL ACTIONS------------*/
var newDocModelArray = documentModelArray.toArray();
var doPreCache = false;

if(capIDString.indexOf("TMP") == -1) {
    if(publicUser) emailDocUploadNotification(docGroupArrayModule,docTypeArrayModule);

    for (dl in newDocModelArray) {
        if(exists(newDocModelArray[dl]["docGroup"],docGroupArrayModule) && exists(newDocModelArray[dl]["docCategory"],docTypeArrayModule)) doPreCache = true;
        if(newDocModelArray[dl]["categoryByAction"] == "RESUBMIT") {
            doResubmitActions(newDocModelArray[dl],docGroupArrayModule,docTypeArrayModule,routingTask,routingResubmittalStatus,originalDocStatusOnResubmit,parentDocStatusOnResubmit,resubmitDocStatusOnResubmit);
        }
    }


    if(doPreCache) {
        var docPreCache = digEplanPreCache("sanleandro",capIDString,lookup("EXTERNAL_DOC_REVIEW","ENVIRONMENT"));
    }
}
/*------------END EDR UPLOAD/RESUBMITTAL ACTIONS------------*/