import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

import { TreeDataLaunchsProvider } from '../TreeDataLaunchsProvider';
import { IotResult,StatusResult } from '../IotResult';
import { pingDevice } from './pingDevice';
import { dotnetHelper } from '../Helper/dotnetHelper';
import { IotDevice } from '../IotDevice';
import { IotLaunchProject } from '../IotLaunchProject';
import { TypePackage,IotDevicePackage } from '../IotDevicePackage';
import { TreeDataDevicesProvider } from '../TreeDataDevicesProvider';
import { ItemQuickPick } from '../Helper/actionHelper';

// async InstallPackage(idDevice:string,itemPackage:typePackage,objJSON:any): Promise<IotResult> {            

export async function installPackage(treeData: TreeDataDevicesProvider,item:IotDevicePackage): Promise<void> {
    //catalogs
    const catalogNetSDKChannel: Array<string>=["3.1","5.0","6.0","7.0"];
    const catalogNetRuntimeChannel: Array<string>=["3.1","5.0","6.0","7.0"];
    const catalogNetRuntimeName: Array<string>=["dotnet","aspnetcore"];
    const catalogLibgpiodVersion: Array<string>=["1.6.3"];
    //objJSON: preparation of input parameters    
    let jsonObj = {
        dotnetrid:"",
        installpath:"",
        username:"",
        name:"",
        version:""        
    };
    //parameters    
    switch(item.NamePackage) { 
        case TypePackage.dotnetsdk: {
            //Shows a selection list allowing multiple selections.
            let itemNetSDK:Array<ItemQuickPick>=[];
            //Select SDK
            catalogNetSDKChannel.forEach((nameItem) => {
                const item = new ItemQuickPick(nameItem,".NET SDK",nameItem);
                itemNetSDK.push(item);
            });
            let SELECTED_ITEM = await vscode.window.showQuickPick(itemNetSDK,{title: 'Choose a .NET SDK version:',});
            if(!SELECTED_ITEM) return;
            //formation jsonObj
            jsonObj.version=SELECTED_ITEM.value;  
            jsonObj.installpath="/usr/share/dotnet";
            break; 
        }
        case TypePackage.dotnetruntimes: {
            //Shows a selection list allowing multiple selections.
            let itemNetRuntimeName:Array<ItemQuickPick>=[];
            //Select Runtime name
            catalogNetRuntimeName.forEach((nameItem) => {
                const item = new ItemQuickPick(nameItem,".NET Runtime",nameItem);
                itemNetRuntimeName.push(item);
            });
            let SELECTED_ITEM = await vscode.window.showQuickPick(itemNetRuntimeName,{title: 'Choose a shared runtime:',});
            if(!SELECTED_ITEM) return;
            //formation jsonObj
            jsonObj.name=SELECTED_ITEM.value;
            //Shows a selection list allowing multiple selections.
            let itemNetRuntimeVersion:Array<ItemQuickPick>=[];
            //Select Runtime version
            catalogNetRuntimeChannel.forEach((nameItem) => {
                const item = new ItemQuickPick(nameItem,".NET Runtime",nameItem);
                itemNetRuntimeVersion.push(item);
            });
            SELECTED_ITEM = await vscode.window.showQuickPick(itemNetRuntimeVersion,{title: 'Choose a .NET Runtime version:',});
            if(!SELECTED_ITEM) return;
            //formation jsonObj
            jsonObj.version=SELECTED_ITEM.value;
            jsonObj.installpath="/usr/share/dotnet";
            break; 
        }
        case TypePackage.debugger: { 
            const dotnetRID=dotnetHelper.GetDotNetRID(
                    <string>item.Device.Information.OsName,<string>item.Device.Information.Architecture);
            //formation jsonObj
            jsonObj.dotnetrid=dotnetRID;
            jsonObj.installpath="/usr/share/vsdbg";
            break; 
        }
        case TypePackage.libgpiod: { 
             //Shows a selection list allowing multiple selections.
             //Select task
             let itemLibgpiodTasks:Array<ItemQuickPick>=[];
             let item = new ItemQuickPick('Check the version of Libgpiod in the repository','Latest version 1.6.3','checkinrepository');
             itemLibgpiodTasks.push(item);
             item = new ItemQuickPick('Install Libgpiod from repository','(recommended)','installfromrepository');
             itemLibgpiodTasks.push(item);
             item = new ItemQuickPick('Install Libgpiod from source','take a long time','installfromsource');
             itemLibgpiodTasks.push(item);
             let SELECTED_ITEM = await vscode.window.showQuickPick(itemLibgpiodTasks,{title: 'Choose a task:'});
             if(!SELECTED_ITEM) return;
             //             
             if(SELECTED_ITEM.value=='installfromsource')
             {
                //catalogLibgpiodVersion
                let itemLibgpiodVersion:Array<ItemQuickPick>=[];
                //Select version
                catalogLibgpiodVersion.forEach((nameItem) => {
                    const item = new ItemQuickPick(nameItem,"Libgpiod",nameItem);
                    itemLibgpiodVersion.push(item);
                });
                SELECTED_ITEM = await vscode.window.showQuickPick(itemLibgpiodVersion,{title: 'Choose a Libgpiod version:',});
                if(!SELECTED_ITEM) return;
                //formation jsonObj
                jsonObj.version=SELECTED_ITEM.value;  
                jsonObj.installpath="/usr/share/libgpiod";
             }else
             {
                jsonObj.version=SELECTED_ITEM.value;
             }
            break; 
        }
        case TypePackage.docker: {
            const username=<string>item.Device.Account.UserName;
            //formation jsonObj
            jsonObj.username=username;            
            break; 
        }      
        default: { 
            break; 
        } 
    }    
    //Info
    vscode.window.showInformationMessage('Package installation/upgrade may take 2 to 7 minutes.');
    treeData.OutputChannel.appendLine("----------------------------------");
    treeData.OutputChannel.appendLine(`Action: package installation ${item.NamePackage}`);
    //main process
    const result = await treeData.InstallPackage(<string>item.Device.IdDevice,item.NamePackage,jsonObj);
    //Output       
    treeData.OutputChannel.appendLine("------------- Result -------------");
    treeData.OutputChannel.appendLine(`Status: ${result.Status.toString()}`);
    treeData.OutputChannel.appendLine(`Message: ${result.Message}`);
    treeData.OutputChannel.appendLine(`System message: ${result.SystemMessage}`);
    //Message        
    if(result.Status==StatusResult.Ok)
    {
        vscode.window.showInformationMessage(`${item.NamePackage} package installation/upgrade completed successfully.`);
    }else
    {            
        vscode.window.showErrorMessage(`Error. ${item.NamePackage} package failed to install/upgrade! \n${result.Message}. ${result.SystemMessage}`);
    }	
}
