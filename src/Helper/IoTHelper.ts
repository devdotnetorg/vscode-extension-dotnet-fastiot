import * as vscode from 'vscode';
//import * as fs from 'fs';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as os from 'os';
import {IotDevice} from '../IotDevice';

export function  Sleep (time:number) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

export function MakeDirSync(dir: string) {
	if (fs.existsSync(dir)) return;
	if (!fs.existsSync(path.dirname(dir))) {
		MakeDirSync(path.dirname(dir));
	}
	fs.mkdirSync(dir);
}

export function GetWorkspaceFolder(): string| undefined {
	let folder = vscode.workspace.workspaceFolders;
	if (folder != undefined) return folder[0].uri.fsPath;
	return undefined;  	
  }

  export function ReverseSeparatorReplacement(data:string): string {
	let regex = /\\/g;
	const result = data.replace(regex, "\\\\");  	
	return result;	
  }

  export function ReverseSeparatorWinToLinux(data:string): string {
	let regex = /\\/g;
	const result = data.replace(regex, "/");  	
	return result;	
  }

  export function GetUniqueLabel(newLabel:string,suffix:string, increment:number|undefined,arrayName: Array<string>):string{
    let checklabel=newLabel;
    if(increment) checklabel=`${newLabel} ${suffix}${increment}`;    
    const item = arrayName.find(x=>x==checklabel);
    if(item)
    {
      if(!increment) increment=0; 
      increment++;      
      checklabel=GetUniqueLabel(newLabel,suffix,increment,arrayName);
    }
    return checklabel;   
  }

  export function StringTrim(data:string): string {
	let regex = /\r?\n|\r/g;
	let result = data.replace(regex, " ");
	result=result.trimLeft();
	result=result.trimRight();
	return result;	
  }

  // TODO: Move to project class dotNET
  export function GetDotnetRID(osName:string,architecture:string): string {
	//Platform
    //NET RID Catalog
    //https://docs.microsoft.com/en-us/dotnet/core/rid-catalog	
	let result:string;
	//	
    if(osName=="Alpine")
    {
		result="linux-musl-x64";
    }else
    {      
      switch(architecture) { 
        case "x86_64": { 
			result="linux-x64";
           	break; 
        } 
        case "armv7l": { 
			result="linux-arm";
			break; 
        }
        case "aarch64": {
			result="linux-arm64";
			break; 
        } 
        default: {
			//statements;
			result="linux-arm";
			break; 
        } 
     }      
    }
	//
	return result;
  }

  // TODO: Move to template class
  export function MergeWithDictionary(dictionary:Map<string,string>,data:string):string{
    let result:string=data;
    dictionary.forEach((value,key) => {      
      const re = new RegExp(key, 'g');
      result=result.replace(re,value);      
    });
    return result;
  }

  // TODO: Move to template class
  export function DeleteComments(data:string):string{
	  //removes comments like '//'
	  const matchHashComment = new RegExp(/(\/\/.*)/, 'gi');
	  const resultJson = data.replace(matchHashComment, '').trim();
	  return resultJson;
  }
