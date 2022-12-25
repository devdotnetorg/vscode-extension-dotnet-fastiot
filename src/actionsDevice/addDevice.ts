import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

import { TreeDataDevicesProvider } from '../TreeDataDevicesProvider';
import { IotResult,StatusResult } from '../IotResult';
import { pingDevice } from './pingDevice';
import { IotDevice } from '../IotDevice';
import { BaseTreeItem } from '../BaseTreeItem';
import { ItemQuickPick } from '../Helper/actionHelper';

export async function addDevice(treeData: TreeDataDevicesProvider,treeView:vscode.TreeView<BaseTreeItem>): Promise<void> {                
        
        const host = await vscode.window.showInputBox({            
            prompt: 'prompt',
            title: 'Add Device (1/5). Enter the host of the developer board',
            value:'192.168.43.208',            
        });
        
        if(host==undefined) return;

        const port = await vscode.window.showInputBox({				
            prompt: 'prompt',
            title: 'Add Device (2/5). Enter a number port ssh',
            value:'22'
        });
        if(port==undefined) return;

        const userName = await vscode.window.showInputBox({				
            prompt: 'prompt',
            title: 'Add Device (3/5). Enter username with sudo rights (usually root)',
            value:'root'
        });
        if(userName==undefined) return;

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
       treeData.OutputChannel.appendLine("----------------------------------");
       treeData.OutputChannel.appendLine("Action: adding a device");
       //Adding a device is the main process
       const result = await treeData.AddDevice(host,port,userName,password,SELECTED_ITEM.value);
       //Output       
       treeData.OutputChannel.appendLine("------------- Result -------------");
       treeData.OutputChannel.appendLine(`Status: ${result.Status.toString()}`);
       treeData.OutputChannel.appendLine(`Message: ${result.Message}`);
       treeData.OutputChannel.appendLine(`System message: ${result.SystemMessage}`);
       //Message       
       if(result.Status==StatusResult.Ok)
       {
            vscode.window.showInformationMessage('Device added successfully');
            //Set focus
            const device=<IotDevice>result.returnObject;            
            treeView.reveal(device, {focus: true});
            //Ping
            const newDevice=treeData.RootItems[treeData.RootItems.length-1];
            pingDevice(treeData,newDevice);
            
       }else
       {            
            vscode.window.showErrorMessage(`Error. Device not added! \n${result.Message}`);            
       }       
}
