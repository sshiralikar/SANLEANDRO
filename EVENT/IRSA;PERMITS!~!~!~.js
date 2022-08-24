//Inspection Result Submit After for all Permit records
showDebug = false;
showMessage = true;
if(inspType == "Building Final" && inspResult == "Passed")
    closeTask("Inspection","Final Inspection Complete","Updated by Inspection Result","Note");
if(inspType == "Electrical Final" && inspResult == "Passed")
    closeTask("Inspection","Final Inspection Complete","Updated by Inspection Result","Note");
if(inspType == "Plumbing Final" && inspResult == "Passed")
    closeTask("Inspection","Final Inspection Complete","Updated by Inspection Result","Note");
if(inspType == "Mechanical Final" && inspResult == "Passed")
    closeTask("Inspection","Final Inspection Complete","Updated by Inspection Result","Note");
if(inspType == "Sign Final" && inspResult == "Passed")
    closeTask("Inspection","Final Inspection Complete","Updated by Inspection Result","Note");