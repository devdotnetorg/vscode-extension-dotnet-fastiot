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
	config.UsernameAccountDevice= <string>vscode.workspace.getConfiguration().get('fastiot.device.account.username');	
	config.GroupsAccountDevice= <string>vscode.workspace.getConfiguration().get('fastiot.device.account.groups');
	config.ExtensionPath=context.extensionUri.fsPath;	
	config.TemplateTitleLaunch= <string>vscode.workspace.getConfiguration().get('fastiot.launch.templatetitle');
	//Main settings folder
	config.UserProfilePath= <string>vscode.workspace.getConfiguration().get('fastiot.device.sharedpathfolder');
	const FolderPreviousKeys:string= <string>vscode.workspace.getConfiguration().get('fastiot.device.pathfolderkeys');
	//Create settings folder
	if(config.UserProfilePath == null||config.UserProfilePath == undefined||config.UserProfilePath == "") 
	{
		/* Get home directory of the user in Node.js */
		// import os module
		const os = require("os");
		// check the available memory
		const userHomeDir = os.homedir();
		config.UserProfilePath=userHomeDir+"\\fastiot";
		//Saving settings
		vscode.workspace.getConfiguration().update('fastiot.device.sharedpathfolder',config.UserProfilePath,true);
	}
	config.KeysPathSettings=config.UserProfilePath+"\\settings\\keys";
	//config.PathFoldercwRsync=config.SharedPathFolder+"\\settings\\apps\\cwrsync";
	//Create folders
	MakeDirSync(config.UserProfilePath);
	MakeDirSync(config.KeysPathSettings);
	MakeDirSync(config.UserProfilePath+"\\settings\\apps\\cwrsync");
	//Check App cwRsync
	CheckAppcwRsync(config.UserProfilePath+"\\settings\\apps\\cwrsync",
		config.ExtensionPath+"\\apps\\cwrsync.zip");
	//Migrating key files from a previous version of the extension
	if(FolderPreviousKeys != "")
	{
		const fse = require('fs-extra')
		const srcDir = FolderPreviousKeys;
		const destDir = config.KeysPathSettings;
		// To copy a folder or file, select overwrite accordingly
		try {
			fse.copySync(srcDir, destDir);
			} catch (err) {
			console.error(err)
		}
		//Saving settings
		vscode.workspace.getConfiguration().update('fastiot.device.pathfolderkeys',"",true);
		vscode.window.showWarningMessage(`Keys for devices from folder ${srcDir} have been moved to folder ${destDir}`);
	}
    //creating additional folders
	MakeDirSync(config.UserProfilePath+"\\templates");	
	//MakeDirSync(config.SharedPathFolder+"\\log");
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

  export function MergeWithDictionary(dictionary:Map<string,string>,data:string):string{
    let result:string=data;
    dictionary.forEach((value,key) => {      
      const re = new RegExp(key, 'g');
      result=result.replace(re,value);      
    });
    return result;
  }

  export function DeleteComments(data:string):string{
	  //removes comments like '//'
	  const matchHashComment = new RegExp(/(\/\/.*)/, 'gi');
	  const resultJson = data.replace(matchHashComment, '').trim();
	  return resultJson;
  }
