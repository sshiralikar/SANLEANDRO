//Exclude Building module
if(!appMatch("Building/*/*/*")) {
    if(!matches(AInfo["ParcelAttribute.FLOODZONE"], "NONE","None","X","X SHADED, NONE","X Shaded","X Shaded, None","XS"))
    {
        showMessage = true;
        comment("<font size=small color=red><b>Parcel in Flood Zone</b></font><br><br>This parcel is in a flood zone and must be routed for a Flood Review.<br><br>");
        cancel = false;
    }
}