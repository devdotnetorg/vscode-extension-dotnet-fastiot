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
import { IContexUI } from '../ui/IContexUI';

export async function addEnviroment(treeData: TreeDataLaunchsProvider,item:LaunchTreeItemNode,contextUI:IContexUI):
    Promise<void> {
        let launchNode=<LaunchNode>item.Parent;
        //name
        let nameEnviroment = await vscode.window.showInputBox({				
            prompt: 'prompt',
            title: 'Enter enviroment name',
            value:'FASTIOT'
        });
        if(!nameEnviroment) return;
        nameEnviroment=IoTHelper.StringTrim(nameEnviroment);
        let result:IotResult;
        if(nameEnviroment=="") {
            result=new IotResult(StatusResult.Error,`Empty name specified`);
            contextUI.ShowNotification(result);
            return;
        }
        //value
        let valueEnviroment = await vscode.window.showInputBox({				
            prompt: 'prompt',
            title: `Enter the value of the enviroment: ${nameEnviroment}`,
            value:'easy'
        });
        if(!valueEnviroment) return;
        valueEnviroment=IoTHelper.StringTrim(valueEnviroment);
        if(valueEnviroment==""){
            result=new IotResult(StatusResult.Error,`Empty name specified`);
            contextUI.ShowNotification(result);
            return;
        }
        //Main process
        launchNode.Launch.Environments.Add(nameEnviroment,valueEnviroment);
        result=launchNode.Launch.WriteEnvironments();
        launchNode.BuildEnvironments();
        //Message
        contextUI.ShowNotification(result);
        //Output
        if(result.Status==StatusResult.Error)
            contextUI.Output(result);
        //Refresh
        treeData.Refresh();
}

export async function renameEnviroment(treeData: TreeDataLaunchsProvider,item:LaunchTreeItemNode,contextUI:IContexUI):
    Promise<void> {
        let environmentsNode=<LaunchTreeItemNode>item.Parent;
        let launchNode=<LaunchNode>environmentsNode.Parent;
        //name
        let newName = await vscode.window.showInputBox({				
            prompt: 'prompt',
            title: 'Enter enviroment name',
            value:`${item.label}`
        });
        if(!newName) return;
        newName=IoTHelper.StringTrim(newName);
        let result:IotResult;
        if(newName=="") {
            result=new IotResult(StatusResult.Error,`Empty name specified`);
            contextUI.ShowNotification(result);
            return;
        }
        //Main process
        launchNode.Launch.Environments.Rename(<string>item.label,newName);
        result=launchNode.Launch.WriteEnvironments();
        launchNode.BuildEnvironments();
        //Message
        contextUI.ShowNotification(result);
        //Output
        if(result.Status==StatusResult.Error)
            contextUI.Output(result);
        //Refresh
        treeData.Refresh();
}

export async function editEnviroment(treeData: TreeDataLaunchsProvider,item:LaunchTreeItemNode,contextUI:IContexUI):
    Promise<void> {
        let environmentsNode=<LaunchTreeItemNode>item.Parent;
        let launchNode=<LaunchNode>environmentsNode.Parent;
        //value
        let newValue = await vscode.window.showInputBox({				
            prompt: 'prompt',
            title: `Enter the value of the enviroment: ${item.label}`,
            value:`${item.description}`
        });
        if(!newValue) return;
        newValue=IoTHelper.StringTrim(newValue);
        let result:IotResult;
        if(newValue==""){
            result=new IotResult(StatusResult.Error,`Empty name specified`);
            contextUI.ShowNotification(result);
            return;
        }
        //Main process
        launchNode.Launch.Environments.Edit(<string>item.label,newValue);
        result=launchNode.Launch.WriteEnvironments();
        launchNode.BuildEnvironments();
        //Message
        contextUI.ShowNotification(result);
        //Output
        if(result.Status==StatusResult.Error)
            contextUI.Output(result);
        //Refresh
        treeData.Refresh();
}

export async function deleteEnviroment(treeData: TreeDataLaunchsProvider,item:LaunchTreeItemNode,contextUI:IContexUI):
    Promise<void> {
        let environmentsNode=<LaunchTreeItemNode>item.Parent;
        let launchNode=<LaunchNode>environmentsNode.Parent;
        let result:IotResult;
        //Main process
        launchNode.Launch.Environments.Remove(<string>item.label);
        result=launchNode.Launch.WriteEnvironments();
        launchNode.BuildEnvironments();  
        //Message
        contextUI.ShowNotification(result);
        //Output
        if(result.Status==StatusResult.Error)
            contextUI.Output(result);
        //Refresh
        treeData.Refresh();

}
