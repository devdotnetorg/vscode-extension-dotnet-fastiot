import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

import { TreeDataDevicesProvider } from '../TreeDataDevicesProvider';
import { IotResult,StatusResult } from '../Shared/IotResult';
import { IotDevice } from '../IotDevice';
import { BaseTreeItem_d } from '../shared/BaseTreeItem_d';
import { IoTHelper } from '../Helper/IoTHelper';
import { IoT } from '../Types/Enums';
import LogLevel = IoT.Enums.LogLevel;
import Dialog = IoT.Enums.Dialog;
import { IoTApplication } from '../IoTApplication';
import { AddSBCConfigType } from '../Types/AddSBCConfigType';
import { AddSBCPanelSingleton } from '../Panels/AddSBCPanelSingleton';
import { connectionTestDevice } from '../actionsDevice/connectionTestDevice';
import { AppDomain } from '../AppDomain';

export async function addSBC(treeData: TreeDataDevicesProvider,treeView:vscode.TreeView<BaseTreeItem_d>,
    dialogType:Dialog, hostName?:string, hostPort?:number): Promise<void> {
        const app = AppDomain.getInstance().CurrentApp;
        //fill hostName, hostPort
        if(!hostName) hostName= app.Config.Sbc.PreviousHostnameWhenAdding;
        if(!hostPort) hostPort= 22;
        //fill addSBCConfig
        let addSBCConfig:AddSBCConfigType| undefined ={
            host:hostName,
            port:hostPort,
            username: "root",
            filenameudevrules: app.Config.Sbc.FileNameUdevRules,
            listfilesudevrules: app.Config.Sbc.ListFilesUdevRules,
            debugusername: app.Config.Sbc.DebugUserNameAccount,
            debuggroups: app.Config.Sbc.DebugGroupsAccount,
            managementusername: app.Config.Sbc.ManagementUserNameAccount,
            managementgroups: app.Config.Sbc.ManagementGroupsAccount
        };
        //Dialog
        addSBCConfig = await showDialog (app,dialogType,addSBCConfig);
        if(!addSBCConfig) return;
        //fill after dialog
        if(!addSBCConfig.sshkeytypebits) addSBCConfig.sshkeytypebits=
            `${app.Config.Sbc.SshKeyType}-${app.Config.Sbc.SshKeyBits}`;
        if(!addSBCConfig.debuggroups) addSBCConfig.debuggroups=
            app.Config.Sbc.DebugGroupsAccount;
        if(!addSBCConfig. managementgroups) addSBCConfig.managementgroups=
            app.Config.Sbc.ManagementGroupsAccount;
        //Save PreviousHostname
        app.Config.Sbc.PreviousHostnameWhenAdding=addSBCConfig.host;
        //Info
        vscode.window.showInformationMessage('⌛ It may take 2 to 7 minutes to initialize and configure the device.');
        //Main process
        app.UI.Output("Action: adding a device");
        //Adding a device is the main process
        const labelTask="Adding a device";
        app.UI.ShowBackgroundNotification(labelTask);
        const guidBadge=app.UI.BadgeAddItem(labelTask);
        let result = await treeData.AddDevice(addSBCConfig);
        if(guidBadge) app.UI.BadgeDeleteItem(guidBadge);
        app.UI.HideBackgroundNotification();
        //Output
        app.UI.Output(result.toStringWithHead());
        //Message
        app.UI.ShowNotification(result);
        if(result.Status==StatusResult.Ok) {
            //get device
            const newDevice=<IotDevice>result.returnObject;
            //Connection test
            connectionTestDevice(treeData,newDevice, app.UI);
            //Set focus
            treeView.reveal(newDevice, {focus: true});
        }
}

async function showDialog(app:IoTApplication, dialogType:Dialog, addSBCConfig?:AddSBCConfigType): Promise<AddSBCConfigType| undefined> {
    switch(dialogType) {
        case Dialog.standard: {
            //vscode.window.showInputBox
            //close webView
            let addSBCPanel = AddSBCPanelSingleton.getInstance();
            if (addSBCPanel.IsActive) addSBCPanel.Dispose();
            addSBCConfig=await showDialogStandard(addSBCConfig);
            break; 
        } 
        case Dialog.webview: { 
            //webView
            addSBCConfig=await showDialogWebview(app, addSBCConfig);
            break; 
        }
        default: { 
            addSBCConfig=undefined;
            break; 
        } 
    }
    //result
    return Promise.resolve(addSBCConfig);
}

async function showDialogStandard(addSBCConfig?:AddSBCConfigType): Promise<AddSBCConfigType| undefined>  {
    if(!addSBCConfig) return Promise.resolve(undefined);
    const title = "Add single-board computer";
    //1. hostName
    let hostName = await vscode.window.showInputBox({
        prompt: 'Enter the hostname of the single-board computer',
        title: `${title} (1/4)`,
        value: addSBCConfig.host
    });
    if(!hostName) return Promise.resolve(undefined);
    hostName=IoTHelper.StringTrim(hostName);
    //2. port
    let portAnswer = await vscode.window.showInputBox({
        prompt: 'Enter a number port ssh',
        title: `${title} (2/4)`,
        value: addSBCConfig.port.toString()
    });
    if(!portAnswer) return Promise.resolve(undefined);
    portAnswer = IoTHelper.StringTrim(portAnswer);
    const port=+portAnswer;
    //3. userName
    let userName = await vscode.window.showInputBox({
        prompt: 'Enter username with sudo rights (usually root)',
        title: `${title} (3/4)`,
        value:'root'
    });
    if(!userName) return;
    userName=IoTHelper.StringTrim(userName);
    //4. password
    const password = await vscode.window.showInputBox({
        placeHolder: `${title} (4/4). Enter user password ${userName}`,
        password: true
    });
    if(!password) return Promise.resolve(undefined);
    //fill addSBCConfig
    addSBCConfig.host = hostName;
    addSBCConfig.port = port;
    addSBCConfig.username = userName;
    addSBCConfig.password = password;
    //result
    return Promise.resolve(addSBCConfig);
}

async function showDialogWebview(app:IoTApplication, addSBCConfig?:AddSBCConfigType): Promise<AddSBCConfigType| undefined>  {
    //webView
    let addSBCPanel = AddSBCPanelSingleton.getInstance();
    let result =
        await addSBCPanel.Activate(
            "addSBCView","Add single-board computer",
            app.Config.Folder.Extension,app.Config.Extension.Subscriptions,addSBCConfig);
    if(result.Status!=StatusResult.Ok) {
        //Output
        app.UI.Output(result);
        //Message
        app.UI.ShowNotification(result);
        return Promise.resolve(undefined);
    }
    addSBCConfig= await addSBCPanel.GetAnswer();
    //result
    return Promise.resolve(addSBCConfig);
}
