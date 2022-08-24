disableTokens = true;
holdCapId = capId;
parentArray = getParents("*/*/*/*");
if(wfTask == "Initial Investigation" && wfStatus == "No Violation")
{
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
if(wfTask == "Follow-Up Investigation" && wfStatus == "Violation Corrected")
{
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
if(wfTask == "Issue Citation" && wfStatus == "Violation Corrected")
{
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
if(wfTask == "Route to Legal" && wfStatus == "Decision Made")
{
    closeTask("Case Closed","Closed","","");
    if (parentArray && parentArray.length > 0)
        for (thisParent in parentArray)
            if (parentArray[thisParent])
            {
                capId = parentArray[thisParent];
                closeTask("Investigation","Legal Decision","","");
                capId = holdCapId;
            }
}
disableTokens = false;