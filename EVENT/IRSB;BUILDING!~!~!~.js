//CASANLEAN-1525
showDebug = false;
if((!inspComment || inspComment == "")
    && (inspResult == "Canceled"||inspResult == "Cancelled"||inspResult == "Partial"||inspResult == "Fail"))
{
    cancel = true;
    showMessage = true;
    showDebug = false;
    comment("Enter a result comment.");
}