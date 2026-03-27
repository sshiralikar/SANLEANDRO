var aa = expression.getScriptRoot();

try {

    var businessLicenseField = expression.getValue("LP::professionalModel*businessLicense");
    businessLicenseField.message = "Entering your business license will perform a search against SL HDL. Please wait until the search is finished.";
    expression.setReturn(businessLicenseField);

} catch (error) {
    form.message = error.message + " ln: "  + error.lineNumber;
    expression.setReturn(form);
}