//CASANLEAN-1525
if((!inspComment || inspComment == "")
    && (inspResult == "Cancelled"||inspResult == "Partial"||inspResult == "Fail"))
{
    cancel = true;
    showMessage = true;
    comment("Please enter the result comments.");
}