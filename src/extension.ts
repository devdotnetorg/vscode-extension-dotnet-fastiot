// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
//shared
import {IoTHelper} from './Helper/IoTHelper';
import {IotConfiguration} from './Configuration/IotConfiguration';
import {IotItemTree} from './IotItemTree';
import {IotResult,StatusResult} from './IotResult';
//UI
import {IoTUI} from './ui/IoTUI';
import {StatusBarBackgroundItem} from './ui/StatusBarBackgroundItem';
//Devices
import {TreeDataDevicesProvider} from './TreeDataDevicesProvider';
import {IotDevice} from './IotDevice';
import {IotDevicePackage} from './IotDevicePackage';
import {IotDeviceDTO} from './IotDeviceDTO';
import {IotDeviceGpiochip} from './IotDeviceGpiochip';

//Devices.actions
import {addDevice} from './actionsDevice/addDevice';
import {refreshDevices} from './actionsDevice/refreshDevices';
import {exportDevices,importDevices} from './actionsDevice/exportImportDevices';
import {deleteDevice} from './actionsDevice/deleteDevice';
import {connectionTestDevice} from './actionsDevice/connectionTestDevice';
import {rebootDevice} from './actionsDevice/rebootDevice';
import {shutdownDevice} from './actionsDevice/shutdownDevice';
import {renameDevice} from './actionsDevice/renameDevice';
import {detectGpiochips} from './actionsDevice/detectGpiochips';
import {copyTexttoClipboard} from './actionsDevice/copyTexttoClipboard';
import {openFolderKeys} from './actionsDevice/openFolderKeys';
import {checkAllPackages} from './actionsDevice/checkAllPackages';
import {installPackage} from './actionsDevice/installPackage';
import {upgradePackage} from './actionsDevice/upgradePackage';
import {uninstallPackage} from './actionsDevice/uninstallPackage';
import {testPackage} from './actionsDevice/testPackage';

import {refreshDTO} from './actionsDevice/refreshDTO';
import {addDTO} from './actionsDevice/addDTO';
import {deleteDTO} from './actionsDevice/deleteDTO';
import {enableDTO} from './actionsDevice/enableDTO';
import {disableDTO} from './actionsDevice/disableDTO';

//Configurations
import {TreeDataLaunchsProvider} from './TreeDataLaunchsProvider';
import {TreeDataTemplatesProvider} from './TreeDataTemplatesProvider';
import {IotLaunch} from './IotLaunch';
import {IotLaunchEnvironment} from './IotLaunchEnvironment';

//actionsLaunch.actions
import {addLaunch} from './actionsLaunch/addLaunch';
import {addEnviroment,renameEnviroment,editEnviroment,deleteEnviroment} from './actionsLaunch/managementEnviroment';
import {gotoDevice} from './actionsLaunch/gotoDevice';
import {renameLaunch} from './actionsLaunch/renameLaunch';
import {refreshLaunch} from './actionsLaunch/refreshLaunch';
import {deleteLaunch} from './actionsLaunch/deleteLaunch';
import {rebuildLaunch} from './actionsLaunch/rebuildLaunch';

//Template.actions
import {createProject} from './actionsTemplates/createProject';
import {reloadTemplates} from './actionsTemplates/reloadTemplates';
import {openTemplateFolder} from './actionsTemplates/openTemplateFolder';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export async function activate(context: vscode.ExtensionContext) {
	
	console.log('Congratulations, your extension "vscode-extension-dotnet-fastiot" is now active!');
	//versionExt
	const versionExt=context.extension.packageJSON.version;
	//GUI design
	//OutputChannel
	const outputChannel = vscode.window.createOutputChannel(".NET FastIoT");
	//StatusBar
	let statusBarBackground= new StatusBarBackgroundItem(
		vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 1000));
	let contextUI= new IoTUI(outputChannel,statusBarBackground);
	//Output
	contextUI.Output("Welcome to .NET FastIoT!");	
	contextUI.Output("----------------------------------");
	contextUI.Output(`Version: ${versionExt}`);	
	contextUI.Output("Feedback: fastiot@devdotnet.org");
	contextUI.Output("Site: https://devdotnet.org/tag/fastiot/");
	contextUI.Output("GitHub: https://github.com/devdotnetorg/vscode-extension-dotnet-fastiot");
	contextUI.Output("----------------------------------");
	//Get config
	let config=new IotConfiguration(context,versionExt,contextUI);
	config.LoadTemplatesAsync();
	//TreeView Devices
	//read JSON devices
	const jsonDevices=vscode.workspace.getConfiguration().get('fastiot.device.all.JSON');	 
    let treeDataDevicesProvider = new TreeDataDevicesProvider(SaveDevicesCallback, config,jsonDevices,contextUI);
    let vscodeTreeViewDevices=vscode.window.createTreeView('viewDevices', {
		treeDataProvider: treeDataDevicesProvider
	});
	//TreeView Launchs
	const workspaceFolder=IoTHelper.GetWorkspaceFolder();
    let treeDataLaunchsProvider = new TreeDataLaunchsProvider(config,treeDataDevicesProvider.RootItems,
		workspaceFolder);
	const loadLaunchs = async () => {
		const result= await treeDataLaunchsProvider.RecoveryLaunchsAsync();
		if(result.Status==StatusResult.Error&&result.tag!="404") {
			outputChannel.appendLine("-------- Loading launchs -------");
			outputChannel.appendLine(`Status: ${result.Status.toString()}`);
			outputChannel.appendLine(`Message: ${result.Message}`);
			outputChannel.appendLine(`System message: ${result.SystemMessage}`);
			outputChannel.appendLine("----------------------------------");
			vscode.window.showErrorMessage(`Error. Loaded Launchs! \n${result.Message}. ${result.SystemMessage}`);
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
		addDevice(treeDataDevicesProvider,vscodeTreeViewDevices,contextUI);	
	});
	//Refresh Devices
	let commandRefreshDevices = vscode.commands.registerCommand('viewDevices.RefreshDevices', () => {			
		//vscodeTreeViewDevices
		//treeDataDevicesProvider
		treeDataDevicesProvider.RootItems.forEach(element =>
			{
				//element.tooltip= element.tooltip+" new";
			});
		refreshDevices(treeDataDevicesProvider);	
	});
	//Export devices
	let commandExportDevices = vscode.commands.registerCommand('viewDevices.ExportDevices', () => {					
		exportDevices(treeDataDevicesProvider,contextUI);
	});
	//Import devices	
	let commandImportDevices = vscode.commands.registerCommand('viewDevices.ImportDevices', () => {					
		importDevices(treeDataDevicesProvider,contextUI);
	});
	//Rename Device
	let commandRenameDevice = vscode.commands.registerCommand("viewDevices.RenameDevice", (item:IotDevice) => {
		renameDevice(treeDataDevicesProvider,item,contextUI);
	});
	//Ping Device
	let commandPingDevice = vscode.commands.registerCommand("viewDevices.ConnectionTestDevice", (item:IotDevice) => {
		connectionTestDevice(treeDataDevicesProvider,item,contextUI);
	});
	//Reboot Device
	let commandRebootDevice = vscode.commands.registerCommand("viewDevices.RebootDevice", (item:IotDevice) => {
		rebootDevice(treeDataDevicesProvider,item,undefined,contextUI);
	});
	//Shutdown Device
	let commandShutdownDevice = vscode.commands.registerCommand("viewDevices.ShutdownDevice", (item:IotDevice) => {
		shutdownDevice(treeDataDevicesProvider,item,undefined,contextUI);
	});
	//Delete Device
	let commandDeleteDevice = vscode.commands.registerCommand("viewDevices.DeleteDevice", (item:IotDevice) => {
		deleteDevice(treeDataDevicesProvider,item,contextUI);
	});
	//Open folder with ssh keys
	let commandOpenFolderKeys = vscode.commands.registerCommand("viewDevices.OpenFolderSshKeys", () => {
		openFolderKeys(treeDataDevicesProvider);
	});
	//Copy To Clipboard
	let commandCopyToClipboard = vscode.commands.registerCommand("viewDevices.CopyToClipboard", (item:IotItemTree) => {
		copyTexttoClipboard(item);
	});
	//Check all packages
	let commandCheckAllPackages = vscode.commands.registerCommand("viewDevices.CheckAllPackages", (item:IotDevicePackage) => {
		checkAllPackages(treeDataDevicesProvider,item.Device,contextUI);		 
	});
	//Package installation 
	let commandInstallationPackage = vscode.commands.registerCommand("viewDevices.InstallationPackage", (item:IotDevicePackage) => {
		installPackage(treeDataDevicesProvider,item,contextUI);		 
	});
	//Package upgrade
	let commandUpgradePackage = vscode.commands.registerCommand("viewDevices.UpgradePackage", (item:IotDevicePackage) => {
		upgradePackage(treeDataDevicesProvider,item,contextUI);
	});
	//Remove package 
	let commandRemovePackage = vscode.commands.registerCommand("viewDevices.RemovePackage", (item:IotDevicePackage) => {
		uninstallPackage(treeDataDevicesProvider,item,contextUI); 
	});
	//Test package 
	let commandTestPackage = vscode.commands.registerCommand("viewDevices.TestPackage", (item:IotDevicePackage) => {		
		testPackage(treeDataDevicesProvider,item,contextUI); 
	});
	//Update DTO
	let commandUpdateDTO = vscode.commands.registerCommand("viewDevices.UpdateDTO", (item:IotDeviceDTO) => {
		refreshDTO(treeDataDevicesProvider,item.Device,contextUI); 
	});
	let commandAddDTO = vscode.commands.registerCommand("viewDevices.AddDTO", (item:IotDeviceDTO) => {
		addDTO(treeDataDevicesProvider,item.Device,contextUI);		
	});
	let commandDeleteDTO = vscode.commands.registerCommand("viewDevices.DeleteDTO", (item:IotDeviceDTO) => {
		deleteDTO(treeDataDevicesProvider,item,contextUI);
	});
	let commandEnableDTO = vscode.commands.registerCommand("viewDevices.EnableDTO", (item:IotDeviceDTO) => {
		enableDTO(treeDataDevicesProvider,item,contextUI);
	});
	let commandDisableDTO = vscode.commands.registerCommand("viewDevices.DisableDTO", (item:IotDeviceDTO) => {
		disableDTO(treeDataDevicesProvider,item,contextUI);
	});
	//GPIO detect
	let commandDetectGpiochips = vscode.commands.registerCommand("viewDevices.DetectGpiochips", (item:IotDeviceGpiochip) => {
		detectGpiochips(treeDataDevicesProvider,item.Device,contextUI);
	});
	//Add new launch		  
	let commandAddLaunch = vscode.commands.registerCommand('viewLaunchs.Add', () => {	
		addLaunch(treeDataLaunchsProvider,treeDataDevicesProvider.RootItems,contextUI);	
	});
	//Refresh Configurations
	let commandRefreshLaunch = vscode.commands.registerCommand('viewLaunchs.Refresh', () => {
		refreshLaunch(treeDataLaunchsProvider);		
	});
	//Rename Configuration
	let commandRenameLaunch = vscode.commands.registerCommand('viewLaunchs.Rename', 
		(item:IotLaunch) => {
			renameLaunch(treeDataLaunchsProvider,item,contextUI);
	});
	//Delete Configuration
	let commandDeleteLaunch = vscode.commands.registerCommand('viewLaunchs.Delete', 
		(item:IotLaunch) => {
			deleteLaunch(treeDataLaunchsProvider,item,contextUI);
	});
	//Rebuild Configuration
	let commandRebuildLaunch = vscode.commands.registerCommand('viewLaunchs.Rebuild', 
		(item:IotLaunch) => {
			rebuildLaunch(treeDataLaunchsProvider,item,contextUI);
	});
	//Go to device 
	let commandGoToDevice = vscode.commands.registerCommand('viewLaunchs.GoToDevice', 
		(item:IotLaunch) => {
			gotoDevice(treeDataLaunchsProvider,item,vscodeTreeViewDevices);
	});
	//Add Enviroment
	let commandAddEnviroment = vscode.commands.registerCommand('viewLaunchs.AddEnviroment',
		(item:IotLaunchEnvironment) => {
			addEnviroment(treeDataLaunchsProvider,item);
	});
	//Rename Enviroment
	let commandRenameEnviroment = vscode.commands.registerCommand('viewLaunchs.RenameEnviroment',
		(item:IotLaunchEnvironment) => {
			renameEnviroment(treeDataLaunchsProvider,item);
	});
	//Edit Enviroment
	let commandEditEnviroment = vscode.commands.registerCommand('viewLaunchs.EditEnviroment', 
		(item:IotLaunchEnvironment) => {
			editEnviroment(treeDataLaunchsProvider,item);
	});
	//Delete Enviroment
	let commandDeleteEnviroment = vscode.commands.registerCommand('viewLaunchs.DeleteEnviroment', 
		(item:IotLaunchEnvironment) => {
			deleteEnviroment(treeDataLaunchsProvider,item);		
	});
	//Create project
	let commandCreateProject = vscode.commands.registerCommand('viewTemplates.CreateProject', () => {	
			createProject(treeDataLaunchsProvider,treeDataDevicesProvider.RootItems,context,contextUI);	
	});
	//Reload templates
	let commandReloadTemplates = vscode.commands.registerCommand('viewTemplates.ReloadTemplates', () => {	
			reloadTemplates(treeDataLaunchsProvider);	
	});
	//Open template folder
	let commandOpenTemplateFolder = vscode.commands.registerCommand('viewTemplates.OpenTemplateFolder', () => {	
			openTemplateFolder(treeDataLaunchsProvider);	
	});
	//Events
	//Extension configuration change event 
	let eventChangeConfiguration=vscode.workspace.onDidChangeConfiguration((e) => {		
		if(e.affectsConfiguration('fastiot'))
		{
			/*
			treeDataDevicesProvider.Config=config;
			treeDataConfigurationsProvider.Config=config;
			treeDataProjectsProvider.Config=config;
			*/
			vscode.window.showInformationMessage('Changed extension settings: .NET FastIoT');
			//vscode.window.showInformationMessage('You must restart the .NET FastIoT extension or VSCode to apply the new settings');	
		}
    }, undefined, context.subscriptions);	
	//Subscriptions
	context.subscriptions.push(outputChannel);
	context.subscriptions.push(vscodeTreeViewDevices);
	context.subscriptions.push(vscodeTreeViewLaunchs);
	context.subscriptions.push(vscodeTreeViewTemplates);

	//Commands
	//devices
	//context.subscriptions.push(commandHelloWorld);
	context.subscriptions.push(commandAddDevice);
	context.subscriptions.push(commandRefreshDevices);
	context.subscriptions.push(commandExportDevices);
	context.subscriptions.push(commandImportDevices);
	context.subscriptions.push(commandRenameDevice);
	context.subscriptions.push(commandPingDevice);
	context.subscriptions.push(commandRebootDevice);
	context.subscriptions.push(commandShutdownDevice);
	context.subscriptions.push(commandDeleteDevice);
	context.subscriptions.push(commandOpenFolderKeys);
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
	context.subscriptions.push(commandCreateProject);
	context.subscriptions.push(commandReloadTemplates);
	context.subscriptions.push(commandOpenTemplateFolder);
	//events
	context.subscriptions.push(eventChangeConfiguration);
}

// this method is called when your extension is deactivated
export function deactivate(value:string) {}

function SaveDevicesCallback(data:any):void
{
	vscode.workspace.getConfiguration().update('fastiot.device.all.JSON',data,true);	
}
