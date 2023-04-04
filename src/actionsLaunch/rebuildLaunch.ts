import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

import { TreeDataLaunchsProvider } from '../TreeDataLaunchsProvider';
import { IotResult,StatusResult } from '../IotResult';
import { LaunchNode } from '../LaunchNode';
import { IContexUI } from '../ui/IContexUI';
import { IotDevice } from '../IotDevice';

export async function rebuildLaunch(treeData: TreeDataLaunchsProvider,devices: Array<IotDevice>,item:LaunchNode,contextUI:IContexUI): Promise<void> {
   let result:IotResult;
   //Load template
   if(treeData.Config.Templates.Count==0)
      await treeData.Config.Templates.LoadTemplatesAsync();
   //repeat
   if(treeData.Config.Templates.Count==0) {
      result=new IotResult(StatusResult.No,`No templates available`);
      contextUI.ShowNotification(result);
      return;
   }
   //Main process
   contextUI.Output(`Action: rebuild Launch. Launch: ${item.label}`);
   contextUI.ShowBackgroundNotification(`Rebuild Launch. Launch: ${item.label}`);
   result = item.Launch.RebuildLaunch(treeData.Config,devices);
   contextUI.HideBackgroundNotification();
   //Output
   contextUI.Output(result.toStringWithHead());
   //Message
   contextUI.ShowNotification(result);
   //Refresh
   treeData.LoadLaunches();
}
