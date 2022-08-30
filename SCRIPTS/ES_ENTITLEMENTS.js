//application submit after for planning
feeRow = PROJECT[eachrow];
if(eachrow == 0)
    entShortNotes =  feeRow["Application Type"] + "";
if(eachrow > 0)
    entShortNotes = entShortNotes + "," + feeRow["Application Type"];