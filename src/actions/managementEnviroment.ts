import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

import { TreeDataConfigurationsProvider } from '../TreeDataConfigurationsProvider';
import { IotResult,StatusResult } from '../IotResult';
import { pingDevice } from './pingDevice';
import { GetWorkspaceFolder } from '../IoTHelper';
import { IotDevice } from '../IotDevice';
import { IotLaunchProject } from '../IotLaunchProject';
import { IotLaunchConfiguration } from '../IotLaunchConfiguration';
import { IotLaunchEnvironment } from '../IotLaunchEnvironment';

export async function addEnviroment(treeData: TreeDataConfigurationsProvider,item:IotLaunchEnvironment):
    Promise<void> {
        let configuration=treeData.FindbyIdConfiguration(item.ConfigurationLaunch.IdConfiguration);
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
            treeData.Refresh();
            vscode.window.showInformationMessage('Enviroment added successfully');
        } 
}

export async function renameEnviroment(treeData: TreeDataConfigurationsProvider,item:IotLaunchEnvironment):
    Promise<void> {
        //name
        const newName = await vscode.window.showInputBox({				
            prompt: 'prompt',
            title: 'Enter enviroment name',
            value:`${item.label}`
        });
        if(newName==undefined) return;
        //
        const configuration=treeData.FindbyIdConfiguration(item.ConfigurationLaunch.IdConfiguration);
        if(configuration){
            configuration.Environments.Remove(<string>item.label);
            configuration.Environments.Add(newName,<string>item.description);
            treeData.Refresh();
        }
}

export async function editEnviroment(treeData: TreeDataConfigurationsProvider,item:IotLaunchEnvironment):
    Promise<void> {
        //value
        const newValue = await vscode.window.showInputBox({				
            prompt: 'prompt',
            title: `Enter the value of the enviroment: ${item.label}`,
            value:`${item.description}`
        });
        if(newValue==undefined) return;
        //
        let configuration=treeData.FindbyIdConfiguration(item.ConfigurationLaunch.IdConfiguration);
        if(configuration){
            configuration.Environments.Edit(<string>item.label,newValue);            
            treeData.Refresh();
        }        
}

export async function deleteEnviroment(treeData: TreeDataConfigurationsProvider,item:IotLaunchEnvironment):
    Promise<void> {
        let configuration=treeData.FindbyIdConfiguration(item.ConfigurationLaunch.IdConfiguration);
        if(configuration){
            configuration.Environments.Remove(<string>item.label);            
            treeData.Refresh();
        }                
}
