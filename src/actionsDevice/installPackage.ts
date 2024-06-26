import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

import { IotResult,StatusResult } from '../IotResult';
import { dotnetHelper } from '../Helper/dotnetHelper';
import { TypePackage,IotDevicePackage } from '../IotDevicePackage';
import { TreeDataDevicesProvider } from '../TreeDataDevicesProvider';
import { ItemQuickPick } from '../Helper/actionHelper';
import {IContexUI} from '../ui/IContexUI';

// async InstallPackage(idDevice:string,itemPackage:typePackage,objJSON:any): Promise<IotResult> {            

export async function installPackage(treeData: TreeDataDevicesProvider,item:IotDevicePackage,contextUI:IContexUI): Promise<void> {
    //catalogs
    //const catalogNetSDKChannel: Array<string>=["3.1","5.0","6.0","7.0"];
    //const catalogNetRuntimeChannel: Array<string>=["3.1","5.0","6.0","7.0"];
    const catalogNetRuntimeName: Array<string>=["dotnet","aspnetcore"];
    type typeLibgpiodVersion ={
        version:string,
        description:string
    }
    const catalogLibgpiodVersion: Array<typeLibgpiodVersion>=[
        { version:"2.1.1", description:"Libgpiod"},
        { version:"2.1", description:"Libgpiod"},
        { version:"2.0.2", description:"Libgpiod"},
        { version:"2.0", description:"Libgpiod"},   
        { version:"1.6.4", description:"Maximum version for .NET application"},
        { version:"1.6.3", description:"Libgpiod"}
    ];
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
            dotnetHelper.GetDotNetTargets().forEach((value, key) => {
                const item = new ItemQuickPick(value[1],"",key);
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
            dotnetHelper.GetDotNetTargets().forEach((value, key) => {
                const item = new ItemQuickPick(value[1],"",key);
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
            //installation type
            //binary - installation from binaries;
            let item = new ItemQuickPick('Installation from binaries','(recommended)','binary');
            itemLibgpiodTasks.push(item);
            //findver - find out the version in the repository;
            item = new ItemQuickPick('Check the version in the repository','Latest version 2.1.1','findver');
            itemLibgpiodTasks.push(item);
            //repo - installation from the repository.
            item = new ItemQuickPick('Installation from repository','Old version','repo');
            itemLibgpiodTasks.push(item);
            //source - installation from source;
            item = new ItemQuickPick('Install from source','take a long time','source');
            itemLibgpiodTasks.push(item);
            //Selecting an installation option
            let SELECTED_ITEM = await vscode.window.showQuickPick(itemLibgpiodTasks,{title: 'Choose the type of Libgpiod library installation:'});
            if(!SELECTED_ITEM) return;
            let optionType:string = SELECTED_ITEM.value;
            //Select version
            if(optionType=="binary"||optionType=="source") {
                //catalogLibgpiodVersion
                let itemLibgpiodVersion:Array<ItemQuickPick>=[];
                //Select Libgpiod version
                catalogLibgpiodVersion.forEach((itemLibgpiod) => {
                    const item = new ItemQuickPick(itemLibgpiod.version,itemLibgpiod.description,itemLibgpiod.version);
                    itemLibgpiodVersion.push(item);
                });
                SELECTED_ITEM = await vscode.window.showQuickPick(itemLibgpiodVersion,{title: 'Choose a Libgpiod version:',});
                if(!SELECTED_ITEM) return;
            }
            let optionVersion:string = SELECTED_ITEM.value;
            //parameter design
            switch(optionType) { 
                case "binary": {
                    jsonObj.version= `--type ${optionType} --version ${optionVersion} --canselect no`;
                    break;
                }
                case "source": {
                    jsonObj.version= `--type ${optionType} --version ${optionVersion}`;
                    break;
                }
                default: {
                    jsonObj.version= `--type ${optionType}`;
                    break;
                }
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
    //main process
    contextUI.Output(`Action: package installation/upgrade ${item.NamePackage}`);
    const labelTask=`Package installation/upgrade ${item.NamePackage}`;
    contextUI.ShowBackgroundNotification(labelTask);
    const guidBadge=contextUI.BadgeAddItem(labelTask);
    const result = await treeData.InstallPackage(<string>item.Device.IdDevice,item.NamePackage,jsonObj);
    if(guidBadge) contextUI.BadgeDeleteItem(guidBadge);
    contextUI.HideBackgroundNotification();
    //Output       
    contextUI.Output(result.toStringWithHead());
    //Message        
    if(result.Status==StatusResult.Ok) {
        vscode.window.showInformationMessage(`${item.NamePackage} package installation/upgrade completed successfully.`);
    } else {      
        vscode.window.showErrorMessage(`Error. ${item.NamePackage} package failed to install/upgrade! \n${result.Message}. ${result.SystemMessage}`);
    }
}
