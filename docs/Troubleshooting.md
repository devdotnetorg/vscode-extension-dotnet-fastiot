# Troubleshooting

**Content:**

1. [Troubleshoot adding device](#troubleshoot-adding-device)
2. [Problems with launching/operation of the extension](#problems-with-launchingoperation-of-the-extension)

## Troubleshoot adding device

### Device profile not created on first connection

Perform a series of checks to resolve the issue:

1. Check the network availability of the device with the `ping` command, for example `ping 192.168.43.208`;
2. Check the correctness of the login/password, network port (22), connect to the device via the ssh protocol. If you can't connect, log into the device locally and run `sudo systemctl status ssh`. The terminal will most likely display the reason for the failure of the remote connection. The availability of network port 22 is checked with the command: `lsof -i :22`;
3. Make sure that the firewall (may not be installed) in the system is disabled, by default it is ufw. Disable command: `sudo ufw disable`;
4. Update the OpenSSH server on the device:

```bash
sudo apt-get update
sudo dpkg --configure -a
sudo apt-get install -y openssh-server
sudo systemctl reload ssh
sudo systemctl status ssh
```

5. Update the operating system of the device:

```bash
sudo apt-get update
sudo apt-get upgrade
sudo reboot now
```

6. Open the configuration file `/etc/ssh/sshd_config` of the OpenSSH server and check the settings:

```bash
PermitRootLogin yes
PasswordAuthentication yes
ChallengeResponseAuthentication yes
AuthenticationMethods publickey keyboard-interactive password
PubkeyAcceptedAlgorithms=+ssh-rsa
```

If the settings have been changed, then restart the OpenSSH server with the command: `sudo systemctl reload ssh`. And check the status of the service with the command: `sudo systemctl status ssh`.

### The device profile is created, but any task fails with an error

1. Check if the configuration file `/etc/ssh/sshd_config` of the OpenSSH server is correct:

```bash
PermitRootLogin yes
PasswordAuthentication yes
ChallengeResponseAuthentication yes
AuthenticationMethods publickey keyboard-interactive password
PubkeyAcceptedAlgorithms=+ssh-rsa
```

2. Check the ability to elevate privileges to the root level on the device with the `sudo` command, for example `sudo su`;

3. There may be problems with the key algorithm, you can change the algorithm used to generate the key and its length in the extension settings.

### The device profile is being created, but some tasks fail with an error

If the running task ends with an error, then the script that caused the error remains on the device itself. You can try running the script on the device manually. Path to script on device for `debugvscode` user: `/home/debugvscode/vscode-dotnetfastiot.sh`, for `root` user: `/root/vscode-dotnetfastiot.sh`. The input parameters for the script are described in the comments of the script itself.

## Problems with launching/operation of the extension

If for some reason the extension does not work or works with errors, then one of the ways to solve the problem is to completely delete the current extension settings.

The extension settings are stored in a json file along the path `%userprofile%\AppData\Roaming\Code\User\settings.json`, for example `C:\Users\Anton\AppData\Roaming\Code\User\settings.json`.

In the `settings.json` file, all extension-related settings start with `fastiot.*`. To solve the problem, close VSCode, delete all settings in the `settings.json` file that start with `fastiot.*`, start VSCode.

If the problems persist, then you should delete/rename the extension folder where keys, templates, etc. are stored. Folders to delete/rename:

- `C:\RemoteCode\`;
- `%userprofile%\fastiot`, for example `C:\Users\Anton\fastiot`.

If problems persist after restarting the extension, then the problems may be related to granting access rights to the above folders.
