//CASANLEAN-1525
if((!inspComment || inspComment == "")
    && (inspResult == "Cancelled"||inspResult == "Partial"||inspResult == "Fail"))
{
    cancel = true;
    showMessage = true;
    showDebug = false;
    comment("Please enter the result comments.");
}