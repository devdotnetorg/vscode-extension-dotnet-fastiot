// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs-extra';
import { compare } from 'compare-versions';
//shared
import { IoTApplication } from './IoTApplication';
import { IoTHelper } from './Helper/IoTHelper';
import { IotConfiguration } from './Configuration/IotConfiguration';
import { IotItemTree } from './shared/IotItemTree';
import { IotResult,StatusResult } from './IotResult';
import { IotTemplateCollection } from './Templates/IotTemplateCollection';
import { IConfigEntityCollection } from './Entity/EntityCollection';
import { Constants } from "./Constants"
//UI
import { IoTUI } from './ui/IoTUI';
import { IContexUI } from './ui/IContexUI';
import { StatusBarBackground } from './ui/StatusBarBackground';
//Devices
import { TreeDataDevicesProvider } from './TreeDataDevicesProvider';
import { IotDevice } from './IotDevice';
import { IotDevicePackage } from './IotDevicePackage';
import { IotDeviceDTO } from './IotDeviceDTO';
import { IotDeviceGpiochip } from './IotDeviceGpiochip';
//Devices.actions
import { addDevice } from './actionsDevice/addDevice';
import { discoveryDevice } from './actionsDevice/discoveryDevice';
import { refreshDevices } from './actionsDevice/refreshDevices';
import { exportDevices,importDevices } from './actionsDevice/exportImportDevices';
import { deleteDevice } from './actionsDevice/deleteDevice';
import { connectionTestDevice } from './actionsDevice/connectionTestDevice';
import { rebootDevice } from './actionsDevice/rebootDevice';
import { shutdownDevice } from './actionsDevice/shutdownDevice';
import { renameDevice } from './actionsDevice/renameDevice';
import { detectGpiochips } from './actionsDevice/detectGpiochips';
import { copyTexttoClipboard } from './actionsDevice/copyTexttoClipboard';
import { openFolderKeys } from './actionsDevice/openFolderKeys';
import { openSshTerminal } from './actionsDevice/openSshTerminal';
import { checkAllPackages } from './actionsDevice/checkAllPackages';
import { installPackage } from './actionsDevice/installPackage';
import { upgradePackage } from './actionsDevice/upgradePackage';
import { uninstallPackage } from './actionsDevice/uninstallPackage';
import { testPackage } from './actionsDevice/testPackage';

import { refreshDTO } from './actionsDevice/refreshDTO';
import { addDTO } from './actionsDevice/addDTO';
import { deleteDTO } from './actionsDevice/deleteDTO';
import { enableDTO } from './actionsDevice/enableDTO';
import { disableDTO } from './actionsDevice/disableDTO';
//Launchs
import { TreeDataLaunchsProvider } from './TreeDataLaunchsProvider';
import { TreeDataTemplatesProvider } from './TreeDataTemplatesProvider';
import { LaunchNode } from './LaunchNode';
import { LaunchTreeItemNode } from './LaunchTreeItemNode';
import { LaunchOptionNode } from './LaunchOptionNode';
//actionsLaunch.actions
import { addLaunch } from './actionsLaunch/addLaunch';
import { addEnviroment,renameEnviroment,editEnviroment,deleteEnviroment } from './actionsLaunch/managementEnviroment';
import { gotoDevice } from './actionsLaunch/gotoDevice';
import { renameLaunch } from './actionsLaunch/renameLaunch';
import { refreshLaunch } from './actionsLaunch/refreshLaunch';
import { deleteLaunch } from './actionsLaunch/deleteLaunch';
import { rebuildLaunch } from './actionsLaunch/rebuildLaunch';
import { changeOption } from './actionsLaunch/changeOption';
//Template.actions
import { createProject } from './actionsTemplates/createProject';
import { loadTemplates } from './actionsTemplates/loadTemplates';
import { openTemplateFolder } from './actionsTemplates/openTemplateFolder';
import { importTemplate } from './actionsTemplates/importTemplate';
import { EntityType } from './Entity/EntityType';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export async function activate(context: vscode.ExtensionContext) {
	
	console.log('Congratulations, your extension "vscode-extension-dotnet-fastiot" is now active!');
	//Application
	let app = BuildApplication(context);
	//Output
	app.UI.Output("Welcome to .NET FastIoT!");	
	app.UI.Output("----------------------------------");
	app.UI.Output(`Version: ${context.extension.packageJSON.version}`);	
	app.UI.Output("Feedback: fastiot@devdotnet.org");
	app.UI.Output("Site: https://devdotnet.org/tag/fastiot/");
	app.UI.Output("GitHub: https://github.com/devdotnetorg/vscode-extension-dotnet-fastiot");
	app.UI.Output("----------------------------------");

	//Templates
	const loadTemplatesExt = async () => {
		//Checking if templates need to be updated after updating an extension
		const isNeedUpgrade=compare(`${app.Config.ExtVersion}`,`${app.Config.BuiltInConfig.PreviousVerExt}`, '>');
		if(isNeedUpgrade) {
			app.Templates.DeletingSystemEntities();
			loadTemplates(app,true);
			//BuiltInConfig
			app.Config.BuiltInConfig.PreviousVerExt=app.Config.ExtVersion;
			app.Config.BuiltInConfig.Save();
		}else {
			if(app.Config.LoadTemplatesOnStart) loadTemplates(app);
		}
	};
	loadTemplatesExt();
	//TreeView Devices
    let treeDataDevicesProvider = new TreeDataDevicesProvider(app);
    let vscodeTreeViewDevices=vscode.window.createTreeView('viewDevices', {
		treeDataProvider: treeDataDevicesProvider
	});
	//ViewBadge
	app.UI.BadgeInit("Active tasks", vscodeTreeViewDevices);
	//TreeView Launchs
    let treeDataLaunchsProvider = new TreeDataLaunchsProvider(app.Config,treeDataDevicesProvider.RootItems);
	const loadLaunchs = async () => {
		const result= treeDataLaunchsProvider.LoadLaunches();
		if(result.Status==StatusResult.Error) {
			const head="--------- Loading launchs --------";
			app.UI.Output(result.toStringWithHead(head));
			vscode.window.showErrorMessage(`Error. Loaded Launchs!`);
		}
		treeDataLaunchsProvider.Refresh();
	};
	loadLaunchs();
    let vscodeTreeViewLaunchs=vscode.window.createTreeView('viewLaunchs', {
		treeDataProvider: treeDataLaunchsProvider
	  });
	//TreeView Templates
    let treeDataTemplatesProvider = new TreeDataTemplatesProvider();	
    let vscodeTreeViewTemplates=vscode.window.createTreeView('viewTemplates', {
		treeDataProvider: treeDataTemplatesProvider
	  });
	vscodeTreeViewTemplates.description="Create a project from a template";
	//Commands
	/*
	let commandHelloWorld = vscode.commands.registerCommand('vscode-extension-dotnet-fastiot.helloWorld', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user		
		vscode.window.showInformationMessage('Hello World from vscode-extension-dotnet-fastiot!');	
		//vscode.window.showInformationMessage('Function not implemented!');	
		//Test code
		console.log("=========");
		const msg='"Banana Pi M64"';
		console.log(msg);
		vscode.window.showInformationMessage('Function not implemented!');	
		//
		const json="[{\"name\": \"gpiochip0\"},{\"name\": \"gpiochip1\"}]";
    	let jsonObj = JSON.parse(json); 
		vscode.window.showInformationMessage('Function not implemented!');	
	});
	*/

	//Add new device		  
	let commandAddDevice = vscode.commands.registerCommand('viewDevices.AddDevice', () => {	
		addDevice(treeDataDevicesProvider,vscodeTreeViewDevices,app,context);	
	});
	//Add new device		  
	let commandDiscoveryDevice = vscode.commands.registerCommand('viewDevices.DiscoveryDevice', () => {
		discoveryDevice(treeDataDevicesProvider,vscodeTreeViewDevices,app);	
	});
	//Refresh Devices
	let commandRefreshDevices = vscode.commands.registerCommand('viewDevices.RefreshDevices', () => {
		refreshDevices(treeDataDevicesProvider);	
	});
	//Export devices
	let commandExportDevices = vscode.commands.registerCommand('viewDevices.ExportDevices', () => {					
		exportDevices(treeDataDevicesProvider);
	});
	//Import devices	
	let commandImportDevices = vscode.commands.registerCommand('viewDevices.ImportDevices', () => {					
		importDevices(treeDataDevicesProvider,app.UI);
	});
	//Rename Device
	let commandRenameDevice = vscode.commands.registerCommand("viewDevices.RenameDevice", (item:IotDevice) => {
		renameDevice(treeDataDevicesProvider,item);
	});
	//Ping Device
	let commandPingDevice = vscode.commands.registerCommand("viewDevices.ConnectionTestDevice", (item:IotDevice) => {
		connectionTestDevice(treeDataDevicesProvider,item,app.UI);
	});
	//Reboot Device
	let commandRebootDevice = vscode.commands.registerCommand("viewDevices.RebootDevice", (item:IotDevice) => {
		rebootDevice(treeDataDevicesProvider,item,undefined,app.UI);
	});
	//Shutdown Device
	let commandShutdownDevice = vscode.commands.registerCommand("viewDevices.ShutdownDevice", (item:IotDevice) => {
		shutdownDevice(treeDataDevicesProvider,item,undefined,app.UI);
	});
	//Delete Device
	let commandDeleteDevice = vscode.commands.registerCommand("viewDevices.DeleteDevice", (item:IotDevice) => {
		deleteDevice(treeDataDevicesProvider,item,app.UI);
	});
	//Open folder with ssh keys
	let commandOpenFolderKeys = vscode.commands.registerCommand("viewDevices.OpenFolderSshKeys", () => {
		openFolderKeys(app.Config.Folder.DeviceKeys);
	});
	//Open ssh-terminal in New Window
	let commandOpenSshTerminal = vscode.commands.registerCommand("viewDevices.OpenSshTerminal", (item:IotDevice) => {
		openSshTerminal(item,app.Config);
	});
	//Copy To Clipboard
	let commandCopyToClipboard = vscode.commands.registerCommand("viewDevices.CopyToClipboard", (item:IotItemTree) => {
		copyTexttoClipboard(item);
	});
	//Check all packages
	let commandCheckAllPackages = vscode.commands.registerCommand("viewDevices.CheckAllPackages", (item:IotDevicePackage) => {
		checkAllPackages(treeDataDevicesProvider,item.Device,app.UI);		 
	});
	//Package installation 
	let commandInstallationPackage = vscode.commands.registerCommand("viewDevices.InstallationPackage", (item:IotDevicePackage) => {
		installPackage(treeDataDevicesProvider,item,app.UI);		 
	});
	//Package upgrade
	let commandUpgradePackage = vscode.commands.registerCommand("viewDevices.UpgradePackage", (item:IotDevicePackage) => {
		upgradePackage(treeDataDevicesProvider,item,app.UI);
	});
	//Remove package 
	let commandRemovePackage = vscode.commands.registerCommand("viewDevices.RemovePackage", (item:IotDevicePackage) => {
		uninstallPackage(treeDataDevicesProvider,item,app.UI); 
	});
	//Test package 
	let commandTestPackage = vscode.commands.registerCommand("viewDevices.TestPackage", (item:IotDevicePackage) => {		
		testPackage(treeDataDevicesProvider,item,app.UI); 
	});
	//Update DTO
	let commandUpdateDTO = vscode.commands.registerCommand("viewDevices.UpdateDTO", (item:IotDeviceDTO) => {
		refreshDTO(treeDataDevicesProvider,item.Device,app.UI); 
	});
	let commandAddDTO = vscode.commands.registerCommand("viewDevices.AddDTO", (item:IotDeviceDTO) => {
		addDTO(treeDataDevicesProvider,item.Device,app.UI);		
	});
	let commandDeleteDTO = vscode.commands.registerCommand("viewDevices.DeleteDTO", (item:IotDeviceDTO) => {
		deleteDTO(treeDataDevicesProvider,item,app.UI);
	});
	let commandEnableDTO = vscode.commands.registerCommand("viewDevices.EnableDTO", (item:IotDeviceDTO) => {
		enableDTO(treeDataDevicesProvider,item,app.UI);
	});
	let commandDisableDTO = vscode.commands.registerCommand("viewDevices.DisableDTO", (item:IotDeviceDTO) => {
		disableDTO(treeDataDevicesProvider,item,app.UI);
	});
	//GPIO detect
	let commandDetectGpiochips = vscode.commands.registerCommand("viewDevices.DetectGpiochips", (item:IotDeviceGpiochip) => {
		detectGpiochips(treeDataDevicesProvider,item.Device,app.UI);
	});
	//Add new launch		  
	let commandAddLaunch = vscode.commands.registerCommand('viewLaunchs.Add', () => {	
		addLaunch(treeDataLaunchsProvider,treeDataDevicesProvider.RootItems,app);	
	});
	//Refresh Launchs
	let commandRefreshLaunch = vscode.commands.registerCommand('viewLaunchs.Refresh', () => {
		refreshLaunch(treeDataLaunchsProvider,app.UI);		
	});
	//Rename Launch
	let commandRenameLaunch = vscode.commands.registerCommand('viewLaunchs.Rename', 
		(item:LaunchNode) => {
			renameLaunch(treeDataLaunchsProvider,item,app.UI);
	});
	//Delete Launch
	let commandDeleteLaunch = vscode.commands.registerCommand('viewLaunchs.Delete', 
		(item:LaunchNode) => {
			deleteLaunch(treeDataLaunchsProvider,item,app.UI);
	});
	//Rebuild Launch
	let commandRebuildLaunch = vscode.commands.registerCommand('viewLaunchs.Rebuild', 
		(item:LaunchNode) => {
			rebuildLaunch(treeDataLaunchsProvider,treeDataDevicesProvider.RootItems,
				item,app);
	});
	//Go to device 
	let commandGoToDevice = vscode.commands.registerCommand('viewLaunchs.GoToDevice', 
		(item:LaunchNode) => {
			gotoDevice(item,vscodeTreeViewDevices,treeDataDevicesProvider);
	});
	//Add Enviroment
	let commandAddEnviroment = vscode.commands.registerCommand('viewLaunchs.AddEnviroment',
		(item:LaunchTreeItemNode) => {
			addEnviroment(treeDataLaunchsProvider,item,app.UI);
	});
	//Rename Enviroment
	let commandRenameEnviroment = vscode.commands.registerCommand('viewLaunchs.RenameEnviroment',
		(item:LaunchTreeItemNode) => {
			renameEnviroment(treeDataLaunchsProvider,item,app.UI);
	});
	//Edit Enviroment
	let commandEditEnviroment = vscode.commands.registerCommand('viewLaunchs.EditEnviroment', 
		(item:LaunchTreeItemNode) => {
			editEnviroment(treeDataLaunchsProvider,item,app.UI);
	});
	//Delete Enviroment
	let commandDeleteEnviroment = vscode.commands.registerCommand('viewLaunchs.DeleteEnviroment', 
		(item:LaunchTreeItemNode) => {
			deleteEnviroment(treeDataLaunchsProvider,item,app.UI);		
	});
	//Change Option
	let commandChangeOptionLaunch = vscode.commands.registerCommand('viewLaunchs.ChangeOption', 
		(item:LaunchOptionNode) => {
			changeOption(treeDataLaunchsProvider,item);
	});
	//Create project
	let commandCreateProject = vscode.commands.registerCommand('viewTemplates.CreateProject', () => {	
			createProject(app,treeDataDevicesProvider.RootItems);	
	});
	//Reload templates
	let commandReloadTemplates = vscode.commands.registerCommand('viewTemplates.ReloadTemplates', () => {	
			loadTemplates(app,true);	
	});
	//Open template folder
	let commandOpenTemplateFolder = vscode.commands.registerCommand('viewTemplates.OpenTemplateFolder', () => {	
			openTemplateFolder(app.Config.Folder.GetDirTemplates(EntityType.none));
	});
	//Import template
	let commandImportTemplate = vscode.commands.registerCommand('viewTemplates.ImportTemplate', () => {	
			importTemplate(app);
	});
	//Restore/upgrade system templates
	let commandRestoreSystemTemplates = vscode.commands.registerCommand('viewTemplates.RestoreSystemTemplates', async () => {
		app.Templates.DeletingSystemEntities();
		loadTemplates(app);
		vscode.window.showInformationMessage("Restore/upgrade system templates completed successfully");
	});
	//Events
	//Extension configuration change event 
	//TODO Добавить перезагрузку устройств, шаблонов, launchs
	// при изменение каталога app.Config.Folder.ApplicationData 
	let eventChangeConfiguration=vscode.workspace.onDidChangeConfiguration((e) => {
		if(e.affectsConfiguration('fastiot'))
		{
			//e.affectsConfiguration('conf.resource.insertEmptyLastLine')
			// TODO reload settings while the extension is running
			/*
			treeDataDevicesProvider.Config=config;
			treeDataConfigurationsProvider.Config=config;
			treeDataProjectsProvider.Config=config;
			*/
			//vscode.window.showInformationMessage('Changed extension settings: .NET FastIoT');
			//vscode.window.showInformationMessage('You must restart the .NET FastIoT extension or VSCode to apply the new settings');	
		}
    }, undefined, context.subscriptions);
	//FileSystemWatcher
	//- "**/.vscode/launch.json"
	const reloadLaunchs = debounce( () => {
		if(app.Config.Folder.WorkspaceDirectory) {
			const lockFilePath=path.join(app.Config.Folder.WorkspaceDirectory,".vscode",".lockreadlaunch");
			if (!fs.existsSync(lockFilePath)) loadLaunchs();
		}
	});
	const watcher: vscode.FileSystemWatcher =
		vscode.workspace.createFileSystemWatcher("**/{.vscode,.vscode/launch.json}", false, false, false);
	watcher.onDidChange((uri: vscode.Uri) => {
		reloadLaunchs();
	});
	watcher.onDidCreate((uri: vscode.Uri) => {
		reloadLaunchs();
	});
	watcher.onDidDelete((uri: vscode.Uri) => {
		reloadLaunchs();
	});
 	//Subscriptions
	context.subscriptions.push(vscodeTreeViewDevices);
	context.subscriptions.push(vscodeTreeViewLaunchs);
	context.subscriptions.push(vscodeTreeViewTemplates);
	//Commands
	//devices
	//context.subscriptions.push(commandHelloWorld);
	context.subscriptions.push(commandAddDevice);
	context.subscriptions.push(commandDiscoveryDevice);
	context.subscriptions.push(commandRefreshDevices);
	context.subscriptions.push(commandExportDevices);
	context.subscriptions.push(commandImportDevices);
	context.subscriptions.push(commandRenameDevice);
	context.subscriptions.push(commandPingDevice);
	context.subscriptions.push(commandRebootDevice);
	context.subscriptions.push(commandShutdownDevice);
	context.subscriptions.push(commandDeleteDevice);
	context.subscriptions.push(commandOpenFolderKeys);
	context.subscriptions.push(commandOpenSshTerminal);
	context.subscriptions.push(commandCopyToClipboard);
	context.subscriptions.push(commandCheckAllPackages);
	context.subscriptions.push(commandInstallationPackage);
	context.subscriptions.push(commandUpgradePackage);
	context.subscriptions.push(commandRemovePackage);
	context.subscriptions.push(commandTestPackage );
	context.subscriptions.push(commandUpdateDTO);
	context.subscriptions.push(commandAddDTO);
	context.subscriptions.push(commandDeleteDTO);	
	context.subscriptions.push(commandEnableDTO);
	context.subscriptions.push(commandDisableDTO);
	context.subscriptions.push(commandDetectGpiochips);
	//Launchs
	context.subscriptions.push(commandAddLaunch);
	context.subscriptions.push(commandRefreshLaunch);
	context.subscriptions.push(commandRenameLaunch);
	context.subscriptions.push(commandRebuildLaunch);
	context.subscriptions.push(commandDeleteLaunch);
	context.subscriptions.push(commandGoToDevice);
	context.subscriptions.push(commandAddEnviroment);
	context.subscriptions.push(commandRenameEnviroment);
	context.subscriptions.push(commandEditEnviroment);
	context.subscriptions.push(commandDeleteEnviroment);
	context.subscriptions.push(commandChangeOptionLaunch);
	context.subscriptions.push(commandCreateProject);
	context.subscriptions.push(commandReloadTemplates);
	context.subscriptions.push(commandOpenTemplateFolder);
	context.subscriptions.push(commandImportTemplate);
	//events
	context.subscriptions.push(commandRestoreSystemTemplates);
	//other
	//context.subscriptions.push(watcher);
}

// this method is called when your extension is deactivated
export function deactivate(value:string) {}

const debounce = (fn: Function, ms = 200) => {
	let timeoutId: ReturnType<typeof setTimeout>;
	return function (this: any, ...args: any[]) {
	  clearTimeout(timeoutId);
	  timeoutId = setTimeout(() => fn.apply(this, args), ms);
	};
};

function BuildApplication(context: vscode.ExtensionContext):IoTApplication
{
	//Config
	let config=new IotConfiguration(context);
	//UI
	let contextUI:IContexUI= new IoTUI(config.Loglevel);
	//Templates
	//Templates config
	let urlUpdateTemplatesSystem:string="";
	if(config.ExtMode==vscode.ExtensionMode.Production) {
		urlUpdateTemplatesSystem=Constants.urlUpdateTemplatesSystemRelease;
    }else {
		//for test
      	urlUpdateTemplatesSystem=Constants.urlUpdateTemplatesSystemDebug;
    }
	//
    const configTemplateCollection:IConfigEntityCollection = {
		extVersion: config.ExtVersion,
		extMode: config.ExtMode,
		recoverySourcePath: path.join(config.Folder.Extension, "templates", "system"),
		schemasFolderPath: config.Folder.Schemas,
		tempFolderPath:config.Folder.Temp,
  		builtInConfig:config.BuiltInConfig,
		isUpdate:config.IsUpdateEntities,
		updateIntervalHours:config.UpdateIntervalEntitiesHours,
		urlsUpdateEntitiesCommunity:config.ListSourceUpdateTemplateCommunity,
		urlUpdateEntitiesSystem:urlUpdateTemplatesSystem
	};
	const getDirTemplatesCallback = (type:EntityType):string => {
		return config.Folder.GetDirTemplates(type);
	};
	let templates= new IotTemplateCollection(getDirTemplatesCallback,configTemplateCollection);
	//Build
	let app = new IoTApplication(contextUI,config,templates);
	//result
	return app;
}
