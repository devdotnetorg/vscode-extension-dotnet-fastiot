[![License](https://img.shields.io/badge/License-LGPL3.0-blue.svg)](LICENSE) ![GitHub last commit](https://img.shields.io/github/last-commit/devdotnetorg/vscode-extension-dotnet-fastiot) [![Visual Studio Marketplace](https://img.shields.io/vscode-marketplace/d/devdotnetorg.vscode-extension-dotnet-fastiot.svg)](https://marketplace.visualstudio.com/items?itemName=devdotnetorg.vscode-extension-dotnet-fastiot)

# .NET FastIoT VS Code Extension

[.NET FastIoT Extension](https://marketplace.visualstudio.com/items?itemName=devdotnetorg.vscode-extension-dotnet-fastiot/ ".NET FastIoT Extension") in Visual Studio Code Marketplace.

[README](https://github.com/devdotnetorg/vscode-extension-dotnet-fastiot/blob/master/README.md "README") in English | [README](https://github.com/devdotnetorg/vscode-extension-dotnet-fastiot/blob/master/README_ru.md "README") на русском языке | Habr.com (Russian) - [Easy development of IoT applications in C # for Raspberry Pi and other SBCs, on Linux](https://habr.com/ru/company/timeweb/blog/597601/ "Easy development of IoT applications in C # for Raspberry Pi and other SBCs, on Linux").

This extension allows you configures an ARMv7 or ARMv8 Linux embedded device to run .NET applications, and configures `*.csproj` projects for remote debugging via an ssh-tunnel. This has been tested on Windows (64 bits).

*.NET FastIoT Extension Interface*

![.NET FastIoT title](https://raw.githubusercontent.com/devdotnetorg/vscode-extension-dotnet-fastiot/master/docs/vscode-dotnet-fastiot.png)

![.NET FastIoT title](https://raw.githubusercontent.com/devdotnetorg/vscode-extension-dotnet-fastiot/master/docs/vscode-dotnet-fastiot-interface.png)

## Features

1. Easy installation .NET SDK, .NET Runtimes, .NET Debugger (vsdbg), Libgpiod, Docker for Linux;
2. Setting up .NET projects for remote debugging, adding environment variables (Method [Environment.GetEnvironmentVariable](https://docs.microsoft.com/en-us/dotnet/api/system.environment.getenvironmentvariable "Environment.GetEnvironmentVariable"));
3. Device Tree overlays management. Required to turn on/off devices such as I2C, SPI, PWM, etc. Available remote download of files `* .DTS` and enable/disable "layers". See [Working with GPIO. Part 2. Device Tree overlays (RU)](https://devdotnet.org/post/rabota-s-gpio-na-primere-banana-pi-bpi-m64-chast-2-device-tree-overlays/ "Working with GPIO. Part 2. Device Tree overlays"). Only the [Armbian](https://www.armbian.com/ "Armbian") distribution is supported. To support other distributions, the adapter must be implemented using the [IDtoAdapter.ts](https://github.com/devdotnetorg/vscode-extension-dotnet-fastiot/blob/master/src/DTO/IDtoAdapter.ts "IDtoAdapter.ts") interface. Armbian implementation example - [IoTDTOArmbianAdapter.ts](https://github.com/devdotnetorg/vscode-extension-dotnet-fastiot/blob/master/src/DTO/IoTDTOArmbianAdapter.ts "IoTDTOArmbianAdapter.ts");
4. GPIO pin control (not fully implemented yet). Detecting available Gpiochip ~~and lines. Applying `0/1` to the contact, reading the state of the contact. Generation of C# code for the selected contact for transferring to the project one-to-one.~~

## System requirements

- **OS version .** Windows 7-10 (x64). Linux version coming later;
- **Visual Studio Code.** version not lower than [1.63](https://code.visualstudio.com/ "1.63");
- **.NET.** Compiling a C# project requires [.NET SDK](https://dotnet.microsoft.com/en-us/download/visual-studio-sdks ".NET SDK") depending on which version of your project you are using (the extension itself is not required to work);

Additional extensions required for developing .NET applications:

- [C# for Visual Studio Code (powered by OmniSharp)](https://marketplace.visualstudio.com/items?itemName=ms-dotnettools.csharp "C# for Visual Studio Code (powered by OmniSharp)") — support for C# development ;
- [NuGet Package Manager](https://marketplace.visualstudio.com/items?itemName=jmrog.vscode-nuget-package-manager "NuGet Package Manager") — adding Nuget packages (later the Nuget package manager will be built into the extension);
- [DeviceTree](https://marketplace.visualstudio.com/items?itemName=plorefice.devicetree "DeviceTree") (optional) — Syntax highlighting for DeviceTree (Device Tree, .dts) files in VSCode. For example, it will be required if it becomes necessary to adapt the [SPI LCD ILI9341 (RU)](https://devdotnet.org/post/rabota-s-gpio-v-linux-na-primere-banana-pi-bpi-m64-chast-4-device-tree-overlays-podkluchenie-displey-spi-lcd-ili9341/ "SPI LCD ILI9341") for your SBC.

Third-party applications:

- **cwRsync.** The package uses the rsync and ssh utilities. Included in the extension and copied to the default folder `C:\RemoteCode\cwrsync\ ` (location changes in settings). Optionally, you can replace the package by downloading it from the official website at the [link](https://itefix.net/cwrsync "link"). The [PuTTY](https://www.putty.org/ "PuTTY")  terminal is not used.

Third-party bash scripts to install packages/libraries: 

- [.NET SDK](https://dot.net/v1/dotnet-install.sh ".NET SDK"), [.NET Runtimes](https://dot.net/v1/dotnet-install.sh ".NET Runtimes"), [.NET Debugger (vsdbg)](https://aka.ms/getvsdbgsh ".NET Debugger (vsdbg)"), Libgpiod, [Docker](https://get.docker.com/ "Docker"), are downloaded from the official sites of the package developers, excluding the Libgpiod library. The script for installing this library is downloaded from the GitHub resource — [devdotnetorg/docker-libgpiod](https://raw.githubusercontent.com/devdotnetorg/docker-libgpiod/master/setup-libgpiod.sh "devdotnetorg/docker-libgpiod"). Next, the uploaded script downloads the source code of the library from the official [Libgpiod](https://git.kernel.org/pub/scm/libs/libgpiod/libgpiod.git/ "Libgpiod") repository and compiles the library.

## Getting started

### Step 1 — Preparing the device

The single board computer must be running a Debian distribution or Ubuntu, Linux. For remote access, you need to install an ssh server and configure certain settings. As a terminal for remote access, you can use [MobaXterm](https://mobaxterm.mobatek.net/download.html "MobaXterm") (much more convenient compared to the PuTTY terminal). If the `sudo` is not installed, then install this package as `root` using the commands:

```bash
apt-get update
apt-get install -y sudo
```

To install an ssh-server and configure access, run the following commands on a single board computer: 

```bash
sudo apt-get update
sudo apt-get install -y openssh-server mc
sudo systemctl reload ssh
sudo mcedit /etc/ssh/sshd_config
```

In the editor that opens, set the following parameters. If these parameters are missing, then just insert the line (usually the `AuthenticationMethods` is missing):

```bash
PermitRootLogin yes
PasswordAuthentication yes
ChallengeResponseAuthentication yes
AuthenticationMethods publickey keyboard-interactive password
```

Then save the changes <kbd>F2</kbd> and exit the editor <kbd>F10</kbd>.

Restart the ssh-server to apply the new settings: 

```bash
sudo systemctl reload ssh
sudo systemctl status ssh
```

The last command displays the current status of the service.

Video instruction for setting up an ssh server for connecting an extension:

[![.NET FastIoT. Step 1. Configuring SSH access](https://img.youtube.com/vi/-xgAP1qsVsw/0.jpg)](https://www.youtube.com/watch?v=-xgAP1qsVsw)

### Step 2 — Adding a device

At the first connection, a pair of access keys is created, private and public. The private key is copied to the `C:\RemoteCode\keys\ ` folder (the location is changed in the settings). This key is used to configure the device and start remote debugging.

The important point is choosing an account to create on the device. The first option is the **debugvscode** account (the name can be changed in the settings), the second option is **root**:

*Selecting an account to create on the device*
![VSCode dotnet FastIoT](https://raw.githubusercontent.com/devdotnetorg/vscode-extension-dotnet-fastiot/master/docs/vscode-dotnet-fastiot-select-account.png)

Selecting the **debugvscode** option creates a permissions configuration file [20-gpio-fastiot.rules](https://github.com/devdotnetorg/vscode-extension-dotnet-fastiot/blob/master/vscodetemplates/20-gpio-fastiot.rules "20-gpio-fastiot.rules") to devices using the [udev](https://ru.wikipedia.org/wiki/Udev "udev") subsystem. A group named **iot**is created, and permissions for devices such as: gpiochip, I2C, SPI, PWM, etc. Then the user **debugvscode** is added to this group. Due to the fact that testing was performed only on Armbian, it is possible that not all permissions have been added. Therefore, if you have problems with access rights to devices, then choose — **root**.

*Adding a new device ([YouTube](https://youtu.be/pusO7PV4NL4 "YouTube")):*

![VSCode dotnet FastIoT](https://raw.githubusercontent.com/devdotnetorg/vscode-extension-dotnet-fastiot/master/docs/2_Adding_a_device.gif)

### Step 3 — Installing packages

**Coming soon**

See (YouTube):

1. [Step 1. Configuring SSH access](https://www.youtube.com/watch?v=pusO7PV4NL4 "Step 1. Configuring SSH access")
2. [Step 2. Adding a device](https://www.youtube.com/watch?v=pusO7PV4NL4 "Step 2. Adding a device")
3. [Step 3. Installing packages](https://www.youtube.com/watch?v=Y8U2V0THQh4 "Step 3. Installing packages")
4. [Step 4. Creating a .NET console application and remote debugging](https://www.youtube.com/watch?v=oghH3oHIZgE "Step 4. Creating a .NET console application and remote debugging")
5. [Step 5. Using GPIO. Blink](https://www.youtube.com/watch?v=NQTgP4jwZPg "Step 5. Using GPIO. Blink")

## Known Issues

See [ISSUES.md](https://github.com/devdotnetorg/vscode-extension-dotnet-fastiot/blob/master/ISSUES.md "ISSUES.md") and [Issues](https://github.com/devdotnetorg/vscode-extension-dotnet-fastiot/issues "Issues").

## Feedback

Send your comments by email `fastiot@devdotnet.org`. And check in [Issues](https://github.com/devdotnetorg/vscode-extension-dotnet-fastiot/issues "Issues").

## License

This software is licensed under the terms of the LGPL-3.0 license.

See [LICENSE](https://github.com/devdotnetorg/vscode-extension-dotnet-fastiot/blob/master/LICENSE "LICENSE") for more details.

## Changelog

See [CHANGELOG.md](https://github.com/devdotnetorg/vscode-extension-dotnet-fastiot/blob/master/CHANGELOG.md "CHANGELOG.md").

## Schedule

See [SCHEDULE.md](https://github.com/devdotnetorg/vscode-extension-dotnet-fastiot/blob/master/SCHEDULE.md "SCHEDULE.md").

## Testing

Testing performed on single board computers:

- [Cubieboard](https://github.com/devdotnetorg/Cubieboard "Cubieboard")
- [Cubietruck](https://devdotnet.org/post/otladochnaya-plata-cubietruck/ "Cubietruck")
- [Banana Pi BPI-M64](https://devdotnet.org/post/otladochnaya-plata-banana-pi-bpi-m64/ "Banana Pi BPI-M64")
