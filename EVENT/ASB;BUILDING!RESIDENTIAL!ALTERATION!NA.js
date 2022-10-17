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
    if((String(AInfo["Insulation?"]).toUpperCase() == "YES" || String(AInfo["Insulation?"]).toUpperCase() == "Y")
        ||(String(AInfo["Plumbing?"]).toUpperCase() == "YES" || String(AInfo["Plumbing?"]).toUpperCase() == "Y")
        ||(String(AInfo["Mechanical?"]).toUpperCase() == "YES" || String(AInfo["Mechanical?"]).toUpperCase() == "Y")
        ||(String(AInfo["Electrical?"]).toUpperCase() == "YES" || String(AInfo["Electrical?"]).toUpperCase() == "Y"))
        requirementArray.push("Title 24");

    if((String(AInfo["Retain Wall?"]).toUpperCase() == "YES" || String(AInfo["Retain Wall?"]).toUpperCase() == "Y")
        ||(String(AInfo["Structural?"]).toUpperCase() == "YES" || String(AInfo["Structural?"]).toUpperCase() == "Y"))
    {
        requirementArray.push("Structural Calculations");
        requirementArray.push("Structural Plans");
    }

    return requirementArray;
}

