import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

import { TreeDataLaunchsProvider } from '../TreeDataLaunchsProvider';
import { IotResult,StatusResult } from '../IotResult';
import { IoTHelper } from '../Helper/IoTHelper';
import { IotLaunch } from '../IotLaunch';
import { LaunchNode } from '../LaunchNode';
import { LaunchTreeItemNode } from '../LaunchTreeItemNode';
import { IotLaunchEnvironment } from '../IotLaunchEnvironment';

export async function addEnviroment(treeData: TreeDataLaunchsProvider,item:LaunchTreeItemNode):
    Promise<void> {
        let launchNode=<LaunchNode>item.Parent;
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
        launchNode.Launch.Environments.Add(nameEnviroment,valueEnviroment);
        launchNode.Launch.WriteEnvironments();
        launchNode.BuildEnvironments();
        treeData.Refresh();
        vscode.window.showInformationMessage('Enviroment added successfully');
}

export async function renameEnviroment(treeData: TreeDataLaunchsProvider,item:LaunchTreeItemNode):
    Promise<void> {
        let environmentsNode=<LaunchTreeItemNode>item.Parent;
        let launchNode=<LaunchNode>environmentsNode.Parent;
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
        launchNode.Launch.Environments.Remove(<string>item.label);
        launchNode.Launch.Environments.Add(newName,<string>item.description);
        launchNode.Launch.WriteEnvironments();
        launchNode.BuildEnvironments();
        treeData.Refresh();
}

export async function editEnviroment(treeData: TreeDataLaunchsProvider,item:LaunchTreeItemNode):
    Promise<void> {
        let environmentsNode=<LaunchTreeItemNode>item.Parent;
        let launchNode=<LaunchNode>environmentsNode.Parent;
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
        launchNode.Launch.Environments.Edit(<string>item.label,newValue);
        launchNode.Launch.WriteEnvironments();
        launchNode.BuildEnvironments();
        treeData.Refresh();
}

export async function deleteEnviroment(treeData: TreeDataLaunchsProvider,item:LaunchTreeItemNode):
    Promise<void> {
        let environmentsNode=<LaunchTreeItemNode>item.Parent;
        let launchNode=<LaunchNode>environmentsNode.Parent;
        //
        launchNode.Launch.Environments.Remove(<string>item.label);
        launchNode.BuildEnvironments();
        treeData.Refresh();            
}
