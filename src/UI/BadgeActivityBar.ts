import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { IoTHelper } from '../Helper/IoTHelper';

export class BadgeActivityBar {
  private _mainLabel:string;
  private _treeView:vscode.TreeView<any>;
  private _items:Map<string,string>;

  constructor(label:string, treeView:vscode.TreeView<any>){
    this._mainLabel=`${label}: `;
    this._treeView=treeView;
    this._items= new Map<string,string>();
  }
  
  private ChangeState()
  {
    try {
      if(this._items.size<1) {
        this._treeView.badge = undefined;
        return;
      }
      //change
      let tooltip="";
      this._items.forEach(item => {
        tooltip=`${item}, ${tooltip}`;
      });
      tooltip=tooltip.substring(0,tooltip.length-2);
      tooltip=`${this._mainLabel} ${tooltip}`;
      //badge
      const badge:vscode.ViewBadge={
        tooltip:tooltip,
        value:this._items.size
      };
      this._treeView.badge = badge;
    } catch (err: any){
      this._treeView.badge = undefined;
    }
  }

  public AddItem(label:string):string {
    const guid=IoTHelper.CreateGuid();
    this._items.set(guid,label);
    this.ChangeState();
    return guid;
  }

  public DeleteItem(guid:string):boolean {
    const result=this._items.delete(guid);
    this.ChangeState();
    return result;
  }

}
