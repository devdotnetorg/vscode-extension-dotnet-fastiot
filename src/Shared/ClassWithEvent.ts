import * as vscode from 'vscode';
import * as fs from 'fs-extra';
import * as path from 'path';
import { IotResult,StatusResult } from '../IotResult';
import { LogLevel } from './LogLevel';

export abstract class ClassWithEvent {
  
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
  
  protected CreateEvent(message?:string|IotResult,logLevel?:LogLevel,increment?:number)
  {
    //Event
    this.FireChangedState({
      message:message,
      logLevel:logLevel,
      increment:increment
    });
  }

}

export interface IChangedStateEvent {
  message?:string|IotResult,
  logLevel?:LogLevel,
  increment?:number
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
        if (index > -1) {
            this._handlers.splice(index, 1);
        }
    }
}
