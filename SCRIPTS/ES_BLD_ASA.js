if(appMatch("*/*/Residential Water Heater/*") && AInfo["Water Heater 90 Gallons or Less"] == "CHECKED")
    addFee("PWTH","B_WTRHTR","FINAL",1,"N");
if(appMatch("*/*/Residential Water Heater/*") && AInfo["Water Heater 90 Gallons or Less"] != "CHECKED")
    addFee("PWTI","B_WTRHTR","FINAL",1,"N");
if(appMatch("*/*/Reroof/*") && AInfo["Roof System Fire Class"] == "Class A or B")
    addFee("RORF","B_RERF","FINAL",1,"N");
if(appMatch("*/*/Reroof/*") && AInfo["Roof System Fire Class"] == "Class C")
    addFee("RCRF","B_RERF","FINAL",1,"N");
if(AInfo["Existing Use"] == "Residential")
    addFee("SMIR","B_COMBO","FINAL",1,"N");
if(matches(AInfo["Existing Use"],"Commercial","Industrial"))
    addFee("SMIC","B_COMBO","FINAL",1,"N");
if(AInfo["Large Doc Pages"] > 0)
    updateFee("XICL","B_COMBO","FINAL",AInfo["Large Doc Pages"],"N");
if(AInfo["Small Doc Pages"] > 0)
    updateFee("XICS","B_COMBO","FINAL",AInfo["Small Doc Pages"],"N");