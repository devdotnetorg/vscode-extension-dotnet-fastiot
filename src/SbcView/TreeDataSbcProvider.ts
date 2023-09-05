import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { SbcTreeItemNode } from './SbcTreeItemNode';
import { IoTSbcCollection } from '../Sbc/IoTSbcCollection';
import { ISbc } from '../Sbc/ISbc';
import { IoTHelper } from '../Helper/IoTHelper';
import { IotResult,StatusResult } from '../Shared/IotResult';
import { SbcNode } from './SbcNode';
import { IoT } from '../Types/Enums';
import LogLevel = IoT.Enums.LogLevel;
import Dialog = IoT.Enums.Dialog;
import Contain = IoT.Enums.Contain;
import ChangeCommand = IoT.Enums.ChangeCommand;

export class TreeDataSbcProvider implements vscode.TreeDataProvider<SbcTreeItemNode> {    
  private _rootItems:Array<SbcNode>=[];
  private _SBCs:IoTSbcCollection<ISbc>;

  private _onDidChangeTreeData: vscode.EventEmitter<SbcTreeItemNode| undefined | null | void> = 
    new vscode.EventEmitter<SbcTreeItemNode| undefined | null | void>();
  public readonly onDidChangeTreeData: vscode.Event<SbcTreeItemNode| undefined | null | void> = 
    this._onDidChangeTreeData.event;
    
  constructor(SBCs:IoTSbcCollection<ISbc>) {
    this._SBCs=SBCs;
    this.Build();
    this.EventHandler();
  }

  public getTreeItem(element: SbcTreeItemNode): vscode.TreeItem | Thenable<SbcTreeItemNode> {
    return element;
  }  
  
  public getChildren(element?: SbcTreeItemNode): Thenable<SbcTreeItemNode[]> {
    if (element) {
      //Creating a child element
      let objArray: Array<SbcTreeItemNode> =[];
      element.Childs.forEach(child => {	
          objArray.push(child)
        });     
      return Promise.resolve(objArray);
    }else {
      //Creating a root structure            
      return Promise.resolve(this._rootItems);        
    }    
  }

  public getParent(element: SbcTreeItemNode): SbcTreeItemNode| undefined {
    return element.Parent    
  }

  public Refresh(): void {        
    this._onDidChangeTreeData.fire();    
  }

  private Build() {
    this._rootItems=[];
    for (const sbc of  this._SBCs.getValues()) {
      //create node
      let sbcNode = new SbcNode(sbc);
      this._rootItems.push(sbcNode);
    }
    this.Refresh();
  }

  public FindById(id:string): SbcNode| undefined {
    let sbc = this._rootItems.find(x=>x.IdSbc==id);
    return sbc;
  }

  private EventHandler() {
    //event subscription
    const handler=this._SBCs.OnTriggerSubscribe(event => {
      switch(event.command) {
        case ChangeCommand.add: {
          const sbc = this._SBCs.FindById(event.argument??"None");
          if(!sbc) break;
          //create node
          const sbcNode = new SbcNode(sbc);
          this._rootItems.push(sbcNode);
          this.Refresh();
          break; 
        }
        case ChangeCommand.remove: {
          const sbcNode = this.FindById(event.argument??"None");
          if(!sbcNode) break;
          const index=this._rootItems.indexOf(sbcNode);
          this._rootItems.splice(index,1);
          this.Refresh();
          break; 
        }
        case ChangeCommand.update: {
          const newSbc = this._SBCs.FindById(event.argument??"None");
          if(!newSbc) break;
          //create node
          const newSbcNode = new SbcNode(newSbc);
          //search for previous version
          const oldSbcNode = this.FindById(event.argument??"None");
          if(!oldSbcNode) break;
          const index=this._rootItems.indexOf(oldSbcNode);
          this._rootItems[index]=newSbcNode;
          this.Refresh();
          break; 
        }
        case ChangeCommand.clear: {
          this._rootItems=[];
          this.Refresh();
          break; 
        }
        case ChangeCommand.rename: {
          const sbc = this._SBCs.FindById(event.argument??"None");
          if(!sbc) break;
          // node
          const sbcNode = this.FindById(sbc.Id);
          if(!sbcNode) break;
          sbcNode.label=sbc.Label;
          this.Refresh();
          break; 
        }
        default: {
          //statements;
          break; 
        } 
      }
    });
  }

}
