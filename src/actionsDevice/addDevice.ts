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
import {IContexUI} from '../ui/IContexUI';

export async function addDevice(treeData: TreeDataDevicesProvider,treeView:vscode.TreeView<BaseTreeItem>,contextUI:IContexUI): Promise<void> {                
        
        let hostName = await vscode.window.showInputBox({            
            prompt: 'prompt',
            title: 'Add Device (1/5). Enter the host of the developer board',
            value:'192.168.50.75',            
        });
        
        if(hostName==undefined) return;
        hostName=IoTHelper.StringTrim(hostName);

        let portAnswer = await vscode.window.showInputBox({				
            prompt: 'prompt',
            title: 'Add Device (2/5). Enter a number port ssh',
            value:'22'
        });
        if(portAnswer==undefined) return;
        portAnswer=IoTHelper.StringTrim(portAnswer);
        const port=+portAnswer;
        let userName = await vscode.window.showInputBox({				
            prompt: 'prompt',
            title: 'Add Device (3/5). Enter username with sudo rights (usually root)',
            value:'root'
        });
        if(userName==undefined) return;
        userName=IoTHelper.StringTrim(userName);

        const password = await vscode.window.showInputBox({
            placeHolder: `Add Device (4/5). Enter user password ${userName}`,
            password: true
       });
       if(password==undefined) return;

       //select account: debugvscode or root 
       let itemAccounts:Array<ItemQuickPick>=[];     
       let item = new ItemQuickPick(treeData.Config.UsernameAccountDevice,"(default)",treeData.Config.UsernameAccountDevice);
       itemAccounts.push(item);
       item = new ItemQuickPick("root","Select if you have problems accessing /dev/* and /sys/* devices","root");
       itemAccounts.push(item);
       const SELECTED_ITEM = await vscode.window.showQuickPick
        (itemAccounts,{title: 'Add Device (5/5). Select an account to debugging .NET applications:',});
       if(!SELECTED_ITEM) return;       
       //Info
       vscode.window.showInformationMessage('It may take 2 to 7 minutes to initialize and configure the device.');
       contextUI.Output("Action: adding a device");
       //Adding a device is the main process
       contextUI.ShowBackgroundNotification("Adding a device");
       const result = await treeData.AddDevice(hostName,port,userName,password,SELECTED_ITEM.value);
       contextUI.HideBackgroundNotification();
       //Output       
       contextUI.Output(result.toMultiLineString("head"));
       //Message       
       if(result.Status==StatusResult.Ok)
       {
            vscode.window.showInformationMessage('Device added successfully');
            //Set focus
            const device=<IotDevice>result.returnObject;            
            treeView.reveal(device, {focus: true});
            //Connection test
            const newDevice=treeData.RootItems[treeData.RootItems.length-1];
            connectionTestDevice(treeData,newDevice,contextUI);
       }else
       {            
            vscode.window.showErrorMessage(`Error. Device not added! \n${result.Message}`);
       }       
}
