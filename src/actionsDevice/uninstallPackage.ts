import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

import { IotResult,StatusResult } from '../IotResult';
import { TypePackage,IotDevicePackage } from '../IotDevicePackage';
import { TreeDataDevicesProvider } from '../TreeDataDevicesProvider';         
import {IContexUI} from '../ui/IContexUI';

export async function uninstallPackage(treeData: TreeDataDevicesProvider,item:IotDevicePackage,contextUI:IContexUI): Promise<void> {    
    const answer = await vscode.window.showInformationMessage(`Do you really want to remove the package: 
    ${item.NamePackage}?`, ...["Yes", "No"]);
    if(answer=="Yes")
    {
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
                //formation jsonObj            
                jsonObj.installpath="/usr/share/dotnet";
                break; 
            }
            case TypePackage.dotnetruntimes: {            
                //formation jsonObj            
                jsonObj.installpath="/usr/share/dotnet";
                break; 
            }
            case TypePackage.debugger: {             
                //formation jsonObj
                jsonObj.installpath="/usr/share/vsdbg";
                break; 
            }
            case TypePackage.libgpiod: {              
                //formation jsonObj
                break; 
            }
            case TypePackage.docker: {            
                //formation jsonObj
                //None
                break; 
            }      
            default: { 
                break; 
            } 
        }
        //main process 
        contextUI.Output(`Action: package uninstallation ${item.NamePackage}`);
        const labelTask=`Package uninstallation ${item.NamePackage}`;
        contextUI.ShowBackgroundNotification(labelTask);
        const guidBadge=contextUI.BadgeAddItem(labelTask);
        const result = await treeData.UnInstallPackage(<string>item.Device.IdDevice,item.NamePackage,jsonObj);
        if(guidBadge) contextUI.BadgeDeleteItem(guidBadge);
        contextUI.HideBackgroundNotification();
        //Output       
        contextUI.Output(result.toStringWithHead());
        //Message
        if(result.Status==StatusResult.Ok) {
            vscode.window.showInformationMessage(`${item.NamePackage} package uninstallation completed successfully.`);
        } else {            
            vscode.window.showErrorMessage(`Error. ${item.NamePackage} package failed to uninstall! \n${result.Message}. ${result.SystemMessage}`);            
        }
    }
}
