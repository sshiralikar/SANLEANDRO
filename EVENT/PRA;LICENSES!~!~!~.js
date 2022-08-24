if(balanceDue <= 0 && isTaskActive("Fee Payment"))
    closeTask("Fee Payment","Paid","updated via script",null);