entShortNotes = "";
if(typeof(PROJECT) == "object")
    for (eachrow in PROJECT)
        include("ES_ENTITLEMENTS");
comment("This is the length of the variable = " + entShortNotes.length);
if(entShortNotes.length <= 120)
    updateShortNotes(entShortNotes);
if(entShortNotes.length > 120)
    updateShortNotes(entShortNotes.substring(0,119));
include("ES_PLN_DEFAULT_FEES");