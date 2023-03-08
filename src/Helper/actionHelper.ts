import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export class ItemQuickPick implements vscode.QuickPickItem {
	constructor(	  
        public label:string,
        public description: string,
        public value: any,
        public detail?: string
	) {

        }  	
  } 
