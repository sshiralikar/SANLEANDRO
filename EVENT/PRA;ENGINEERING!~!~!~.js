//CASANLEAN-2982
if(publicUser && isTaskActive("Plans Coordination") && balanceDue <= 0) {
    updateTask("Plans Coordination", "Fees Paid", "-Updated via PRA", "");
}