import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

import { TreeDataDevicesProvider } from '../TreeDataDevicesProvider';
import { IotResult,StatusResult } from '../IotResult';
import { IotDevice } from '../IotDevice';
import { BaseTreeItem } from '../shared/BaseTreeItem';
import { ItemQuickPick } from '../Helper/actionHelper';
import { IoTHelper } from '../Helper/IoTHelper';
import { DialogEnum } from '../Types/DialogEnum';
import { IoTApplication } from '../IoTApplication';
import { AddSBCConfigType } from '../Types/AddSBCConfigType';
import { AddSBCPanelSingleton } from '../Panels/AddSBCPanelSingleton';
import { connectionTestDevice } from '../actionsDevice/connectionTestDevice';

export async function addSBC(treeData: TreeDataDevicesProvider,treeView:vscode.TreeView<BaseTreeItem>,app:IoTApplication,
    dialogType:DialogEnum, nameHost?:string,portHost?:number): Promise<void> {
        //fill nameHost, portHost
        if(!nameHost) nameHost= app.Config.Sbc.PreviousHostname;
        if(!portHost) portHost= 22;
        //fill addSBCConfig
        let addSBCConfig:AddSBCConfigType| undefined ={
            host:nameHost,
            port:portHost,
            username: "root",
            filenameudevrules: app.Config.Sbc.FileNameUdevRules,
            listUdevRulesFiles: app.Config.Sbc.ListUdevRulesFiles,
            debugusername: app.Config.Sbc.UsernameDebugAccount,
            debuggroups: app.Config.Sbc.GroupsDebugAccount,
            managementusername: app.Config.Sbc.UsernameManagementAccount,
            managementgroups: app.Config.Sbc.GroupsManagementAccount
        };
        //Dialog
        addSBCConfig = await showDialog (app,dialogType,addSBCConfig);
        if(!addSBCConfig) return;
        //fill after dialog
        if(!addSBCConfig.sshkeytype) addSBCConfig.sshkeytype=
            `${app.Config.Sbc.TypeKeySsh}-${app.Config.Sbc.BitsKeySsh}`;
        if(!addSBCConfig.debuggroups) addSBCConfig.debuggroups=
            app.Config.Sbc.GroupsDebugAccount;
        if(!addSBCConfig. managementgroups) addSBCConfig.managementgroups=
            app.Config.Sbc.GroupsManagementAccount;
        //Save PreviousHostname
        app.Config.Sbc.PreviousHostname=addSBCConfig.host;
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

async function showDialog(app:IoTApplication, dialogType:DialogEnum, addSBCConfig?:AddSBCConfigType): Promise<AddSBCConfigType| undefined> {
    switch(dialogType) {
        case DialogEnum.standard: {
            //vscode.window.showInputBox
            addSBCConfig=await showDialogStandard(app, addSBCConfig);
            break; 
        } 
        case DialogEnum.exwebview: { 
            //webView
            addSBCConfig=await showDialogExWebview(app, addSBCConfig);
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

async function showDialogStandard(app:IoTApplication, addSBCConfig?:AddSBCConfigType): Promise<AddSBCConfigType| undefined>  {
    if(!addSBCConfig) return Promise.resolve(undefined);
    const title = "Add development board";
    //1. hostName
    let hostName = await vscode.window.showInputBox({
        prompt: 'Enter the hostname of the development board',
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

async function showDialogExWebview(app:IoTApplication, addSBCConfig?:AddSBCConfigType): Promise<AddSBCConfigType| undefined>  {
    //webView
    let addSBCPanel = AddSBCPanelSingleton.getInstance();
    let result =
        await addSBCPanel.Activate(
            "addSBCView","Add development board",
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
