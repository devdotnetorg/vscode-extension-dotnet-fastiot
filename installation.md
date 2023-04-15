# Installation

## Prerequisites 

- node (> v14.16)
- npm 
- .NET SDK 5.0

## Install Node.js

- Download Node.js https://nodejs.org/dist/v14.16.0/
- Unpack to folder: `{folder_nodejs}`
- For windows 7 set environment variable: NODE_SKIP_PLATFORM_CHECK=1
- Add to environment variable Path: `{folder_nodejs}`
- Execute command: npm config --global set cache "`{folder_nodejs}`\\npm-cache"
- Execute command: npm config --global set prefix "`{folder_nodejs}`"
- Execute command: npm config ls -l

## Install steps

- Clone repository and `cd` into it
- Execute command: npm install
- Open in Visual Studio Code (`code .`)
- Press <kbd>F5</kbd> to debug.
