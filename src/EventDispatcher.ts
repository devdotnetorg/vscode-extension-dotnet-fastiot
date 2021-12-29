import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
   
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
