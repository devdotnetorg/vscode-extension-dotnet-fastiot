import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { SbcTreeItemNode } from './SbcTreeItemNode';
import { IotResult,StatusResult } from '../Shared/IotResult';
import { ISbc } from '../Sbc/ISbc';
import { IoTHelper } from '../Helper/IoTHelper';

export class SbcNode extends SbcTreeItemNode {
  public Parent: undefined;
  public Childs: Array<SbcTreeItemNode>=[];
 
  public Connection:SbcTreeItemNode;
  public Information:SbcTreeItemNode;

  constructor(sbc: ISbc){
    super("sbc",undefined, undefined,vscode.TreeItemCollapsibleState.Collapsed,undefined);
    //view
    this.IdSbc=sbc.Id;
    this.label=sbc.Label;
    this.iconPath = new vscode.ThemeIcon("circuit-board");
    this.contextValue="iotsbc";
    //Childs
    let tooltip:vscode.MarkdownString;
    tooltip = new vscode.MarkdownString(`Ssh connection parameters Ssh  \nsuch as host, port, username, key`, true);
    this.Connection = new SbcTreeItemNode("Connection",undefined,tooltip,
      vscode.TreeItemCollapsibleState.Collapsed,this);
    this.Connection.iconPath = new vscode.ThemeIcon("account");
    this.Information = new SbcTreeItemNode("Information",undefined,"Sbc info",
      vscode.TreeItemCollapsibleState.Collapsed,this);
    this.Information.iconPath = {
      light: path.join(__filename, '..', '..', 'resources', 'light', 'info_20.svg'),
      dark: path.join(__filename, '..', '..', 'resources', 'dark', 'info_20.svg')
    };
    //Added in childs
    this.Childs.push(this.Connection);
    this.Childs.push(this.Information);
    //Build
    this.Build(sbc);
  }

  public Refresh(sbc: ISbc) {  
    this.Build(sbc);
  }

  private Build(sbc: ISbc) {
    this.BuildConnection(sbc);
    this.BuildInformation(sbc);
  }

  private BuildConnection(sbc: ISbc) {
    //main
    const iconError = {
      light: path.join(__filename, '..', '..', 'resources', 'light', 'error.svg'),
      dark: path.join(__filename, '..', '..', 'resources', 'dark', 'error.svg')
    };
    //create child elements
    this.Connection.Childs=[];
    let item:SbcTreeItemNode;
    //Items
    item = new SbcTreeItemNode("Host",sbc.Host,sbc.Host,vscode.TreeItemCollapsibleState.None,this.Connection);
    this.Connection.Childs.push(item);
    item = new SbcTreeItemNode("Port",sbc.Port.toString(),sbc.Port.toString(),vscode.TreeItemCollapsibleState.None,this.Connection);
    this.Connection.Childs.push(item);
    //Accounts
    sbc.Accounts.forEach((account) => {
      const assignment = account.Assignment.toString();
      let label = `${assignment} Account`;
      let accountNode = new SbcTreeItemNode(label,label,
        label,vscode.TreeItemCollapsibleState.None,this.Connection);
      //Childs
      //SSH Key SSH Key type
      item = new SbcTreeItemNode("Username",account.UserName,account.UserName,vscode.TreeItemCollapsibleState.None,accountNode);
      accountNode.Childs.push(item);
      label = IoTHelper.ArrayToString(account.Groups,", ");
      item = new SbcTreeItemNode("Groups", label, label,vscode.TreeItemCollapsibleState.None,accountNode);
      accountNode.Childs.push(item);
      item = new SbcTreeItemNode("SSH Key", account.SshKeyFileName, `File ${account.GetSshKeyPath()}`,vscode.TreeItemCollapsibleState.None,accountNode);
      //Key availability check
      if(account.IsExistsSshKey().Status!=StatusResult.Ok) {
        //Not found
        const msg=`Error. SSH key not found: ${account.GetSshKeyPath()}. Sbc: ${sbc.Label}`;
        item.tooltip=msg;          
        item.iconPath = iconError;
        vscode.window.showErrorMessage(msg);
        this.collapsibleState=vscode.TreeItemCollapsibleState.Expanded;
      }
      accountNode.Childs.push(item);
      //accountNode
      this.Connection.Childs.push(accountNode);
    });
  }

  private BuildInformation(sbc: ISbc) {
    //main
    //create child elements
    this.Information.Childs=[];
    let item:SbcTreeItemNode;
    //Items
    item = new SbcTreeItemNode("Id sbc",sbc.Id,sbc.Id,vscode.TreeItemCollapsibleState.None,this.Information);
    this.Information.Childs.push(item);

    item = new SbcTreeItemNode("Board name",sbc.BoardName,sbc.BoardName,vscode.TreeItemCollapsibleState.None,this.Information);
    item = new SbcTreeItemNode("Architecture",sbc.Architecture,sbc.Architecture,vscode.TreeItemCollapsibleState.None,this.Information);
    let label:string;
    label = sbc.OsDescription;
    if(sbc.OsCodename) label = `${label} (${sbc.OsCodename})`;
    item = new SbcTreeItemNode("OS",label,label,vscode.TreeItemCollapsibleState.None,this.Information);
    item = new SbcTreeItemNode("Linux kernel",sbc.OsKernel,sbc.OsKernel,vscode.TreeItemCollapsibleState.None,this.Information);
    if(sbc.Armbian.Version) {
      label = `${sbc.Armbian.Version}`;
      item = new SbcTreeItemNode("Armbian",label,label,vscode.TreeItemCollapsibleState.None,this.Information);
    } 
  }

}
