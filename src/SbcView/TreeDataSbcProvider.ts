import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { SbcTreeItemNode } from './SbcTreeItemNode';
import { IoTSbcCollection } from '../Sbc/IoTSbcCollection';
import { ISbc } from '../Sbc/ISbc';
import { IoTHelper } from '../Helper/IoTHelper';
import { IotResult,StatusResult } from '../Shared/IotResult';
import { SbcNode } from './SbcNode';

export class TreeDataSbcProvider implements vscode.TreeDataProvider<SbcTreeItemNode> {    
  private RootItems:Array<SbcNode>=[];
  private SBCs:IoTSbcCollection<ISbc>;

  private _onDidChangeTreeData: vscode.EventEmitter<SbcTreeItemNode| undefined | null | void> = 
    new vscode.EventEmitter<SbcTreeItemNode| undefined | null | void>();
  public readonly onDidChangeTreeData: vscode.Event<SbcTreeItemNode| undefined | null | void> = 
    this._onDidChangeTreeData.event;
    
  constructor(SBCs:IoTSbcCollection<ISbc>) {
    this.SBCs=SBCs;
    this.CreateRootItems();
    this.Build();
    this.Refresh();
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
      return Promise.resolve(this.RootItems);        
    }    
  }

  public getParent(element: SbcTreeItemNode): SbcTreeItemNode| undefined {
    return element.Parent    
  }

  public Refresh(): void {        
    this._onDidChangeTreeData.fire();    
  }

  private CreateRootItems() {
    this.RootItems=[];
    while(true) {
      const sbc = this.SBCs.getValues().next().value;
      if(!sbc) break;
      //create node
      let sbcNode = new SbcNode(sbc);
      this.RootItems.push(sbcNode);
    }
  }

  private Build() {
   
    
    

  }

}
