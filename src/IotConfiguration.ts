import * as vscode from 'vscode';
//import * as fs from 'fs';
import * as fs from 'fs-extra';
import * as path from 'path';
import StreamZip from 'node-stream-zip';

export class IotConfiguration {  
  public UsernameAccountDevice:string=""; //AccountName
  public GroupsAccountDevice:string=""; //AccountGroups
  public KeysPathSettings:string=""; //AccountPathFolderKeys settings\\keys
  public ExtensionPath:string=""; //PathFolderExtension
  public UserProfilePath:string=""; //SharedPathFolder
  public TemplateTitleLaunch:string=""; //TemplateTitleLaunch

  constructor(               
    ){
            
    }
  
  public async CheckAppcwRsync():Promise<void> {	
    const checkDir=this.UserProfilePath+"\\settings\\apps\\cwrsync";
    const pathCwRsyncZip=this.ExtensionPath+"\\windows\\apps\\cwrsync.zip";
    if (fs.existsSync(checkDir+"\\rsync.exe")&&fs.existsSync(checkDir+"\\ssh.exe")) return;
    //Put App cwRsync
    const zip = new StreamZip.async({ file: pathCwRsyncZip });
    const count = await zip.extract(null, checkDir);
    console.log(`Extracted ${count} entries`);
    await zip.close();
  }

  //clearing temporary files
  public ClearFolderTmp() {
    const dir=this.UserProfilePath+"\\tmp";
	  if (!fs.existsSync(dir)) return;
    fs.emptyDirSync(dir);
  }
  
}
