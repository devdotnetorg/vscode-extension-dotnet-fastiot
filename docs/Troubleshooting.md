# Troubleshooting

**Content:**

1. [Show debug information](#show-debug-information)
2. [Troubleshoot adding a device](#troubleshoot-adding-a-device)
3. [Troubleshooting running bash scripts on the device](#troubleshooting-running-bash-scripts-on-the-device)
4. [Trouble launching/running the extension](#trouble-launchingrunning-the-extension)
5. [Problem loading system templates](#problem-loading-system-templates)

## Show debug information

By default, `Information` level messages are displayed in the OUTPUT window. To display debugging information, you need to change the **Fastiot: Loglevel** parameter to the `Debug` value in the extension settings.

## Troubleshoot adding a device

### Network availability

While connecting to the device, a detailed connection test report is displayed:

```bash
checklist:
✔️ IP-Address defined;
✔️ Host availability. Command: "ping";
✔️ Port 22 availability;
✔️ Authorization via ssh protocol.
```

The first three points are about network accessibility. If the check does not reach the last point, then the device is not available over the network. To resolve the network availability issue, check the following points:

1. Physical connection of the device to the network;
2. Check the network availability of the device with the `ping` command, for example `ping 192.168.43.208`;
3. Check if the network port `22` is open, check with the command on the device itself: `lsof -i :22`;
4. Make sure that the firewall (may not be installed) in the system is disabled, by default it is ufw. Disable command: `sudo ufw disable`.

If only the `Authorization via ssh protocol` item is not executed, then the device is available over the network and you can connect to port `22`.

### Troubleshooting connecting to an ssh server

Failure to complete the `Authorization via ssh protocol` means there are problems connecting to the OpenSSH server.

There are three main reasons:

1. Problems with the operation of the operating system executable files and the OpenSSH server;
2. Incorrect parameters login, password, connection port;
3. Problems with configuration files.

**Problems with the operation of the operating system executable files and the OpenSSH server**

To eliminate problems related to the execution of files, update the operating system and the OpenSSH server. Run the following commands on the device itself:

```bash
sudo apt-get update
sudo apt-get upgrade
sudo apt-get install -y openssh-server
```

Reboot the device with the command:

```bash
sudo reboot now
```

If the problem has not been resolved, then proceed to the next section.

**Incorrect login, password, connection port parameters**

When connecting to the device, check the username and password. The same credentials must be verified when logging in locally on the device. Check the availability of port `22` using a remote connection terminal such as [MobaXterm](https://mobaxterm.mobatek.net/download.html "MobaXterm Xserver with SSH, telnet, RDP, VNC and X11").

If the problem has not been resolved, then proceed to the next section.

**Problems with configuration files**

The OpenSSH server configuration files are located in the `/etc/ssh` folder. Open the configuration file `/etc/ssh/sshd_config` of the OpenSSH server and check the settings:

```bash
PermitRootLogin yes
PasswordAuthentication yes
ChallengeResponseAuthentication yes
AuthenticationMethods publickey keyboard-interactive password
```

If the settings have been changed, then restart the OpenSSH server with the command: `sudo systemctl reload ssh`. And check the status of the service with the command: `sudo systemctl status ssh`.

If you can't solve the problem, then replace the configuration file `sshd_config` in the path `/etc/ssh/sshd_config` with [base](/linux/config/sshd_config), then restart the OpenSSH server.

If you still can't solve the problem, then you can completely remove the OpenSSH server and initialize the default settings. ☢️ `nuclear option` method:

```bash
sudo systemctl stop ssh
sudo apt-get update
sudo apt-get remove -y --purge openssh-server
sudo apt -y autoremove
sudo ls -l /var/lib/dpkg/info | grep -i openssh-server
sudo mv /var/lib/dpkg/info/openssh-server.* /tmp
sudo rm -rfv /etc/ssh/
sudo apt-get update
sudo apt-get install -y openssh-server
sudo systemctl status ssh
```

Don't forget to add the following lines to the `/etc/ssh/sshd_config` file:

```bash
PermitRootLogin yes
PasswordAuthentication yes
ChallengeResponseAuthentication yes
AuthenticationMethods publickey keyboard-interactive password
```

And restart the OpenSSH server with the command: `sudo systemctl reload ssh`. Then check the status of the OpenSSH server with the command: `sudo systemctl status ssh`.

If you encounter problems with the configuration files, then follow these steps:

```bash
sudo dpkg --configure -a
sudo dpkg --configure openssh-server
sudo apt-get install -f
```

If the problem has not been resolved, then the problem may be related to the key algorithm that is used to control the device and perform remote debugging. You can change the algorithm used to generate the key and its length in the extension settings.

If you still can't solve the problem, then create an [Issue](https://github.com/devdotnetorg/vscode-extension-dotnet-fastiot/issues). I've run out of ideas for this.

## Troubleshooting running bash scripts on the device

1. Check the ability to elevate privileges to the root level on the device with the `sudo` command, for example `sudo su`;
2. Error message. All actions are performed by running bash scripts on the device. If the bash script fails, the OUTPUT window will display an error message and an error code. For example, the script will install the non-existent package `abyur-abyur`, command:

```bash
sudo apt-get install -y abyur-abyur
```

The following message will appear in the window:

```bash
STDERR: ERROR: Unable to locate package abyur-abyur
CODEERR: 100
-------------Result -------------
status: ERROR
Message: The execution of the installpackagedemo.sh script ended with an error.
----------------------------------
```

The script that caused the error, `installpackagedemo.sh`, is located in the [bashscript](/bashscript/) folder.

The error message is `STDERR: ERROR: Unable to locate package abyur-abyur`. `ERROR` - critical error, further execution of the script is impossible.

The string `CODEERR: 100`, the error code is 100.

If there is `WARNING`, then the script will continue its execution. Message example:

```bash
STDERR: WARNING: https://download.mono-project.com/repo/ubuntu/dists/stable-focal/InRelease: Key is stored in legacy trusted.gpg keyring (/etc/apt/trusted.gpg), see the DEPRECATION section in apt-key(8) for details.
```

3. Run the script directly on the device. If the running task ends with an error, then the script that caused the error remains on the device itself. You can try running the script on the device manually. Path to script on device for `debugvscode` user: `/home/debugvscode/vscode-dotnetfastiot.sh`, for `root` user: `/root/vscode-dotnetfastiot.sh`. The input parameters for the script are described in the comments of the script itself.

Running the script:

```bash
chmod +x vscode-dotnetfastiot.sh
./vscode-dotnetfastiot.sh
```

## Trouble launching/running the extension

If for some reason the extension does not work or works with errors, then one of the ways to solve the problem is to completely delete the current extension settings.

The extension settings are stored in a json file along the path `%userprofile%\AppData\Roaming\Code\User\settings.json`, for example `C:\Users\Anton\AppData\Roaming\Code\User\settings.json`.

In the `settings.json` file, all extension-related settings start with `fastiot.*`. To solve the problem, close VSCode, delete all settings in the `settings.json` file that start with `fastiot.*`, start VSCode.

If the problems persist, then you should delete/rename the extension folder where keys, templates, etc. are stored. Folders to delete/rename:

- `C:\RemoteCode\`;
- `%userprofile%\fastiot`, for example `C:\Users\Anton\fastiot`.

After running the extension, there should be the following folder structure along the path `%userprofile%\fastiot`:

```bash
.
└── fastiot
    ├── settings
    │   └── keys
    ├── templates
    │   ├── community
    │   ├── system
    │   │   ├── dotnet-console
    │   │   │   ├── storage
    │   │   │   ├── template
    │   │   │   │   ├── dotnetapp.csproj
    │   │   │   │   └── Program.cs
    │   │   │   ├── template.fastiot.png
    │   │   │   └── template.fastiot.yaml
    │   │   ├── dotnet-console-runtime-info
    │   │   │   └── ...
    │   │   └── dotnet-iot-blink-led
    │   │       └── ...
    │   ├── user
    │   └── webapi
    └── tmp
```

If problems persist after restarting the extension, then the problems may be related to granting access rights to the above folders.

The executable extension files are located in the `%USERPROFILE%\.vscode\extensions` folder, for example `C:\Users\Anton\.vscode\extensions`. You can remove the extension from the specified folder and reinstall it.

## Problem loading system templates

If you are having trouble loading system templates, you can either run the `Restore/upgrade system templates (offline)` command from the `Templates` window menu, or delete the existing system templates and restart VSCode. When you run the extension, the templates will be automatically restored.