//Inspection Result Submit After for all Enforcement record types
disableTokens = true;
holdCapId = capId; parentArray = getParents("*/*/*/*");
if(inspType == "Initial Investigation" && inspResult == "Compliant")
{
    branchTask("Initial Investigation","No Violation","Updated by Inspection Result","Note");
    closeTask("Case Closed","Closed","","");
    if (parentArray && parentArray.length > 0)
        for (thisParent in parentArray)
            if (parentArray[thisParent])
            {
                capId = parentArray[thisParent];
                closeTask("Investigation","No Violation","","");
                capId = holdCapId;
            }
}
if(inspType == "Initial Investigation" && inspResult == "In Violation")
    closeTask("Initial Investigation","In Violation","Updated by Inspection Result","Note");

if(inspType == "Initial Investigation" && inspResult == "Citation")
    loopTask("Initial Investigation","Recommend Citation","Updated by Inspection Result","Note");

if(inspType == "Follow-Up Investigation" && inspResult == "Compliant")
{
    branchTask("Follow-Up Investigation","Violation Corrected","Updated by Inspection Result","Note");
    closeTask("Case Closed","Closed","","");
    if (parentArray && parentArray.length > 0)
        for (thisParent in parentArray)
            if (parentArray[thisParent])
            {
                capId = parentArray[thisParent];
                closeTask("Investigation","Violation Corrected","","");
                capId = holdCapId;
            }
}
if(inspType == "Follow-Up Investigation" && inspResult == "Citation")
    closeTask("Follow-Up Investigation","Recommend Citation","Updated by Inspection Result","Note");