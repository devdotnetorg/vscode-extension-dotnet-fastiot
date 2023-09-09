import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { SbcTreeItemNode } from './SbcTreeItemNode';
import { IotResult,StatusResult } from '../Shared/IotResult';
import { ISbc } from '../Sbc/ISbc';
import { IoTHelper } from '../Helper/IoTHelper';
import { IoT } from '../Types/Enums';
import AccountAssignment = IoT.Enums.AccountAssignment;

export class SbcNode extends SbcTreeItemNode {
  public Parent: undefined;
  public Childs: Array<SbcTreeItemNode>=[];
 
  public Connection:SbcTreeItemNode;
  public Information:SbcTreeItemNode;
  public DTOs:SbcTreeItemNode;

  constructor(sbc: ISbc){
    super("sbc",undefined, undefined,vscode.TreeItemCollapsibleState.Collapsed,undefined);
    //view
    this.IdSbc=sbc.Id;
    this.label=sbc.Label;
    this.description=sbc.Architecture;
    this.iconPath = new vscode.ThemeIcon("circuit-board");
    this.contextValue="iotsbc";
    //Childs
    //Connection
    let tooltip:vscode.MarkdownString;
    tooltip = new vscode.MarkdownString(`Ssh connection parameters Ssh  \nsuch as host, port, username, key`, true);
    this.Connection = new SbcTreeItemNode("Connection",undefined,tooltip,
      vscode.TreeItemCollapsibleState.Collapsed,this);
    this.Connection.iconPath = new vscode.ThemeIcon("account");
    //Information
    this.Information = new SbcTreeItemNode("Information",undefined,"Sbc info",
      vscode.TreeItemCollapsibleState.Collapsed,this);
    this.Information.iconPath = {
      light: path.join(__filename, '..', '..', '..', 'resources', 'light', 'info_20.svg'),
      dark: path.join(__filename,'..', '..', '..', 'resources', 'dark', 'info_20.svg')
    };
    //DTOs
    this.DTOs = new SbcTreeItemNode("Device Tree Overlays",undefined,"This is data structure describing a system's hardware",
    vscode.TreeItemCollapsibleState.Collapsed,this);
    this.DTOs.contextValue="iotdtos";
    this.DTOs.iconPath = new vscode.ThemeIcon("layers");
    this.DTOs.IdSbc=sbc.Id;
    //Added in childs
    this.Childs.push(this.Connection);
    this.Childs.push(this.Information);
    this.Childs.push(this.DTOs);
    //Build
    this.Build(sbc);
  }

  public FindByTag(tag:string): SbcTreeItemNode| undefined {
    let node = this.Childs.find(x=>x.Tag==tag);
    return node;
  }

  public Refresh(sbc: ISbc) {  
    this.Build(sbc);
  }

  private Build(sbc: ISbc) {
    this.BuildConnection(sbc);
    this.BuildInformation(sbc);
    this.BuildDTOs(sbc);
  }

  private BuildConnection(sbc: ISbc) {
    //main
    const iconError = {
      light: path.join(__filename,'..', '..', '..', 'resources', 'light', 'error.svg'),
      dark: path.join(__filename,'..', '..', '..', 'resources', 'dark', 'error.svg')
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
      let label = IoTHelper.FirstLetter(account.Assignment.toString());
      let accountNode = new SbcTreeItemNode("Account",label,
        label,vscode.TreeItemCollapsibleState.Collapsed,this.Connection);
      switch(account.Assignment) {
        case AccountAssignment.management: {
          accountNode.iconPath = new vscode.ThemeIcon("settings");
          //settings-gear
          //settings
          //tools
          //gear
          break;
        }
        case AccountAssignment.debug: {
          accountNode.iconPath = new vscode.ThemeIcon("play");
          //play
          //debug-alt
          //debug-console
          break;
        }
        default: {
          //statements;
          break;
        } 
      }
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
        //warning
        this.iconPath = new vscode.ThemeIcon("warning");
        accountNode.iconPath = new vscode.ThemeIcon("warning");
        vscode.window.showErrorMessage(msg);
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
    this.Information.Childs.push(item);
    item = new SbcTreeItemNode("Architecture",sbc.Architecture,sbc.Architecture,vscode.TreeItemCollapsibleState.None,this.Information);
    this.Information.Childs.push(item);
    let label:string;
    label = sbc.OsDescription;
    if(sbc.OsCodename) label = `${label} (${sbc.OsCodename})`;
    item = new SbcTreeItemNode("OS",label,label,vscode.TreeItemCollapsibleState.None,this.Information);
    this.Information.Childs.push(item);
    item = new SbcTreeItemNode("Linux kernel",sbc.OsKernel,sbc.OsKernel,vscode.TreeItemCollapsibleState.None,this.Information);
    this.Information.Childs.push(item);
    if(sbc.Armbian.Version) {
      label = `${sbc.Armbian.Version}`;
      item = new SbcTreeItemNode("Armbian",label,label,vscode.TreeItemCollapsibleState.None,this.Information);
      this.Information.Childs.push(item);
    } 
  }

  public BuildDTOs(sbc: ISbc) {
    if(sbc.DTOs.Count==0) return;
    //main
    this.DTOs.Childs=[];
    for (const dto of sbc.DTOs.getValues()) {
      //create node
      let tooltip:vscode.MarkdownString;
      tooltip= new vscode.MarkdownString(`Name: ${dto.name}   \nClass: ${dto.type}   \nState: ${dto.active?"on":"off"}   \nLocation: ${dto.path}`,true);
      let dtoNode = new SbcTreeItemNode(dto.name,dto.type.toString(),tooltip,vscode.TreeItemCollapsibleState.None,this.DTOs);
      dtoNode.IdSbc=sbc.Id;
      dtoNode.contextValue="iotsbc";
      if(dto.active) {
        dtoNode.iconPath = {
          light: path.join(__filename, '..', '..', '..', 'resources', 'light', 'yes.svg'),
          dark: path.join(__filename, '..', '..', '..', 'resources', 'dark', 'yes.svg')
        };
        //view
        dtoNode.contextValue="iotdto_on";
      }else {
        dtoNode.iconPath = {
          light: path.join(__filename, '..', '..', '..', 'resources', 'light', 'no.svg'),
          dark: path.join(__filename, '..', '..', '..', 'resources', 'dark', 'no.svg')
        };
        //view
        dtoNode.contextValue="iotdto_off";
      }
      //add
      this.DTOs.Childs.push(dtoNode);
    }
    //sort
    this.DTOs.Childs=this.SortNodes(this.DTOs.Childs);
  }

  private SortNodes(items:SbcTreeItemNode[]):SbcTreeItemNode[] {
    return items.sort((a, b)=>{
      if((a.label ?? "non") < (b.label ?? "non")) { return -1; }
      if((a.label ?? "non") > (b.label ?? "non")) { return 1; }
      return 0;
    });
  }

}
