addressLine = escape(AddressHouseNumber + " " + AddressStreetDirection + " " + AddressStreetName + " " + AddressStreetSuffix + " " + AddressCity + " " + AddressState + " " + AddressZip);
mapsXML = aa.util.httpPost("http://maps.googleapis.com/maps/api/geocode/xml?address=" + addressLine + "&sensor=true","").getOutput();
if(mapsXML.indexOf("<status>OK</status>") > 0)
{
    comment("YAY!");
    lat = getNode(mapsXML,"lat");
    long = getNode(mapsXML,"long");
    comment("LAT/LONG = " + lat + "/" + long);

}
else
    comment("Map service didn't work " + mapsXML);