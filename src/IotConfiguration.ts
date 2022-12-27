import * as vscode from 'vscode';
//import * as fs from 'fs';
import * as fs from 'fs-extra';
import * as path from 'path';
 
//

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

  //clearing temporary files
  public ClearFolderTmp() {
    const dir=this.UserProfilePath+"\\tmp";
	  if (!fs.existsSync(dir)) return;
    fs.emptyDirSync(dir);
  }
      
}
