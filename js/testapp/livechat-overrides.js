// import { Livechat2Api } from '../api/livechat2api.js';

// livechatapi = new Livechat2Api("wss://" + livechatApiSocketDomain);

window.livechatapi = new Livechat2Sdk.Livechat2Api("wss://" + livechatApiSocketDomain);

livechatapi.onEnd = reason => {
    console.log(writeToScreen("onEnd : " + reason));
    ChangePageContent(false);
    ShowNotification(notificationTypes.info, "Session Ended");
}

livechatapi.onUserMessage = (content, from) => {
    var message = JSON.parse(content);
    console.log(writeToScreen("onUserMessage : MSG - " + message.message_content + ", " + from));
}

livechatapi.onTypingState = (content, from) => {
    console.log(content);
    if (content.status === "START") {
        console.log(showTyping());
    }
    else {
        console.log(hideTyping());
    }
}

livechatapi.onStartSuccess = sid => {
    console.log(writeToScreen("onStartSuccess : " + sid));
    ChangePageContent(true);
    ShowNotification(notificationTypes.success, "Session Started");
    initCallSdk();
}

livechatapi.onStartFailed = error => {
    console.log(writeToScreen("RECEIVED: START FAILED : error:" + error));
    ShowNotification(notificationTypes.error, "Session Start Failed");

    var json = JSON.parse(error);
    if (json.reasonCode === 'SESSION_EXIST') {
        $('#sessionModal').modal('show');
    }
}

livechatapi.onRequestQueued = position => {
    console.log(writeToScreen("onRequestQueued : " + position));
    ShowNotification(notificationTypes.success, "Request Queued");
}

livechatapi.onGroupCreated = groupInfo => {
    console.log(writeToScreen("onGroupCreated: Group created with below parameters:" +
        "\n Group ID: " + groupInfo.Id +
        "\n" + "Group Name: " + groupInfo.Name +
        "\n" + "Group Description: " + groupInfo.Description +
        "\n" + "Created By: " + groupInfo.CreatedBy +
        "\n" + "Created Date Time: " + groupInfo.CreatedDateTime +
        "\n" + "Group Participants: " + (JSON.stringify(groupInfo.Participants))));
    AddGroupToUI(groupInfo);
}

livechatapi.onGroupDeleted = groupId => {
    console.log(writeToScreen("Group " + groupId + " is deleted"));
}

livechatapi.onUserAddedToGroup = groupInfo => {
    console.log(writeToScreen("Group created with below parameters:" +
        "\n Group ID: " + groupInfo.Id +
        "\n" + "Group Name: " + groupInfo.Name +
        "\n" + "Group Description: " + groupInfo.Description +
        "\n" + "Created By: " + groupInfo.CreatedBy +
        "\n" + "Created Date Time: " + groupInfo.CreatedDateTime +
        "\n" + "Group Participants: " + (groupInfo.Participants.toString())));
}

livechatapi.onUserRemovedFromGroup = userInfo => {
    console.log(writeToScreen("Users " + userInfo.Participants.toString() + " are removed from group with Id " + userInfo.GroupId + " at " + userInfo.ParticipantsModifiedDateTime));
}

livechatapi.onGroupNameModified = groupInfo => {
    console.log(writeToScreen("Name of the Group with Id " + groupInfo.Id + " has been changed to " + groupInfo.Name));
}

livechatapi.onGroupDescriptionModified = groupInfo => {
    console.log(writeToScreen("Name of the Group with Id " + groupInfo.Id + " has been changed to " + groupInfo.Description));
}

livechatapi.onUserGroupListing = groupListInfo => {
    console.log(writeToScreen("Group List received for user Id: " + groupListInfo.UserId + " \n Last Group Id: " + groupListInfo.LastGroupListId + " \n Group List Information: " + JSON.stringify(groupListInfo.GroupListInfo)));
    AddGroupListsToUI(groupListInfo);
}

livechatapi.onGroupMessageReceived = groupMessageDetails => {
    console.log(writeToScreen("Group Message Received with details: " + JSON.stringify(groupMessageDetails)));
}

livechatapi.onConferenceCreated = conferenceData => {
    console.log(writeToScreen("Conference has been created with Id " + conferenceData.InteractionId + " and users " + conferenceData.UserIds));
}

livechatapi.onConferenceUserAdded = conferenceData => {
    console.log(writeToScreen("Conference user(s) added with Id " + conferenceData.InteractionId + " and users " + conferenceData.UserIds));
}

livechatapi.onConferenceUserRemoved = conferenceData => {
    console.log(writeToScreen("Conference user(s) removed with Id " + conferenceData.InteractionId + " and users " + conferenceData.UserIds));
}

livechatapi.onGroupAdminAdded = info => {
    console.log(writeToScreen("User  " + info.UserId + " has been made an admin in group " + info.GroupId));
}

livechatapi.onGroupAdminDismissed = info => {
    console.log(writeToScreen("User  " + info.UserId + " has been dismissed as admin from group " + info.GroupId));
}

livechatapi.onUserLeftGroup = info => {
    console.log(writeToScreen("User  " + info.UserId + " has left group " + info.GroupId));
}

livechatapi.onGroupIconChanged = info => {
    console.log(writeToScreen("Group " + info.GroupId + " icon has changed (" + info.IconPath + ")"));
}

livechatapi.onServerStateChange = state => {
    console.log(writeToScreen("Server state changed to " + (state === true ? "online" : "offline")));
}