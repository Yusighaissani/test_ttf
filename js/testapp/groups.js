var lastGroupListId = 0;

function AddGroupListsToUI(groupListInfo) {
    try {
        if (lastGroupListId === 0)
            $("#group-list-grid-body").empty();

        groupListInfo.GroupListInfo.forEach(element => {
            var groupNameOnClick = "ModifyGroupName('" + element.Id + "')";
            var addUserOnClick = "AddUserToGroup('" + element.Id + "')";
            var removeUserOnClick = "RemoveUserFromGroup('" + element.Id + "')";
            var deleteGroup = "livechatapi.deleteGroup('" + element.Id + "')";

            var ui = "<tr><th scope='row'><button type='button' class='btn btn-danger' style='padding: 0.5rem;' onclick=" + deleteGroup + " title='Delete Group'><span class='fas fa-minus'></span></button></th>" +
                "<td>" + element.Id + "</td>" +
                "<td>" + element.Name + "<br /><button type='button' class='btn btn-secondary' style='padding: 0.5rem;' onclick=" + groupNameOnClick + "><span class='fas fa-edit'></span></button></td>" +
                // "<td>" + JSON.stringify(element.Participants) + "</td>" +
                "<td>" + element.CreatedBy + "</td>" +
                "<td>" + element.CreatedDateTime.toString() + "</td>" +
                "<td><button type='button' class='btn btn-secondary' style='padding: 0.5rem;' onclick=" + addUserOnClick + " title='Add User(s)'><span class='fas fa-user-plus'></span></button>" +
                "<button type='button' class='btn btn-danger' style='padding: 0.5rem;' onclick=" + removeUserOnClick + " title='Remove User(s)'><span class='fas fa-user-times'></span></button></td>" +
                "</tr >";
            var htmlObject = $(ui);
            document.getElementById('group-list-grid-body').append(htmlObject[ 0 ]);
        });

        lastGroupListId = groupListInfo.LastGroupListId;
    } catch (e) {

    }
}

function AddGroupToUI(groupInfo) {
    var groupNameOnClick = "ModifyGroupName('" + groupInfo.Id + "')";
    var addUserOnClick = "AddUserToGroup('" + groupInfo.Id + "')";
    var removeUserOnClick = "RemoveUserFromGroup('" + groupInfo.Id + "')";
    var deleteGroup = "livechatapi.deleteGroup('" + element.Id + "')";

    var ui = "<tr><th scope='row'><button type='button' class='btn btn-danger' style='padding: 0.5rem;' onclick=" + deleteGroup + " title='Delete Group'><span class='fas fa-minus'></span></button></th>" +
        "<td>" + element.Id + "</td>" +
        "<td>" + element.Name + "<br /><button type='button' class='btn btn-secondary' style='padding: 0.5rem;' onclick=" + groupNameOnClick + "><span class='fas fa-edit'></span></button></td>" +
        // "<td>" + JSON.stringify(element.Participants) + "</td>" +
        "<td>" + element.CreatedBy + "</td>" +
        "<td>" + element.CreatedDateTime.toString() + "</td>" +
        "<td><button type='button' class='btn btn-secondary' style='padding: 0.5rem;' onclick=" + addUserOnClick + " title='Add User(s)'><span class='fas fa-user-plus'></span></button>" +
        "<button type='button' class='btn btn-danger' style='padding: 0.5rem;' onclick=" + removeUserOnClick + " title='Remove User(s)'><span class='fas fa-user-times'></span></button></td>" +
        "</tr >";
    var htmlObject = $(ui);
    document.getElementById('group-list-grid-body').append(htmlObject[ 0 ]);
}

function CreateNewGroup() {
    try {
        let groupName = prompt("Enter Group Name");
        if (groupName === "" || groupName === null) {
            return;
        }

        let groupParticipantList = prompt("Enter the user(s) of the group (comma seperated)");
        if (groupParticipantList === "" || groupParticipantList === null) {
            return;
        }

        groupParticipantList = groupParticipantList.split(',');

        livechatapi.createGroup(groupName, livechatapi.livechat.getUserId(), groupParticipantList, "");
    } catch (e) {

    }
}

function AddUserToGroup(groupId) {
    try {
        let groupParticipantList = prompt("Enter the user(s) to be added to the group (comma seperated)");
        if (groupParticipantList === "" || groupParticipantList === null) {
            return;
        }
        groupParticipantList = groupParticipantList.split(',');
        livechatapi.addUserToGroup(groupId, groupParticipantList);
    } catch (e) {

    }
}

function RemoveUserFromGroup(groupId) {
    try {
        let groupParticipantList = prompt("Enter the user(s) to be removed from the group (comma seperated)");
        if (groupParticipantList === "" || groupParticipantList === null) {
            return;
        }
        groupParticipantList = groupParticipantList.split(',');
        livechatapi.removeUserFromGroup(groupId, groupParticipantList);
    } catch (e) {

    }
}

function ModifyGroupName(groupId) {
    try {
        let groupName = prompt("Enter the new name of the group");
        if (groupName === "" || groupName === null) {
            return;
        }

        livechatapi.modifyGroupName(groupId, groupName);
    } catch (e) {

    }
}

function RefreshGroupList() {
    $("#group-list-grid-body").empty();
    livechatapi.getUserGroupList();
}