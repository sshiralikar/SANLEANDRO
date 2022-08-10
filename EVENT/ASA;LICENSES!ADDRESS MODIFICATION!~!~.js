//Application submit after actions for amending address
parentName = null ; 
parentCapId = getParent();
if(parentCapId)
{
	 parentCap = aa.cap.getCap(parentCapId).getOutput();  
	 if (parentCap) 
	 	parentName = parentCap.getSpecialText();
}
if(parentName)
	editAppName(parentName);
