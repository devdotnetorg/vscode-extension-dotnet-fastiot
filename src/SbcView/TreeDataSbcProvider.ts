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
import { SbcViewType } from '../Types/SbcViewType';
import { ClassWithEvent, ITriggerEvent, Handler } from '../Shared/ClassWithEvent';
import { isGeneratorFunction } from 'util/types';

export class TreeDataSbcProvider implements vscode.TreeDataProvider<SbcTreeItemNode> {    
  dropMimeTypes = ['application/vnd.code.tree.viewSBC'];
	dragMimeTypes = ['text/plain'];

  private _rootItems:Array<SbcNode>=[];
  private _SBCs:IoTSbcCollection<ISbc>;
  private _handlerSBC:(Handler<ITriggerEvent>)| undefined;
  private _saveSbcsViewCallback:((jsonObjView?:any) =>void)|undefined=undefined;

  private _onDidChangeTreeData: vscode.EventEmitter<SbcTreeItemNode| undefined | null | void> = 
    new vscode.EventEmitter<SbcTreeItemNode| undefined | null | void>();
  public readonly onDidChangeTreeData: vscode.Event<SbcTreeItemNode| undefined | null | void> = 
    this._onDidChangeTreeData.event;
    
  constructor(SBCs:IoTSbcCollection<ISbc>,jsonObjView?:any,
    saveSbcsViewCallback:((jsonObjView?:any) =>void)|undefined=undefined
    ) {
    this._SBCs=SBCs;
    this.Build(jsonObjView);
    this.EventHandler();
    this._saveSbcsViewCallback=saveSbcsViewCallback;
  }

  // Tree data provider

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

  dispose(): void {
		// nothing to dispose
	}

  // Drag and drop controller

	public async handleDrop(target: SbcTreeItemNode | undefined, sources: vscode.DataTransfer, token: vscode.CancellationToken): Promise<void> {
    try {
      const transferItem = sources.get('application/vnd.code.tree.viewSBC.SbcNode');
      if (!transferItem) return;
      const idSbcMove = <string> transferItem.value;
      if(target instanceof SbcNode) {
        // idSbcMove, destinationPosition
        const destinationPosition=this._rootItems.indexOf(target);
        const nodeMove = this.FindById(idSbcMove);
        if(!nodeMove) return;
        //delete
        this._rootItems.splice(this._rootItems.indexOf(nodeMove),1);
        //insert
        this._rootItems.splice(destinationPosition, 0, nodeMove);
        //update
        this.Refresh();
        //set position
        for (let i = 0; this._rootItems.length > i; i++) 
          this._rootItems[i].IndexSort=i+1;
        //save position
        this.SaveView();
      }
    } catch (err: any){}
	}

  private SetView(jsonObjView?:any) {
    if(!jsonObjView||!jsonObjView.sbcs) return;
    let sbcViews: SbcViewType[]=[];
    sbcViews = jsonObjView.sbcs;
    //set position
    for (let i = 0; sbcViews.length > i; i++) {
      const node = this.FindById(sbcViews[i].id);
      if(node) {
        const index=this._rootItems.indexOf(node);
        this._rootItems[index].IndexSort=sbcViews[i].indexsort;
      } 
    }
  }
  
  //saving sbc positions in the tree
  private SaveView() {
    if(!this._saveSbcsViewCallback) return;
    try {
      //position nodes
      // .view.sbcs
      // id: string
      // indexsort: number
      // JSON
      type jsonObjSbcsType = {
        sbcs: SbcViewType[]
      }
      let jsonObjSbcs:jsonObjSbcsType={sbcs:[]};
      //foreach
      this._rootItems.forEach(sbcNode => {
        jsonObjSbcs.sbcs.push(<never>{ id: sbcNode.IdSbc ?? "None",
          indexsort: sbcNode.IndexSort});
      });
      //save
      this._saveSbcsViewCallback(jsonObjSbcs);
    } catch (err: any){}
	}

  public GetDisposable(): vscode.Disposable {
		return new vscode.Disposable(() => {this.Dispose() });
	}

	public async handleDrag(source: SbcTreeItemNode[], treeDataTransfer: vscode.DataTransfer, token: vscode.CancellationToken): Promise<void> {
    if (source.length==0) return;
    let node =  source[0];
    if(node instanceof SbcNode) {
      treeDataTransfer.set('application/vnd.code.tree.viewSBC.SbcNode', new vscode.DataTransferItem(node.IdSbc));
    }
  }

  public Refresh(): void {        
    this._onDidChangeTreeData.fire();    
  }

  private Build(jsonObjView?:any) {
    this._rootItems=[];
    for (const sbc of  this._SBCs.getValues()) {
      //create node
      let sbcNode = new SbcNode(sbc);
      this._rootItems.push(sbcNode);
    }
    this.SetView(jsonObjView);
    this._rootItems=this.SortSbcNodes(this._rootItems);
    this.Refresh();
  }

  private SortSbcNodes(items:SbcNode[]):SbcNode[] {
    return items.sort((a, b)=>{
      if (a.IndexSort && b.IndexSort) {
        if((a.IndexSort) < (b.IndexSort)) { return -1; }
        if((a.IndexSort) > (b.IndexSort)) { return 1; }
      }
      return 0;
    });
  }

  public FindById(id:string): SbcNode| undefined {
    let sbc = this._rootItems.find(x=>x.IdSbc==id);
    return sbc;
  }

  private EventHandler() {
    //event subscription
    this._handlerSBC=this._SBCs.OnTriggerSubscribe(event => {
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
          this.Clear();
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
        case ChangeCommand.changedDto: {
          const sbc = this._SBCs.FindById(event.argument??"None");
          if(!sbc) break;
          // node
          const sbcNode = this.FindById(sbc.Id);
          if(!sbcNode) break;
          sbcNode.BuildDTOs(sbc);
          sbcNode.collapsibleState=vscode.TreeItemCollapsibleState.Expanded;
          sbcNode.DTOs.collapsibleState=vscode.TreeItemCollapsibleState.Expanded;
          this.Refresh();
          break; 
        }
        default: {
          //statements;dler
          break; 
        } 
      }
    });
  }

  public Clear() {
    //clear
    this._rootItems=[];
    this.Refresh();
  }

  public Dispose () {
    this.Clear();
    //event unsubscription
    if(this._handlerSBC) this._SBCs.OnTriggerUnsubscribe(this._handlerSBC);
  }

}
