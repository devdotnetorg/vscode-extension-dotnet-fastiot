import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

import { TreeDataDevicesProvider } from '../TreeDataDevicesProvider';
import { IotResult,StatusResult } from '../IotResult';
import { connectionTestDevice } from './connectionTestDevice';
import { IotDevice } from '../IotDevice';
import { BaseTreeItem } from '../BaseTreeItem';
import { ItemQuickPick } from '../Helper/actionHelper';
import { IoTHelper } from '../Helper/IoTHelper';
import { IoTApplication } from '../IoTApplication';

export async function addDevice(treeData: TreeDataDevicesProvider,treeView:vscode.TreeView<BaseTreeItem>,app:IoTApplication): Promise<void> {
    
    let hostName = await vscode.window.showInputBox({
        prompt: 'Enter the hostname of the developer board',
        title: 'Add Device (1/5)',
        value:'192.168.50.75'
    });
    if(!hostName) return;
    hostName=IoTHelper.StringTrim(hostName);
    let portAnswer = await vscode.window.showInputBox({
        prompt: 'Enter a number port ssh',
        title: 'Add Device (2/5)',
        value:'22'
    });
    if(!portAnswer) return;
    portAnswer=IoTHelper.StringTrim(portAnswer);
    const port=+portAnswer;
    let userName = await vscode.window.showInputBox({
        prompt: 'Enter username with sudo rights (usually root)',
        title: 'Add Device (3/5)',
        value:'root'
    });
    if(!userName) return;
    userName=IoTHelper.StringTrim(userName);
    const password = await vscode.window.showInputBox({
        placeHolder: `Add Device (4/5). Enter user password ${userName}`,
        password: true
    });
    if(!password) return;
    //select account: debugvscode or root
    let itemAccounts:Array<ItemQuickPick>=[];
    let item = new ItemQuickPick(app.Config.UsernameAccountDevice,"(default)", app.Config.UsernameAccountDevice);
    itemAccounts.push(item);
    item = new ItemQuickPick("root","Select if you have problems accessing /dev/* and /sys/* devices","root");
    itemAccounts.push(item);
    const SELECTED_ITEM = await vscode.window.showQuickPick(
        itemAccounts,{title: 'Add Device (5/5)',placeHolder:`Select an account to debugging .NET applications`});
    if(!SELECTED_ITEM) return;
    const accountNameDebug=SELECTED_ITEM.value;
    //Info
    vscode.window.showInformationMessage('⌛ It may take 2 to 7 minutes to initialize and configure the device.');
    //Main process
    app.UI.Output("Action: adding a device");
    //Adding a device is the main process
    app.UI.ShowBackgroundNotification("Adding a device");
    const result = await treeData.AddDevice(hostName,port,userName,password,accountNameDebug);
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
