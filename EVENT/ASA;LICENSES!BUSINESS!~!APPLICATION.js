//Application submittal actions for business licenses.   Create Fees, Create Public User
if(AInfo["Gross Annual Receipts"] < 40000)
    feeCode = "LIC_BUS_GEN"
else
    feeCode = "LIC_BUS_GENM";

updateFee(feeCode,"LIC_BUSINESS_GENERAL","FINAL",1,"Y");
if(!feeEstimate)
    include("LIC CREATE PUBLIC USER AND LINK");