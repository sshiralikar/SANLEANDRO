//Application submittal actions for contractor licenses.   Create Public User
if(AInfo["Create Public User Account?"] == "Yes")
    onlineUser = createPublicUserFromContact();
else
    onlineUser = null;

if(onlineUser)
{
    attachResult = aa.cap.updateCreatedAccessBy4ACA(capId,"PUBLICUSER" + onlineUser.getUserSeqNum(),"Y","Y")
}