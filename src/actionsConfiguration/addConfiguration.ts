import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

import { TreeDataLaunchsProvider } from '../TreeDataLaunchsProvider';
import { IotResult,StatusResult } from '../IotResult';
import {IoTHelper} from '../Helper/IoTHelper';
import { IotDevice } from '../IotDevice';
import { IotLaunchProject } from '../IotLaunchProject';
import { ItemQuickPick } from '../Helper/actionHelper';

export async function addConfiguration(treeData:TreeDataLaunchsProvider,devices:Array<IotDevice>): Promise<void> {                
		//Workspace		
		const workspaceDirectory = IoTHelper.GetWorkspaceFolder();
        if(!workspaceDirectory) {
            vscode.window.showErrorMessage(`Error. No Workspace. Open the menu: File -> Open Folder ...`);
            return;
        }
        //Devices
        if(devices.length==0) {
            vscode.window.showErrorMessage(`Error. No available devices. Add device`);
            return;
        }  
        //Find projects
        const launchProject = new IotLaunchProject();
        const projects=launchProject.FindProjects(workspaceDirectory);
        if (projects.length==0)
        {
            vscode.window.showErrorMessage(`Error. There are no projects in the folder: ${workspaceDirectory}`);
            return;
        }
        //Select Project
        let selectProject:string;       
        //Shows a selection list allowing multiple selections.
        let itemProjects:Array<ItemQuickPick>=[];
        //Select Project
        projects.forEach((fileName) => {
            const label=fileName.substring(workspaceDirectory.length);
            const item = new ItemQuickPick(label,"Visual Studio C# Project",fileName);
            itemProjects.push(item);
        });
        let SELECTED_ITEM = await vscode.window.showQuickPick(itemProjects,{title: 'Choose a project:',});
        if(!SELECTED_ITEM) return;
        selectProject=SELECTED_ITEM.value;        
        //Select Device
        let itemDevices:Array<ItemQuickPick>=[];
        devices.forEach((device) => {                        
            const item = new ItemQuickPick(<string>device.label,
                `${device.Information.BoardName} ${device.Information.Architecture}`,device);            
            itemDevices.push(item);
        });
        SELECTED_ITEM = await vscode.window.showQuickPick(itemDevices,{title: 'Choose a device:',});
		if(!SELECTED_ITEM) return;        
        //Adding a configuration is the main process
        const result = await treeData.AddConfiguration(workspaceDirectory,selectProject,<IotDevice>SELECTED_ITEM.value);
        console.log(`result = ${result.Message} sysMsg=${result.SystemMessage}`);
        if(result.Status==StatusResult.Ok)
        {
            vscode.window.showInformationMessage('Configuration added successfully');
        }else
        {            
            vscode.window.showErrorMessage(`Error. Configuration not added! \n${result.Message}. ${result.SystemMessage}`);            
        }		
}

