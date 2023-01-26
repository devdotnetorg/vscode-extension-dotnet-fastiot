import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

import { TreeDataLaunchsProvider } from '../TreeDataLaunchsProvider';
import { IotResult,StatusResult } from '../IotResult';
import { IotDevice } from '../IotDevice';
import { IotLaunch } from '../IotLaunch';
import { IotLaunchEnvironment } from '../IotLaunchEnvironment';

export async function addEnviroment(treeData: TreeDataLaunchsProvider,item:IotLaunchEnvironment):
    Promise<void> {
        let configuration=treeData.FindbyIdLaunch(item.Launch.IdLaunch);
        if(configuration)
        {
            //name
            const nameEnviroment = await vscode.window.showInputBox({				
                prompt: 'prompt',
                title: 'Enter enviroment name',
                value:'FASTIOT'
            });
            if(nameEnviroment==undefined) return;
            //value
            const valueEnviroment = await vscode.window.showInputBox({				
                prompt: 'prompt',
                title: `Enter the value of the enviroment: ${nameEnviroment}`,
                value:'easy'
            });
            if(valueEnviroment==undefined) return;
            //
            configuration.Environments.Add(nameEnviroment,valueEnviroment);
            configuration.Environments.WriteToFile();
            treeData.Refresh();
            vscode.window.showInformationMessage('Enviroment added successfully');
        } 
}

export async function renameEnviroment(treeData: TreeDataLaunchsProvider,item:IotLaunchEnvironment):
    Promise<void> {
        //name
        const newName = await vscode.window.showInputBox({				
            prompt: 'prompt',
            title: 'Enter enviroment name',
            value:`${item.label}`
        });
        if(newName==undefined) return;
        //
        const configuration=treeData.FindbyIdLaunch(item.Launch.IdLaunch);
        if(configuration){
            configuration.Environments.Remove(<string>item.label);
            configuration.Environments.Add(newName,<string>item.description);
            configuration.Environments.WriteToFile();
            treeData.Refresh();
        }
}

export async function editEnviroment(treeData: TreeDataLaunchsProvider,item:IotLaunchEnvironment):
    Promise<void> {
        //value
        const newValue = await vscode.window.showInputBox({				
            prompt: 'prompt',
            title: `Enter the value of the enviroment: ${item.label}`,
            value:`${item.description}`
        });
        if(newValue==undefined) return;
        //
        let configuration=treeData.FindbyIdLaunch(item.Launch.IdLaunch);
        if(configuration){
            configuration.Environments.Edit(<string>item.label,newValue);
            configuration.Environments.WriteToFile();           
            treeData.Refresh();
        }        
}

export async function deleteEnviroment(treeData: TreeDataLaunchsProvider,item:IotLaunchEnvironment):
    Promise<void> {
        let configuration=treeData.FindbyIdLaunch(item.Launch.IdLaunch);
        if(configuration){
            configuration.Environments.Remove(<string>item.label);
            configuration.Environments.WriteToFile();           
            treeData.Refresh();
        }                
}
