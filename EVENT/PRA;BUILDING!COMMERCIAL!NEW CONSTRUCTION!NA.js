//CASANLEAN-960
if(isTaskActive("Plans Distribution") && balanceDue == 0)
{
    updateTask("Plans Distribution","Fees Paid","","");
    updateAppStatus("In Review","Updated through script");
}
//CASANLEAN-960