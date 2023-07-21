import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

import { TreeDataLaunchsProvider } from '../TreeDataLaunchsProvider';
import { IotResult,StatusResult } from '../Shared/IotResult';
import { LaunchNode } from '../LaunchNode';
import { IoTApplication } from '../IoTApplication';
import { IotDevice } from '../IotDevice';
import { loadTemplates } from '../actionsTemplates/loadTemplates';

export async function rebuildLaunch(treeData: TreeDataLaunchsProvider,devices: Array<IotDevice>,item:LaunchNode,app:IoTApplication): Promise<void> {
   let result:IotResult;
   //Load template
   if(app.Templates.Count==0)
      await loadTemplates(app);
   //repeat
   if(app.Templates.Count==0) {
      result=new IotResult(StatusResult.No,`No templates available`);
      app.UI.ShowNotification(result);
      return;
   }
   //Main process
   app.UI.Output(`Action: rebuild Launch. Launch: ${item.label}`);
   app.UI.ShowBackgroundNotification(`Rebuild Launch. Launch: ${item.label}`);
   result = item.Launch.RebuildLaunch(app.Config,app.Templates,devices);
   app.UI.HideBackgroundNotification();
   //Output
   app.UI.Output(result.toStringWithHead());
   //Message
   app.UI.ShowNotification(result);
   //Refresh
   treeData.LoadLaunches();
}
