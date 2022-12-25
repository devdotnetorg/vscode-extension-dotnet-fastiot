import * as vscode from 'vscode';
import * as fs from 'fs';
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
      
}
