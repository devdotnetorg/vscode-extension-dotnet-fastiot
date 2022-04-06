import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import {IotConfiguration} from '../IotConfiguration';
import {IotDevice} from '../IotDevice';
import StreamZip from 'node-stream-zip';

export function  Sleep (time:number) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

export function GetConfiguration(context: vscode.ExtensionContext):IotConfiguration {    
	let config:IotConfiguration= new IotConfiguration();
	//
	config.AccountName= <string>vscode.workspace.getConfiguration().get('fastiot.device.account.username');	
	config.AccountGroups= <string>vscode.workspace.getConfiguration().get('fastiot.device.account.groups');
	config.AccountPathFolderKeys= <string>vscode.workspace.getConfiguration().get('fastiot.device.pathfolderkeys');	
	//config.SharedPathFolder= <string>vscode.workspace.getConfiguration().get('fastiot.device.sharedpathfolder');
	config.PathFoldercwRsync= <string>vscode.workspace.getConfiguration().get('fastiot.device.pathfoldercwrsync');
	config.PathFolderExtension=context.extensionUri.fsPath;	
	//Check config
	//create folder
	MakeDirSync(config.AccountPathFolderKeys);
	//MakeDirSync(config.SharedPathFolder);
	MakeDirSync(config.PathFoldercwRsync);
    //creating additional folders
	//MakeDirSync(config.SharedPathFolder+"\\logs");	
	//MakeDirSync(config.SharedPathFolder+"\\config");
	//Check App cwRsync
	CheckAppcwRsync(config.PathFoldercwRsync,
		config.PathFolderExtension+"\\apps\\cwrsync.zip");
	//
	return config	
}

export function MakeDirSync(dir: string) {
	if (fs.existsSync(dir)) return;
	if (!fs.existsSync(path.dirname(dir))) {
		MakeDirSync(path.dirname(dir));
	}
	fs.mkdirSync(dir);
}

export async function CheckAppcwRsync(checkDir: string,pathCwRsyncZip:string):Promise<void> {	
	if (fs.existsSync(checkDir+"\\rsync.exe")&&fs.existsSync(checkDir+"\\ssh.exe")) return;
	//Put App cwRsync
	const zip = new StreamZip.async({ file: pathCwRsyncZip });
	const count = await zip.extract(null, checkDir);
	console.log(`Extracted ${count} entries`);
	await zip.close();
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


  





  