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
            break;
        }                
    }
}	

if(docId) {	

    var capDetail = aa.cap.getCapDetail(capId).getOutput();
    var currentAssignedStaff = capDetail.getAsgnStaff();
    logDebug("Assigned staff: " + currentAssignedStaff);
    var staffUser = aa.person.getUser(currentAssignedStaff).getOutput();
    
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
    var staffName = staffUser.fullName;
    var staffEmail = staffUser.email;
    var staffSigner = new adobeSignerObj(String(staffName), String(staffEmail));
    var alias = aa.cap.getCap(capId).getOutput().getCapType().getAlias();
    // var message = "Hello "+signer.FullName+",\n\
    //             Your application for a "+ alias +" ("+capId.getCustomID()+") has been approved. Please review the attached "+ alias +" and return a signed copy to me. Once the signed copy is received, our staff will provide you with the completed permit and stamped plans.\n\
    //             Please feel free to contact us if you have any questions.\n\
    //             Thank you,";
    var message = "";        
    var subject = capId.getCustomID() + " " + alias + " Requires Signature";
    var envelope = new doAdobeSign("SANLEANDRO-SUPP", capId, "Permit (Signed)", subject, null, null, message);//Replace Organization
    envelope.AddDocument(docId, "");
    envelope.AddSigner(signer);
    envelope.AddSigner(staffSigner);
    // props(envelope);
    if(staffEmail && primaryEmail) {
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
                var sendEmail = false;
                if(currentEnvelopes == 750) {
                    sendEmail = true;
                } else if(currentEnvelopes == 1500) {
                    sendEmail = true;
                } else if (currentEnvelopes == 2250) {
                    sendEmail = true;
                } else if (currentEnvelopes >= envelopeLimit) {
                    sendEmail = true;
                }
                logDebug("Current threshold: " + currentTreshold);
                if(sendEmail) {
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
        }
    }
}