import * as vscode from 'vscode';
import * as fs from 'fs-extra';
import * as path from 'path';
import { IotResult,StatusResult } from '../Shared/IotResult';
import { IoT } from '../Types/Enums';
import LogLevel = IoT.Enums.LogLevel;
import Dialog = IoT.Enums.Dialog;
import Contain = IoT.Enums.Contain;
import ChangeCommand = IoT.Enums.ChangeCommand;

export abstract class ClassMVCWithEvent {
  
  //Event--------------------------------------
  protected ChangedStateDispatcher = new EventDispatcher<IChangedStateEvent>();

  public OnChangedStateSubscribe(handler: Handler<IChangedStateEvent>):Handler<IChangedStateEvent> {
    this.ChangedStateDispatcher.Register(handler);
    return handler;
  }

  public OnChangedStateUnsubscribe (handler: Handler<IChangedStateEvent>) {
    this.ChangedStateDispatcher.Unregister(handler);
  }

  protected FireChangedState(event: IChangedStateEvent) { 
      this.ChangedStateDispatcher.Fire(event);
  }
  //-------------------------------------------
  constructor() {}
  
  protected Trigger(
    command:ChangeCommand,
    argument?:string,
    obj?:any) {
    //Event
    this.FireChangedState({
      command:command,
      argument:argument,
      obj:obj
    });
  }

}

export interface IChangedStateEvent {
  command:ChangeCommand,
  argument?:string,
  obj?:any
}

export type Handler<E> = (event: E) => void;

export class EventDispatcher<E> {
  private _handlers: Handler<E>[] = [];
  Fire(event: E) {
    for (let h of this._handlers)
      h(event);
  }
  Register(handler: Handler<E>) {
    this._handlers.push(handler);
  }
  Unregister(handler: Handler<E>) {
    const index = this._handlers.indexOf(handler, 0);
    if (index > -1) this._handlers.splice(index, 1);  
  }

}