//Inspection Result Submit After for all Business License records
showDebug = false;
showMessage = true;
if(inspType == "License Inspection" && inspResult == "Passed")
    closeTask("Inspection","Inspection Passed","Updated by Inspection Result","Note");
if(inspType == "License Inspection" && inspResult == "Failed")
    closeTask("Inspection","Inspection Failed","Updated by Inspection Result","Note");