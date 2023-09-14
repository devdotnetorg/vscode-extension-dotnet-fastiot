import * as vscode from 'vscode';
import * as fs from 'fs-extra';
import * as path from 'path';
import { LaunchTreeItemNode } from './LaunchTreeItemNode';
import { ISbc } from '../Sbc/ISbc';
import { IoTSbc } from '../Sbc/IoTSbc';
import { LaunchNode } from './LaunchNode';
import { IotResult,StatusResult } from '../Shared/IotResult';
import { IConfiguration } from '../Configuration/IConfiguration';
import { IotLaunch } from '../Launch/IotLaunch';
import { AppDomain } from '../AppDomain';

export class TreeDataLaunchsProvider implements vscode.TreeDataProvider<LaunchTreeItemNode> {    
  public RootItems:Array<LaunchNode>=[];
    
  private _onDidChangeTreeData: vscode.EventEmitter<LaunchTreeItemNode| undefined | null | void> = 
    new vscode.EventEmitter<LaunchTreeItemNode| undefined | null | void>();
  public readonly onDidChangeTreeData: vscode.Event<LaunchTreeItemNode| undefined | null | void> = 
    this._onDidChangeTreeData.event;

  constructor() {}

  public getTreeItem(element: LaunchTreeItemNode): vscode.TreeItem | Thenable<LaunchTreeItemNode> {
    return element;
  }  

  public getChildren(element?: LaunchTreeItemNode): Thenable<LaunchTreeItemNode[]> {
    if (element) {
      //Creating a child element
      let objArray: Array<LaunchTreeItemNode> =[];
      element.Childs.forEach(child => {	
          objArray.push(child)
        });
      return Promise.resolve(objArray);
    }else {
      //Creating a root structure            
      return Promise.resolve(this.RootItems);
    }
  }

  public Refresh = () => this._onDidChangeTreeData.fire();
  
  public async LoadLaunchesAsync(sortLaunchs:boolean=false): Promise<IotResult>{
    return Promise.resolve(this.LoadLaunches(sortLaunchs));  
  }

  public LoadLaunches(sortLaunchs:boolean=false):IotResult {
    let result:IotResult;
    const app = AppDomain.getInstance().CurrentApp;
    //Check WorkspaceDirectory
    if(!app.Config.Folder.WorkspaceVSCode) {
      result= new IotResult(StatusResult.No,`WorkspaceDirectory not open`);
      return result;
    }
    try {
      //Clear
      this.RootItems = [];
      //Refresh treeView
      this.Refresh();
      //Recovery launchs from config in JSON format
      let launch =new IotLaunch(app.Config.Folder.WorkspaceVSCode);
      result=launch.GetAllLaunchs(app.SBCs.ToArray());
      if(result.Status==StatusResult.No) {
        result.AddMessage(`No Launches.`);
        return result;
      }
      if(result.Status!=StatusResult.Ok) return result;
      let launchs=<IotLaunch[]>result.returnObject;
      if(launchs.length==0) {
        result.AddMessage(`No Launches.`);
        return result;
      }
      launchs.forEach((launch) => {
        //add
        let launchNode = new LaunchNode(launch);
        this.RootItems.push(launchNode);
      });
      //Sort
      if(sortLaunchs) this.SortNodes();
      //check .lockreadlaunch
      const lockFilePath=path.join(app.Config.Folder.WorkspaceVSCode,".vscode",".lockreadlaunch");
      if (fs.existsSync(lockFilePath)) fs.removeSync(lockFilePath);
      //result
      result= new IotResult(StatusResult.Ok,`Launchs loaded successfully`);      
    } catch (err:any) {
      const launchPath=path.join(app.Config.Folder.WorkspaceVSCode, ".vscode", "launch.json");
      result= new IotResult(StatusResult.Error,`Launches loading error. Path: ${launchPath}`,err);
    }
    //Refresh treeView
    this.Refresh();
    return result;
  }

  public SortNodes() {
    this.RootItems=this.RootItems.sort((a, b)=>{
      if((a.label ?? "non") < (b.label ?? "non")) { return -1; }
      if((a.label ?? "non") > (b.label ?? "non")) { return 1; }
      return 0;});
  }
  
}
