# Installation

## for Windows 10

### Prerequisites 

- vscode (v1.78.0)
- python (v3.11.3) 
- node (v16.17.1)
- git
- npm
- .NET SDK 7.0

### Software installation

- Download [vscode 1.78.0](https://update.code.visualstudio.com/1.78.0/win32-x64-archive/stable "1.78.0")
- Unpack to any folder
- Download [python v3.11.3](https://www.python.org/downloads/release/python-3113/ "3.11.3")
- Install python
- Download [node.js v16.17.1](https://nodejs.org/dist/v16.17.1/ "16.17.1")
- Install node.js with Tools for Native Modules (checkbox during installation)
- Download [git](https://git-scm.com/download/win/ "git")
- Install git

## Install steps

- Clone repository and `cd` into it
- Execute command: npm install
- Open in Visual Studio Code (`code .`)
- Press <kbd>F5</kbd> to debug.

## for Windows 7

Only up to extension version v0.3.4 (17-05-2023).

### Prerequisites 

- vscode (v1.70.3, latest version with Windows 7 support)
- python (v3.8.0)
- node (v14.16)
- git
- npm
- .NET SDK 5.0

### Software installation

- Download [vscode 1.70.3](https://az764295.vo.msecnd.net/stable/a21a160d630530476218b85db95b0fd2a8cd1230/VSCodeSetup-x64-1.70.3.exe "1.70.3")
- Unpack to any folder
- Download [python v3.8.0](https://www.python.org/downloads/release/python-380/ "3.8.0")
- Install python
- Download [node.js v14.16](https://nodejs.org/dist/v14.16.0/ "14.16")
- Unpack to folder: `{folder_nodejs}`
- For windows 7 set environment variable: NODE_SKIP_PLATFORM_CHECK=1
- Add to environment variable Path: `{folder_nodejs}`
- Execute command: npm config --global set cache "`{folder_nodejs}`\\npm-cache"
- Execute command: npm config --global set prefix "`{folder_nodejs}`"
- Execute command: npm config ls -l
- Execute command: npm install -g --production windows-build-tools
- Download [git](https://git-scm.com/download/win/ "git")
- Install git
