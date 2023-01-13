var floodZone = getGISInfo2ASB("SANLEANDRO", "Parcels", "SFHA2018");
if(floodZone == "Y") {
    var capIdString = capId.getID1() + "-" + capId.getID2() + "-" + capId.getID3();
    var currentDocs = aa.document.getDocumentListByEntity(capIdString,"TMP_CAP").getOutput().toArray();
    var foundFEMADoc = false;
    for(var docIndex in currentDocs) {
        var docObj = currentDocs[docIndex];
        var category = doc.getDocCategory();
        if(category == "FEMA Documents") {
            foundFEMADoc = true;
            break;
        }
    }
    if(!foundFEMADoc) {
        showMessage = true;
        comment("<font size=small color=red><b>Parcel in Flood Zone</b></font><br><br>This parcel is in a flood zone and must be routed for a Flood Review.<br><br>");
        cancel = true;
    }
}