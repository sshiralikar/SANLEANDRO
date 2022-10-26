if(!publicUser)
{
    docsMissing = false;
    r = getProComplRequiredDocuments();
    //submittedDocList = aa.document.getDocumentListByEntity(capId,"TMP_CAP").getOutput().toArray();
    uploadedDocs = new Array();
    //for (var i in submittedDocList ) uploadedDocs[submittedDocList[i].getDocCategory()] = true;
    var submittedDocArray = aa.env.getValue("DocumentModelList");
    if (submittedDocArray != null && submittedDocArray != '' && submittedDocArray) {
        submittedDocArray = submittedDocArray.toArray();
        for (doc in submittedDocArray) {
            uploadedDocs[submittedDocArray[doc].getDocCategory()] = true;
        }
    }
    //var docStr = "";
    if (r.length > 0 ) {
        for (x in r) {
            if (uploadedDocs[r[x]] == undefined) {
                showMessage = true;
                cancel = true;
                if (!docsMissing) {
                    comment("The following documents are required based on the information you have provided: ");
                    docsMissing = true;
                }
                //docStr += r[x] + "\n";
                comment(r[x]);
            }
        }
        if (r.length > 0 && docsMissing) {
            //comment("</ol>"+docStr+"</div>");
        }
    }
}


function getProComplRequiredDocuments()
{
    var requirementArray = [];
    if((String(AInfo["New Equipment?"]).toUpperCase() == "YES" || String(AInfo["New Equipment?"]).toUpperCase() == "Y"))
        requirementArray.push("Manufacturer Specifications");

    return requirementArray;
}

