// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
//shared
import {GetWorkspaceFolder} from './Helper/IoTHelper';
import {IotConfiguration} from './Configuration/IotConfiguration';
import { IotItemTree } from './IotItemTree';

//Devices
import { TreeDataDevicesProvider } from './TreeDataDevicesProvider';
import { IotDevice } from './IotDevice';
import { IotDevicePackage } from './IotDevicePackage';
import { IotDeviceDTO } from './IotDeviceDTO';
import { IotDeviceGpiochip } from './IotDeviceGpiochip';

//Devices.actions
import { addDevice } from './actionsDevice/addDevice';
import { refreshDevices } from './actionsDevice/refreshDevices';
import { exportDevices,importDevices } from './actionsDevice/exportImportDevices';
import { deleteDevice } from './actionsDevice/deleteDevice';
import { pingDevice } from './actionsDevice/pingDevice';
import { rebootDevice } from './actionsDevice/rebootDevice';
import {shutdownDevice } from './actionsDevice/shutdownDevice';
import { renameDevice } from './actionsDevice/renameDevice';
import { detectGpiochips } from './actionsDevice/detectGpiochips';
import { copyTexttoClipboard } from './actionsDevice/copyTexttoClipboard';
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

//Configurations
import { TreeDataConfigurationsProvider } from './TreeDataConfigurationsProvider';
import { TreeDataProjectsProvider } from './TreeDataProjectsProvider';
import { IotLaunchConfiguration } from './IotLaunchConfiguration';
import { IotLaunchEnvironment } from './IotLaunchEnvironment';


//Configurations.actions
import { addConfiguration } from './actionsConfiguration/addConfiguration';
import { refreshConfigurations } from './actionsConfiguration/refreshConfigurations';
import { renameConfiguration } from './actionsConfiguration/renameConfiguration';
import { rebuildConfiguration } from './actionsConfiguration/rebuildConfiguration';
import { deleteConfiguration } from './actionsConfiguration/deleteConfiguration';
import { gotoDevice } from './actionsConfiguration/gotoDevice';
import { addEnviroment,renameEnviroment,editEnviroment,deleteEnviroment } from './actionsConfiguration/managementEnviroment';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export async function activate(context: vscode.ExtensionContext) {
	
	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "vscode-extension-dotnet-fastiot" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	//OutputChannel
	const versionExt=context.extension.packageJSON.version;
	const outputChannel = vscode.window.createOutputChannel(".NET FastIoT");
	outputChannel.appendLine("Welcome to .NET FastIoT!");	
	outputChannel.appendLine("----------------------------------");
	outputChannel.appendLine(`Version: ${versionExt}`);	
	outputChannel.appendLine("Feedback: fastiot@devdotnet.org");
	outputChannel.appendLine("----------------------------------");
	//TreeView Devices
	let statusBarItemDevice = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 1000);
	//statusBarItem.color="red";	
	statusBarItemDevice.hide();
	//Log function
	const logCallback = (value:string) => {
		outputChannel.appendLine(value);
	  };
	//Get config
	let config=new IotConfiguration(context,logCallback,versionExt);
	//read JSON devices
	const jsonDevices=vscode.workspace.getConfiguration().get('fastiot.device.all.JSON');	 
    let treeDataDevicesProvider = new TreeDataDevicesProvider(outputChannel,statusBarItemDevice,
		SaveDevicesCallback,config,jsonDevices);	
    let vscodeTreeViewDevices=vscode.window.createTreeView('viewDevices', {
		treeDataProvider: treeDataDevicesProvider
	  });
	
	//TreeView Configurations
	let statusBarItemConfiguration = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 1000);	
	statusBarItemConfiguration.hide();
	const workspaceFolder=GetWorkspaceFolder();
    let treeDataConfigurationsProvider = new TreeDataConfigurationsProvider(statusBarItemConfiguration,
		config,treeDataDevicesProvider.RootItems,workspaceFolder);	
    let vscodeTreeViewConfigurations=vscode.window.createTreeView('viewConfigurations', {
		treeDataProvider: treeDataConfigurationsProvider
	  });

	//TreeView Projects	
    let treeDataProjectsProvider = new TreeDataProjectsProvider();	
    let vscodeTreeViewProjects=vscode.window.createTreeView('viewProjects', {
		treeDataProvider: treeDataProjectsProvider
	  });
	vscodeTreeViewProjects.description="Create a project from a template";
	//Commands
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
	
	//Add new device		  
	let commandAddDevice = vscode.commands.registerCommand('viewDevices.AddDevice', () => {	
		addDevice(treeDataDevicesProvider,vscodeTreeViewDevices);	
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
		exportDevices(treeDataDevicesProvider);
	});
	//Import devices	
	let commandImportDevices = vscode.commands.registerCommand('viewDevices.ImportDevices', () => {					
		importDevices(treeDataDevicesProvider);
	});
	//Rename Device
	let commandRenameDevice = vscode.commands.registerCommand("viewDevices.RenameDevice", (item:IotDevice) => {
		renameDevice(treeDataDevicesProvider,item);
	});
	//Ping Device
	let commandPingDevice = vscode.commands.registerCommand("viewDevices.PingDevice", (item:IotDevice) => {
		pingDevice(treeDataDevicesProvider,item);
	});
	//Reboot Device
	let commandRebootDevice = vscode.commands.registerCommand("viewDevices.RebootDevice", (item:IotDevice) => {
		rebootDevice(treeDataDevicesProvider,item,undefined);
	});
	//Shutdown Device
	let commandShutdownDevice = vscode.commands.registerCommand("viewDevices.ShutdownDevice", (item:IotDevice) => {
		shutdownDevice(treeDataDevicesProvider,item,undefined);
	});
	//Delete Device
	let commandDeleteDevice = vscode.commands.registerCommand("viewDevices.DeleteDevice", (item:IotDevice) => {
		deleteDevice(treeDataDevicesProvider,item);
	});
	//Copy To Clipboard
	let commandCopyToClipboard = vscode.commands.registerCommand("viewDevices.CopyToClipboard", (item:IotItemTree) => {
		copyTexttoClipboard(item);
	});
	//Check all packages
	let commandCheckAllPackages = vscode.commands.registerCommand("viewDevices.CheckAllPackages", (item:IotDevicePackage) => {
		checkAllPackages(treeDataDevicesProvider,item.Device);		 
	});
	//Package installation 
	let commandInstallationPackage = vscode.commands.registerCommand("viewDevices.InstallationPackage", (item:IotDevicePackage) => {
		installPackage(treeDataDevicesProvider,item);		 
	});
	//Package upgrade
	let commandUpgradePackage = vscode.commands.registerCommand("viewDevices.UpgradePackage", (item:IotDevicePackage) => {
		upgradePackage(treeDataDevicesProvider,item);
	});
	//Remove package 
	let commandRemovePackage = vscode.commands.registerCommand("viewDevices.RemovePackage", (item:IotDevicePackage) => {
		uninstallPackage(treeDataDevicesProvider,item); 
	});
	//Test package 
	let commandTestPackage = vscode.commands.registerCommand("viewDevices.TestPackage", (item:IotDevicePackage) => {		
		testPackage(treeDataDevicesProvider,item); 
	});
	//Update DTO
	let commandUpdateDTO = vscode.commands.registerCommand("viewDevices.UpdateDTO", (item:IotDeviceDTO) => {
		refreshDTO(treeDataDevicesProvider,item.Device); 
	});
	let commandAddDTO = vscode.commands.registerCommand("viewDevices.AddDTO", (item:IotDeviceDTO) => {
		addDTO(treeDataDevicesProvider,item.Device);		
	});
	let commandDeleteDTO = vscode.commands.registerCommand("viewDevices.DeleteDTO", (item:IotDeviceDTO) => {
		deleteDTO(treeDataDevicesProvider,item);
	});
	let commandEnableDTO = vscode.commands.registerCommand("viewDevices.EnableDTO", (item:IotDeviceDTO) => {
		enableDTO(treeDataDevicesProvider,item);
	});
	let commandDisableDTO = vscode.commands.registerCommand("viewDevices.DisableDTO", (item:IotDeviceDTO) => {
		disableDTO(treeDataDevicesProvider,item);
	});
	//GPIO detect
	let commandDetectGpiochips = vscode.commands.registerCommand("viewDevices.DetectGpiochips", (item:IotDeviceGpiochip) => {
		detectGpiochips(treeDataDevicesProvider,item.Device);
	});
	//Add new configuration		  
	let commandAddConfiguration = vscode.commands.registerCommand('viewConfigurations.AddConfiguration', () => {	
		addConfiguration(treeDataConfigurationsProvider,treeDataDevicesProvider.RootItems);	
	});
	//Refresh Configurations
	let commandRefreshConfigurations = vscode.commands.registerCommand('viewConfigurations.RefreshConfigurations', () => {
		refreshConfigurations(treeDataConfigurationsProvider);		
	});
	//Rename Configuration
	let commandRenameConfiguration = vscode.commands.registerCommand('viewConfigurations.RenameConfiguration', 
		(item:IotLaunchConfiguration) => {
		renameConfiguration(treeDataConfigurationsProvider,item);
	});
	//Delete Configuration
	let commandDeleteConfiguration = vscode.commands.registerCommand('viewConfigurations.DeleteConfiguration', 
		(item:IotLaunchConfiguration) => {
		deleteConfiguration(treeDataConfigurationsProvider,item);
	});
	//Rebuild Configuration
	let commandRebuildConfiguration = vscode.commands.registerCommand('viewConfigurations.RebuildConfiguration', 
		(item:IotLaunchConfiguration) => {
		rebuildConfiguration(treeDataConfigurationsProvider,item);
	});
	//Go to device 
	let commandGoToDevice = vscode.commands.registerCommand('viewConfigurations.GoToDevice', 
		(item:IotLaunchConfiguration) => {
			gotoDevice(treeDataConfigurationsProvider,item,vscodeTreeViewDevices);
	});
	//Add Enviroment
	let commandAddEnviroment = vscode.commands.registerCommand('viewConfigurations.AddEnviroment',
		(item:IotLaunchEnvironment) => {
		addEnviroment(treeDataConfigurationsProvider,item);
	});
	//Rename Enviroment
	let commandRenameEnviroment = vscode.commands.registerCommand('viewConfigurations.RenameEnviroment',
		(item:IotLaunchEnvironment) => {
		renameEnviroment(treeDataConfigurationsProvider,item);
	});
	//Edit Enviroment
	let commandEditEnviroment = vscode.commands.registerCommand('viewConfigurations.EditEnviroment', 
		(item:IotLaunchEnvironment) => {
		editEnviroment(treeDataConfigurationsProvider,item);
	});
	//Delete Enviroment
	let commandDeleteEnviroment = vscode.commands.registerCommand('viewConfigurations.DeleteEnviroment', 
		(item:IotLaunchEnvironment) => {
		deleteEnviroment(treeDataConfigurationsProvider,item);		
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
	context.subscriptions.push(statusBarItemDevice);
	context.subscriptions.push(outputChannel);
	context.subscriptions.push(vscodeTreeViewDevices);
	context.subscriptions.push(statusBarItemConfiguration);	
	context.subscriptions.push(vscodeTreeViewConfigurations);
	context.subscriptions.push(vscodeTreeViewProjects);

	//Commands
	//devices
	context.subscriptions.push(commandHelloWorld);
	context.subscriptions.push(commandAddDevice);
	context.subscriptions.push(commandRefreshDevices);
	context.subscriptions.push(commandExportDevices);
	context.subscriptions.push(commandImportDevices);
	context.subscriptions.push(commandRenameDevice);
	context.subscriptions.push(commandPingDevice);
	context.subscriptions.push(commandRebootDevice);
	context.subscriptions.push(commandShutdownDevice);
	context.subscriptions.push(commandDeleteDevice);
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
	//configurations
	context.subscriptions.push(commandAddConfiguration);
	context.subscriptions.push(commandRefreshConfigurations);
	context.subscriptions.push(commandRenameConfiguration);
	context.subscriptions.push(commandRebuildConfiguration);
	context.subscriptions.push(commandDeleteConfiguration);
	context.subscriptions.push(commandGoToDevice);
	context.subscriptions.push(commandAddEnviroment);
	context.subscriptions.push(commandRenameEnviroment);
	context.subscriptions.push(commandEditEnviroment);
	context.subscriptions.push(commandDeleteEnviroment);	
	//events
	context.subscriptions.push(eventChangeConfiguration);
}

// this method is called when your extension is deactivated
export function deactivate(value:string) {}

function SaveDevicesCallback(data:any):void
{
	vscode.workspace.getConfiguration().update('fastiot.device.all.JSON',data,true);	
}
