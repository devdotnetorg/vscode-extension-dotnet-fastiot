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
import { ISbc } from '../Sbc/ISbc';
import { IoTSbc } from '../Sbc/IoTSbc';
import { AppDomain } from '../AppDomain';
import { ISshConnection } from '../Shared/ISshConnection';
import { SshConnection } from '../Shared/SshConnection';

export async function addSBC(treeData: TreeDataDevicesProvider,treeView:vscode.TreeView<BaseTreeItem_d>,
    dialogType:Dialog, host?:string, port?:number): Promise<void> {
        const app = AppDomain.getInstance().CurrentApp;
        //fill host, port
        if(!host) host= app.Config.Sbc.PreviousHostWhenAdding;
        if(!port) port= 22;
        //fill addSBCConfig
        let addSBCConfig:AddSBCConfigType| undefined ={
            host:host,
            port:port,
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
        //Save PreviousHost
        app.Config.Sbc.PreviousHostWhenAdding=addSBCConfig.host;
        //Info
        vscode.window.showInformationMessage('⌛ It may take 2 to 7 minutes to initialize and configure the SBC.');
        //Main process
        const labelTask="create a SBC profile";
        app.UI.Output(`Action: ${labelTask}`);
        const guidBadge=app.UI.BadgeAddItem(labelTask);
        let sbc:ISbc = new IoTSbc();
        //progress
        let result:IotResult| undefined = await vscode.window.withProgress({
            location: vscode.ProgressLocation.Window,
            title: IoTHelper.FirstLetter(labelTask),
            cancellable: true
        }, (progress, token) => {
            token.onCancellationRequested(() => {
                vscode.window.showWarningMessage(`${IoTHelper.FirstLetter(labelTask)}: cancel operation requested. Wait for the operation to stop.`);
            });
            return new Promise(async (resolve, reject) => {
                //event subscription
                let handler=sbc.OnChangedStateSubscribe(event => {
                    //Progress
                    if(event.status)
                        progress.report({ message: event.status });
                    //output
                    if(event.message) {
                        if(event.logLevel) app.UI.Output(event.message,event.logLevel);
                            else app.UI.Output(event.message);
                    }
                });
                if(!addSBCConfig) {
                    resolve(undefined);
                    return;
                }
                //Checking the network connection
                progress.report({ message: "checking the network connection" });
                let sshConnection:ISshConnection = new SshConnection();
                sshConnection.fromLoginPass(
                    addSBCConfig.host, addSBCConfig.port,
                    addSBCConfig.username, addSBCConfig.password ?? "None");
                let resultConTest = await sshConnection.ConnectionTest();
                let forceMode=false;
                if(resultConTest.Status!=StatusResult.Ok) {
                    // Force mode
                    const answer = await vscode.window.showWarningMessage(
                        `Failed to connect. Enable force add mode?`, ...["Yes", "No"]);
                    if(answer=="Yes") {
                        forceMode=true;
                    } else {
                        resolve(resultConTest);
                        return;
                    }
                }
                app.UI.Output(resultConTest);
                //run
                let result = await sbc.Create(addSBCConfig,token,forceMode);
                //event unsubscription    
                sbc.OnChangedStateUnsubscribe(handler);
                resolve(result);
                //end
            });
        });
        if(!result) return;
        if(guidBadge) app.UI.BadgeDeleteItem(guidBadge);
        //Output
        app.UI.Output(result.toStringWithHead());
        //Message
        app.UI.ShowNotification(result);
        if(result.Status==StatusResult.Ok) {
            //add in collection
            result=app.SBCs.Add(sbc);
            if(result.Status==StatusResult.Ok) {
                //save
                app.SBCs.Save();
                //Connection test
                //connectionTestDevice(treeData,newDevice, app.UI);
                //Set focus
                //treeView.reveal(newDevice, {focus: true});
            }else {
                app.UI.Output(result);
            }  
          
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
    //1. host
    let host = await vscode.window.showInputBox({
        prompt: 'Enter the host of the single-board computer',
        title: `${title} (1/4)`,
        value: addSBCConfig.host
    });
    if(!host) return Promise.resolve(undefined);
    host=IoTHelper.StringTrim(host);
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
    addSBCConfig.host = host;
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
