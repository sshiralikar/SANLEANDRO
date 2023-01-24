try {
    //CASANLEAN-1388
    if(!isDistrictValid())
    {
        cancel = true;
        showMessage = true;
        comment("Your location is outside of our area. Please contact the Oro Loma Sanitary District.");
    }
    //CASANLEAN-1388

} catch (err) {

    logDebug(err)   }

function isDistrictValid()
{
    var val = null;
    var capParcelObj = cap.getParcelModel();
    var parceMod = capParcelObj.getParcelModel();
    var attArray = parceMod.getParcelAttribute().toArray();
    for (att in attArray) {
        if(attArray[att].getB1AttributeName() == "SEWERDISTRICT")
            val = attArray[att].getB1AttributeValue()+"";
    }

    if( AInfo["Type of Work"] == "Sewer" && val && val.toUpperCase().indexOf("SAN LEANDRO SANITARY DISTRICT")==-1 && val.toUpperCase().indexOf("WATER POLLUTION CONTROL PLANT")==-1)
        return true;
    return false;
}