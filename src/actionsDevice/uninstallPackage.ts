import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

import { TreeDataLaunchsProvider } from '../TreeDataLaunchsProvider';
import { IotResult,StatusResult } from '../IotResult';
import { pingDevice } from './pingDevice';
import { IotDevice } from '../IotDevice';
import { TypePackage,IotDevicePackage } from '../IotDevicePackage';
import { TreeDataDevicesProvider } from '../TreeDataDevicesProvider';         

export async function uninstallPackage(treeData: TreeDataDevicesProvider,item:IotDevicePackage): Promise<void> {    
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
        treeData.OutputChannel.appendLine("----------------------------------");        
        treeData.OutputChannel.appendLine(`Action: package uninstallation ${item.NamePackage}`);
        //main process
        const result = await treeData.UnInstallPackage(<string>item.Device.IdDevice,item.NamePackage,jsonObj);
        //Output       
        treeData.OutputChannel.appendLine("------------- Result -------------");
        treeData.OutputChannel.appendLine(`Status: ${result.Status.toString()}`);
        treeData.OutputChannel.appendLine(`Message: ${result.Message}`);
        treeData.OutputChannel.appendLine(`System message: ${result.SystemMessage}`);
        //Message
        if(result.Status==StatusResult.Ok)
        {
            vscode.window.showInformationMessage(`${item.NamePackage} package uninstallation completed successfully.`);
        }else
        {            
            vscode.window.showErrorMessage(`Error. ${item.NamePackage} package failed to uninstall! \n${result.Message}. ${result.SystemMessage}`);            
        }	
    }    
}
