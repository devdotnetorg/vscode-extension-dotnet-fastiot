import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

import { TreeDataLaunchsProvider } from '../TreeDataLaunchsProvider';
import { IotResult,StatusResult } from '../IotResult';
import { IotDevice } from '../IotDevice';
import { IotLaunch } from '../IotLaunch';
import { IotLaunchEnvironment } from '../IotLaunchEnvironment';
import { IoTHelper } from '../Helper/IoTHelper';

export async function addEnviroment(treeData: TreeDataLaunchsProvider,item:IotLaunchEnvironment):
    Promise<void> {
        let configuration=treeData.FindbyIdLaunch(item.Launch.IdLaunch);
        if(configuration)
        {
            //name
            let nameEnviroment = await vscode.window.showInputBox({				
                prompt: 'prompt',
                title: 'Enter enviroment name',
                value:'FASTIOT'
            });
            if(nameEnviroment==undefined) return;
            nameEnviroment=IoTHelper.StringTrim(nameEnviroment);
            //value
            let valueEnviroment = await vscode.window.showInputBox({				
                prompt: 'prompt',
                title: `Enter the value of the enviroment: ${nameEnviroment}`,
                value:'easy'
            });
            if(valueEnviroment==undefined) return;
            valueEnviroment=IoTHelper.StringTrim(valueEnviroment);
            //
            configuration.Environments.Add(nameEnviroment,valueEnviroment);
            configuration.Environments.Write();
            treeData.Refresh();
            vscode.window.showInformationMessage('Enviroment added successfully');
        } 
}

export async function renameEnviroment(treeData: TreeDataLaunchsProvider,item:IotLaunchEnvironment):
    Promise<void> {
        //name
        let newName = await vscode.window.showInputBox({				
            prompt: 'prompt',
            title: 'Enter enviroment name',
            value:`${item.label}`
        });
        if(newName==undefined) return;
        newName=IoTHelper.StringTrim(newName);
        //
        const configuration=treeData.FindbyIdLaunch(item.Launch.IdLaunch);
        if(configuration){
            configuration.Environments.Remove(<string>item.label);
            configuration.Environments.Add(newName,<string>item.description);
            configuration.Environments.Write();
            treeData.Refresh();
        }
}

export async function editEnviroment(treeData: TreeDataLaunchsProvider,item:IotLaunchEnvironment):
    Promise<void> {
        //value
        let newValue = await vscode.window.showInputBox({				
            prompt: 'prompt',
            title: `Enter the value of the enviroment: ${item.label}`,
            value:`${item.description}`
        });
        if(newValue==undefined) return;
        newValue=IoTHelper.StringTrim(newValue);
        //
        let configuration=treeData.FindbyIdLaunch(item.Launch.IdLaunch);
        if(configuration){
            configuration.Environments.Edit(<string>item.label,newValue);
            configuration.Environments.Write();           
            treeData.Refresh();
        }        
}

export async function deleteEnviroment(treeData: TreeDataLaunchsProvider,item:IotLaunchEnvironment):
    Promise<void> {
        let configuration=treeData.FindbyIdLaunch(item.Launch.IdLaunch);
        if(configuration){
            configuration.Environments.Remove(<string>item.label);
            configuration.Environments.Write();           
            treeData.Refresh();
        }                
}
