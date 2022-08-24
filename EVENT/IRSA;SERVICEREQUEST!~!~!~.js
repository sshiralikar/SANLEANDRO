//Service Request inspections update the Investigation workflow task status
showDebug = false;
showMessage = true;
if(inspType == "Initial Investigation" && inspResult == "Compliant")
    closeTask("Investigation","Compliant","Updated by Inspection Result","Note");
if(inspType == "Initial Investigation" && inspResult == "No Violation Found")
    closeTask("Investigation","No Violation","Updated by Inspection Result","Note");
if(inspType == "Initial Investigation" && inspResult == "Corrected")
    closeTask("Investigation","Corrected","Updated by Inspection Result","Note");
if(inspType == "Initial Investigation" && inspResult == "Abated")
    closeTask("Investigation","Abated","Updated by Inspection Result","Note");
if(inspType == "Follow-Up Investigation" && inspResult == "Compliant")
    closeTask("Investigation","Compliant","Updated by Inspection Result","Note");
if(inspType == "Follow-Up Investigation" && inspResult == "No Violation Found")
    closeTask("Investigation","No Violation Found","Updated by Inspection Result","Note");
if(inspType == "Follow-Up Investigation" && inspResult == "Corrected")
    closeTask("Investigation","Corrected","Updated by Inspection Result","Note");
if(inspType == "Follow-Up Investigation" && inspResult == "Abated")
    closeTask("Investigation","Abated","Updated by Inspection Result","Note");