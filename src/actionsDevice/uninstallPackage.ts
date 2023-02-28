import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

import { IotResult,StatusResult } from '../IotResult';
import { TypePackage,IotDevicePackage } from '../IotDevicePackage';
import { TreeDataDevicesProvider } from '../TreeDataDevicesProvider';         
import {IoTUI} from '../ui/IoTUI';

export async function uninstallPackage(treeData: TreeDataDevicesProvider,item:IotDevicePackage,contextUI:IoTUI): Promise<void> {    
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
                jsonObj.installpath="/usr/share/libgpiod";
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
        contextUI.StatusBarBackground.showAnimation(`Package uninstallation ${item.NamePackage}`);
        const result = await treeData.UnInstallPackage(<string>item.Device.IdDevice,item.NamePackage,jsonObj);
        contextUI.StatusBarBackground.hide();
        //Output       
        contextUI.Output(result.toMultiLineString("head"));
        //Message
        if(result.Status==StatusResult.Ok) {
            vscode.window.showInformationMessage(`${item.NamePackage} package uninstallation completed successfully.`);
        } else {            
            vscode.window.showErrorMessage(`Error. ${item.NamePackage} package failed to uninstall! \n${result.Message}. ${result.SystemMessage}`);            
        }
    }
}
