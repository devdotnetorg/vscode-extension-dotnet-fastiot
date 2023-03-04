import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

import { TreeDataLaunchsProvider } from '../TreeDataLaunchsProvider';
import { IotResult,StatusResult } from '../IotResult';
import { LaunchEnvironmentNode } from '../LaunchEnvironmentNode';
import { IoTHelper } from '../Helper/IoTHelper';

export async function addEnviroment(treeData: TreeDataLaunchsProvider,item:LaunchEnvironmentNode):
    Promise<void> {
        let launch=treeData.FindbyIdLaunchInTree(item.Launch.IdLaunch);
        if(launch)
        {
            //name
            let nameEnviroment = await vscode.window.showInputBox({				
                prompt: 'prompt',
                title: 'Enter enviroment name',
                value:'FASTIOT'
            });
            if(nameEnviroment==undefined) return;
            nameEnviroment=IoTHelper.StringTrim(nameEnviroment);
            if(nameEnviroment==""){
                vscode.window.showErrorMessage(`Error. Empty name specified`);
                return;
            }
            //value
            let valueEnviroment = await vscode.window.showInputBox({				
                prompt: 'prompt',
                title: `Enter the value of the enviroment: ${nameEnviroment}`,
                value:'easy'
            });
            if(valueEnviroment==undefined) return;
            valueEnviroment=IoTHelper.StringTrim(valueEnviroment);
            if(valueEnviroment==""){
                vscode.window.showErrorMessage(`Error. Empty name specified`);
                return;
            }
            //
            launch.Environments.Add(nameEnviroment,valueEnviroment);
            launch.Environments.Write();
            treeData.Refresh();
            vscode.window.showInformationMessage('Enviroment added successfully');
        } 
}

export async function renameEnviroment(treeData: TreeDataLaunchsProvider,item:LaunchEnvironmentNode):
    Promise<void> {
        //name
        let newName = await vscode.window.showInputBox({				
            prompt: 'prompt',
            title: 'Enter enviroment name',
            value:`${item.label}`
        });
        if(newName==undefined) return;
        newName=IoTHelper.StringTrim(newName);
        if(newName==""){
            vscode.window.showErrorMessage(`Error. Empty name specified`);
            return;
        }
        //
        let launch=treeData.FindbyIdLaunchInTree(item.Launch.IdLaunch);
        if(launch){
            launch.Environments.Remove(<string>item.label);
            launch.Environments.Add(newName,<string>item.description);
            launch.Environments.Write();
            treeData.Refresh();
        }
}

export async function editEnviroment(treeData: TreeDataLaunchsProvider,item:LaunchEnvironmentNode):
    Promise<void> {
        //value
        let newValue = await vscode.window.showInputBox({				
            prompt: 'prompt',
            title: `Enter the value of the enviroment: ${item.label}`,
            value:`${item.description}`
        });
        if(newValue==undefined) return;
        newValue=IoTHelper.StringTrim(newValue);
        if(newValue==""){
            vscode.window.showErrorMessage(`Error. Empty name specified`);
            return;
        }
        //
        let launch=treeData.FindbyIdLaunchInTree(item.Launch.IdLaunch);
        if(launch){
            launch.Environments.Edit(<string>item.label,newValue);
            launch.Environments.Write();           
            treeData.Refresh();
        }        
}

export async function deleteEnviroment(treeData: TreeDataLaunchsProvider,item:LaunchEnvironmentNode):
    Promise<void> {
        let launch=treeData.FindbyIdLaunchInTree(item.Launch.IdLaunch);
        if(launch){
            launch.Environments.Remove(<string>item.label);
            launch.Environments.Write();           
            treeData.Refresh();
        }                
}
