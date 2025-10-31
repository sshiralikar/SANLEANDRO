var docList = aa.document.getDocumentListByEntity(capId, "CAP").getOutput().toArray();
var docId = null;
if (docList.length > 0) {
    for (var docIndex in docList) {
        var docModel = docList[docIndex];
        var docCategory = docModel.getDocCategory();
        var id = docModel.getDocumentNo();
        if("Permit Template".equals(docCategory)) {
            logDebug("Found Doc #" + id);
            docId = String(id);
            //CASANLEAN-3134
            var revisions = getChildren("Engineering/Revision/NA/NA", capId);
            var newDocName = String(capId.getCustomID());
            if(revisions && revisions.length > 0) {
                newDocName += "-V" + revisions.length;
            }
            newDocName += ".pdf";
            logDebug("File name: " + newDocName);
            docModel.setFileName(newDocName);
            docModel.setDocName(newDocName);
            var result = aa.document.updateDocument(docModel);
            if(result.getSuccess()) {
                logDebug("Successfully updated doc name");
            }
            break;
        }
    }
}

if(docId) {

    // var capDetail = aa.cap.getCapDetail(capId).getOutput();
    // var currentAssignedStaff = capDetail.getAsgnStaff();
    // logDebug("Assigned staff: " + currentAssignedStaff);
    // var staffUser = aa.person.getUser(currentAssignedStaff).getOutput();

    var contacts = aa.people.getCapContactByCapID(capId).getOutput();
    var primaryEmail = "";
    var primaryName = "";
    for(var contactIndex in contacts) {
        var contactScriptModel = contacts[contactIndex];
        var capContact = contactScriptModel.capContactModel;
        var primaryFlag = capContact.primaryFlag;
        if(primaryFlag == "Y") {
            primaryEmail = capContact.email;
            primaryName = capContact.contactName || capContact.businessName;
            break;
        }
    }

    var signer = new adobeSignerObj(String(primaryName), String(primaryEmail));
    // var staffName = staffUser.fullName;
    // var staffEmail = staffUser.email;
    // var staffSigner = new adobeSignerObj(String(staffName), String(staffEmail));
    var alias = aa.cap.getCap(capId).getOutput().getCapType().getAlias();
    // var message = "Hello "+signer.FullName+",\n\
    //             Your application for a "+ alias +" ("+capId.getCustomID()+") has been approved. Please review the attached "+ alias +" and return a signed copy to me. Once the signed copy is received, our staff will provide you with the completed permit and stamped plans.\n\
    //             Please feel free to contact us if you have any questions.\n\
    //             Thank you,";
    var message = "";
    var subject = capId.getCustomID() + " " + alias + " Requires Signature";
    var envelope = new doAdobeSign("", capId, "Permit (Signed)", subject, null, null, message);//Replace Organization
    envelope.AddDocument(docId, "");
    envelope.AddSigner(signer);
    // envelope.AddSigner(staffSigner);
    // props(envelope);
    if(primaryEmail) {
        var result = envelope.Send();
        if(result.success) {
            //CASANLEAN-2980/CASANLEAN-2981
            var currentEnvelopes = lookup("INTERFACE_ADOBESIGN", "ENVELOPE_USAGE");
            var envelopeLimit = lookup("INTERFACE_ADOBESIGN", "ENVELOPE_LIMIT");
            if(currentEnvelopes && envelopeLimit) {
                currentEnvelopes = parseInt(currentEnvelopes, 10);
                envelopeLimit = parseInt(envelopeLimit, 10);
                currentEnvelopes++;
                editLookup("INTERFACE_ADOBESIGN", "ENVELOPE_USAGE", String(currentEnvelopes));
                var currentTreshold = ((currentEnvelopes/envelopeLimit) * 100).toFixed(0);
                var sendEmailFlag = false;
                if(currentEnvelopes == 750) {
                    sendEmailFlag = true;
                } else if(currentEnvelopes == 1500) {
                    sendEmailFlag = true;
                } else if (currentEnvelopes == 2250) {
                    sendEmailFlag = true;
                } else if (currentEnvelopes >= envelopeLimit) {
                    sendEmailFlag = true;
                }
                logDebug("Current threshold: " + currentTreshold);
                if(sendEmailFlag) {
                    var emailParams = aa.util.newHashtable();
                    emailParams.put("$$limit$$", String(currentTreshold));
                    emailParams.put("$$total$$", String(envelopeLimit));
                    emailParams.put("$$current$$", String(currentEnvelopes));
                    var emailResult = aa.document.sendEmailByTemplateName("", "", "", "ENG_ADOBE_SIGN_ENVELOPE_USAGE_LIMIT", emailParams, []);
                    if(emailResult.getSuccess()) {
                        logDebug("Sent email successfully!");
                    } else {
                        logDebug("Failed to send mail. - " + emailResult.getErrorType());
                    }
                }
            }
        } else {
            logDebug("Failed to send adobe sign request");
        }
    }
}

salSlack("Digital Signature Debug:\n" + debug);
function salSlack(msg) {

    if(msg.indexOf("<BR>") >= 0) {
        msg = msg.replace(/<BR>/g, "\n");
    }

    var headers=aa.util.newHashMap();

    headers.put("Content-Type","application/json");

    var body = {};
    body.text = aa.getServiceProviderCode() + ":" + "SUPP" + ": " + msg;

    //GQ Slack
    // var SLACKURL = "https://hooks.slack.com/services/";
    // SLACKURL = SLACKURL + "T5BS1375F/";
    // SLACKURL = SLACKURL + "BG09GQ3RS/NUs694ouyawHoAFK4jJXwn1p";

    //Your slack
    var SLACKURL = "https://hooks.slack.com/services/";
    SLACKURL = SLACKURL + "T02GGPNQ6DN/";
    SLACKURL = SLACKURL + "B02G5QX2649/jcb5fbduFzmtCvjLg1cfKEaQ";

    var apiURL = SLACKURL;  // from globals
    var result = aa.httpClient.post(apiURL, headers, JSON.stringify(body));

    if (!result.getSuccess()) {
        logDebug("Slack get anonymous token error: " + result.getErrorMessage());
    } else {
        aa.print("Slack Results: " + result.getOutput());
    }
}