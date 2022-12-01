if(isTaskActive("Plans Distribution") && balanceDue == 0)
{
    updateTask("Plans Distribution","Fees Paid","","");
    updateAppStatus("In Review","Updated through script");
}
else if(isTaskActive("Plans Coordination") && balanceDue == 0)
{
    updateTask("Plans Coordination","Fees Paid","","");
    updateAppStatus("In Review","Updated through script");
}