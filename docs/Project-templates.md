# Project Templates

**Content**

1. [Template concept](#template-concept)
2. [Template structure](#template-structure)
3. [File structure insert_launch_key.json and insert_tasks_key.json](#file-structure-insertlaunchkeyjson-and-inserttaskskeyjson)
4. [The structure of the template.fastiot.yaml file](#the-structure-of-the-templatefastiotyaml-file)
5. [Algorithm for creating a project](#algorithm-for-creating-a-project)
6. [Data Merge Variables with Template Files](#data-merge-variables-with-template-files)
7. [Debug template](#debugging-the-template)

## Template concept

Templates are used to create projects and add `launch.json` and `tasks.json` files to an existing project. They are located along the path `%userprofile%\fastiot\templates`, for example `C:\Users\Anton\fastiot\templates\`. Templates are divided into the following types:

- `system` - system;
- `community` - communities. Downloaded from third party resources;
- `user` - user. The user can independently create his own custom template.

Templates are listed in load order in the extension. For example, if a template of type `user` has the same identifier `id` of the template with type `system`, then the template of type `user` will be ignored because the template of type `system` is already loaded.

If the system template does not pass the check, it will be automatically deleted and replaced with a valid one. If the system template is deleted, it will also be automatically restored. System templates are automatically updated when you run an extension from [Github devdotnetorg/vscode-extension-dotnet-fastiot/tree/master/templates/system](https://github.com/devdotnetorg/vscode-extension-dotnet-fastiot/tree/ master/templates/system). Further, everything will be discussed using the example of the template [dotnet-console-runtime-info](/templates/system/dotnet-console-runtime-info).

## Template structure

The template is a regular zip archive with the following structure:

- **storage** - folder containing necessary scripts and executable files used in `tasks.json`;
- **template** - folder containing the template itself;
- **template.fastiot.png** - template title image (not used yet);
- **template.fastiot.yaml** - template description in YAML format.

### Folder - storage

Any files can be placed. For example, the **cwRsync** and **ssh** utilities used to remotely login to a device and copy executable binaries. Optionally, you can replace the package by downloading from the official site at [link](https://itefix.net/cwrsync "link").

The **cwRsync** and **ssh** utilities have been moved to the [system application directory](/windows/apps/) to avoid unnecessary increase in the size of the template. Now there is no need to duplicate the specified utilities for each template. It is enough to specify the path to system utilities in the template, for example: "%{extension.apps.builtin.aswindows}\\\\cwrsync\\\\ssh.exe".

### Folder - template

The contents of the folder are the project template itself. This folder must contain the following files in the `.vscode` folder:

- **launch.json** - Launch template, used to create a project;
- **tasks.json** - Tasks template, used to create a project;
- **insert_launch_key.json** - Launch for remote debugging, used when creating a project and adding a separate Launch to an existing project;
- **insert_tasks_key.json** - shared with `insert_launch_key.json`.

### File - template.fastiot.png

Template image in PNG format no larger than 256x256 px.

### File - template.fastiot.yaml

Description of the template in YAML format.

## File structure insert_launch_key.json and insert_tasks_key.json

The `insert_launch_key.json` and `insert_tasks_key.json` files contain an array of values to be inserted into `launch.json` and `tasks.json`. The array must be in the `values` key, i.e.:
```json
{
  "values": [
    {
      "fastiotIdLaunch": "%{launch.id}",
      ...
      "name": "%{launch.label}",
      "type": "coreclr",
      "request": "launch",
      "program": "dotnet",
      ...
    },
    {
      "fastiotIdLaunch": "%{launch.id}-without-logs",
      ...
      "name": "%{launch.label} without logs",
      ...
    }
  ]
}
```

Added support for multiple Launches with overlapping tasks, i.e. if one of the Launches is deleted, the tasks used in the other Launches will not be deleted. Examples of two chains Launch => Tasks:

- `Launch on cubieboard (DotnetApp, Cubieboard, debugvscode)` => fastiot-96534065-build, fastiot-96534065-create-folder, fastiot-96534065-copy-app-to-device;
- `Launch on cubieboard (DotnetApp, Cubieboard, debugvscode) without logs` => fastiot-96534065-build, fastiot-96534065-create-folder, fastiot-96534065-copy-app-to-device-without-logs.

As you can see, the tasks `fastiot-96534065-build` and `fastiot-96534065-create-folder` are common. If you delete Launch `Launch on cubieboard (DotnetApp, Cubieboard, debugvscode)`, then only one task `fastiot-96534065-copy-app-to-device` will be deleted. the other two are used by another Launch. This principle only works for Launches created by this extension.

If the value of the `name` key, e.g. `Launch on cubieboard (DotnetApp, Cubieboard, debugvscode)`, matches existing Launch names, then an increment to the name will be automatically added, e.g. `Launch on cubieboard (DotnetApp, Cubieboard, debugvscode) #1`.

### Additional keys in Launch

Additional keys have been added to Launch, prefixed with `fastiotId*`, keys: `fastiotIdLaunch`, `fastiotIdDevice`, `fastiotProject`, `fastiotIdTemplate`. It is not recommended to change them. some extension functions may not be available because of this.

Starting from version v0.3.3, the above keys are added automatically if they are not present in the template. Those. these keys for the project template are now optional.

Keys:
- `fastiotIdLaunch` - unique Launch identifier;
- `fastiotIdDevice` - unique device identifier;
- `fastiotProject` - unique ID of the template from which Launch was created;
- `fastiotIdTemplate` - the path to the project with which this Launch is associated;
- `fastiotDescription` - (optional) Text description of Launch. Use ` \n` (two spaces and \n) to break a line.

Example:

```json
{
  "fastiotIdLaunch": "2cecf322",
  "fastiotIdDevice": "cubieboard-5e835aae",
  "fastiotProject": "/DotnetConsoleAppRuntimeInfo.csproj",
  "fastiotIdTemplate": "dotnet-console-runtime-info",
  "fastiotDescription": "Launch with logging.  \nRsync copying executable files - project_folder/rsync.log.  \nDebugger - /var/log/vsdbg.log",
  "name": "Launch on cubieboard (DotnetConsoleAppRuntimeInfo, Cubieboard, debugvscode)",
  "type": "coreclr",
  "request": "launch",
  "program": "dotnet",
  ...
  "pipeTransport": {
    "pipeCwd": "${workspaceFolder}",
    ...
  },
  "preLaunchTask": "fastiot-2cecf322-copy-app-to-device"
}
```

### Requirements for the `fastiotIdLaunch` key

In the file `insert_launch_key.json`, the key `fastiotIdLaunch`:

- Must always start with the value `%{launch.id}`, for example: `%{launch.id}-without-logs`;
- Must be unique, for example the values for the first Launch are `%{launch.id}`, the second one is `%{launch.id}-without-logs`.

These conditions must be met to indicate the connectivity of several Launches, otherwise the `Rebuild` command will be executed for only one Launch.

## The structure of the template.fastiot.yaml file

YAML format file, schema for template validation [template.schema](/schemas/template.schema.yaml). Consider the fields:

- `id: dotnet-console-runtime-info` - unique template id, it is recommended to start with the name of the author or organization, for example `anton-dotnet-console` or `contoso-dotnet-console`. This parameter must match the name of the template archive `id: dotnet-console-runtime-info` => `dotnet-console-runtime-info.zip`;
- `platform: - win32 ` is an array of platforms on which this template can be used. The runtime environment for the extension is assumed. At the moment, the extension only works on the `win32` platform. Possible values: `win32`, `linux`;
- `version: "0.1"` - template version;
- `releaseDate: "2023-02-21"` - template release date in YYYY-MM-DD format;
- `forVersionExt: 0.3.0` - the minimum version of the extension that supports the structure of this template;
- `author: DevDotNet.ORG` - template author;
- `emailAuthor: fastiot@devdotnet.org` - email;
- `license: MIT` - license under which the template is distributed;
- `label: .NET Console Application Runtime Info` - template name;
- `detail: Creates a console ...` - a brief description of the template;
- `description: The application displays ...` - detailed description of the template;
- `language: C#` - programming language;
- `endDeviceArchitecture: - armv7l, - aarch64, - x86_64` - array of processor architectures of the end device on which the application will be executed. Possible values: `armv6l`, `armv7l`, `aarch64`, `riscv64`, `x86_64`;
- `dependOnPackages: # Coming in one of the next version` - necessary packages for the application to work on the end device (not used yet);
- `typeProj: dotnet` - project type. Depending on the type, additional template processing logic is generated, for example, a .NET framework version selection window is displayed. All .NET templates require `dotnet`;
- `projName: DotnetConsoleAppRuntimeInfo` - default project name;
- `mainFileProj: dotnetapp.csproj` - path in the template to the main project file. If placed in a folder, then specify, for example, `folder1/dotnetapp.csproj`.
- `mainFileProjLabel: Visual Studio C# Project` - name of the main project file;
- `tags: - console` - array of tags for template search, values can be any (not used yet);
- `filesToProcess: - dotnetapp.csproj, - Program.cs` - array of paths to files in the template to which variable substitution will be applied, for example `%{project.dotnet.targetframework}`. If the file is located in a folder, then specify, for example, `folder1/file.ext`.;
- `fileNameReplacement` - array of values, instructions for renaming files in the format `old_path_as_in_template=new_path_as_in_project`. For example, take the line `dotnetapp.csproj=%{project.name}.csproj`. The `dotnetapp.csproj` file in the project directory will be renamed to `DotnetConsoleAppRuntimeInfo.csproj` based on the substitution variables.

## Algorithm for creating a project

The algorithm is located in the class [IotTemplate](/src/Templates/IotTemplate.ts) function `CreateProject`. The following sequence is performed:

1. The entire `/template` folder is copied from the template to the project directory.
2. A dictionary is created to replace variables such as `%{variable}`.
3. Files are being renamed from the `FileNameReplacement` section, `template.fastiot.yaml` file.
4. Redefining the name of the project based on the previous stage, if any.
5. Substitution of variables for files from the `FilesToProcess` section is performed.
6. Launch is inserted from the `/template/.vscode/insert_launch_key.json` file.
7. Renamed Launch if the names in the project match.
8. Tasks are inserted from the `/template/.vscode/insert_tasks_key.json` file.
9. A folder with projects opens in VSCode.

## Data merge variables with template files

The variables will be considered for the [dotnet-console-runtime-info](/templates/system/dotnet-console-runtime-info) template. Input data:

- device - [cubieboard](https://github.com/devdotnetorg/Cubieboard);
- template - `dotnet-console-runtime-info`;
- path to the template - `C:\Users\Anton\fastiot\templates\system\dotnet-console-runtime-info`;
- project name - `DotnetConsoleAppRuntimeInfo`;
- project save folder `D:\Anton\Projects\Tests\DotnetConsoleAppRuntimeInfo`;
- .NET framework - `.NET 5`.

Variables:

1. "%{project.dotnet.targetframework}" => "net5.0".
2. "%{project.name}" => "DotnetConsoleAppRuntimeInfo".
3. "%{project.mainfile.path.relative.aslinux}" => "/DotnetConsoleAppRuntimeInfo.csproj".
4. "%{project.mainfile.path.relative.aswindows}" => "\\\\DotnetConsoleAppRuntimeInfo.csproj".
5. "%{project.mainfile.path.full.aslinux}" => "D:/Anton/Projects/Tests/DotnetConsoleAppRuntimeInfo/DotnetConsoleAppRuntimeInfo.csproj".
6. "%{project.mainfile.path.full.aswindows}" => "D:\\\\Anton\\\\Projects\\\\Tests\\\\DotnetConsoleAppRuntimeInfo\\\\DotnetConsoleAppRuntimeInfo.csproj".
7. "%{project.path.relative.aslinux}" => "".
8. "%{project.path.relative.aswindows}" => "".
9. "%{project.path.full.ascygdrive}" => "/cygdrive/d/Anton/Projects/Tests/DotnetConsoleAppRuntimeInfo".
10. "%{project.type}" => "dotnet".
11. "%{device.id}" => "cubieboard-5e835aae".
12. "%{device.ssh.key.path.full.aswindows}" => "C:\\\\Users\\\\Anton\\\\fastiot\\\\settings\\\\keys\\\\id-rsa-cubieboard-5e835aae-debugvscode".
13. "%{device.ssh.port}" => "22".
14. "%{device.user.debug}" => "debugvscode".
15. "%{device.host}" => "192.168.43.14".
16. "%{device.label}" => "cubieboard".
17. "%{device.board.name}" => "Cubieboard".
18. "%{launch.id}" => "2cecf322".
19. "%{template.id}" => "dotnet-console-runtime-info".
20. "%{template.storage.path.aswindows}" => "C:\\\\Users\\\\Anton\\\\fastiot\\\\templates\\\\system\\\\dotnet-console-runtime-info\\\\storage".
21. "%{project.dotnet.namespace}" => "DotnetConsoleAppRuntimeInfo".
22. "%{device.dotnet.rid}" => "linux-arm".
23. "%{launch.label}" => "Launch on cubieboard (DotnetConsoleAppRuntimeInfo, Cubieboard, debugvscode)".
24. "%{extension.apps.builtin.aswindows}" => "d:\\\\Anton\\\\GitHub\\\\vscode-extension-dotnet-fastiot\\\\windows\\\\apps".
25. "%{os.userinfo.username}" => "Anton".

**Values when there are directories in the path**

Values of variables with a nested directory, for example, when the project is located not in the root of the `/template` directory, but in the subfolder `/template/nested`. Template [dotnet-console-test-nested](/templates/system/dotnet-console-test-nested). List of variables only those that have been changed due to the presence of a subfolder.

Variables:

1. "%{project.mainfile.path.relative.aslinux}" => "/nested/DotnetConsoleAppTestNested.csproj".
2. "%{project.mainfile.path.relative.aswindows}" => "\\\\nested\\\\DotnetConsoleAppTestNested.csproj".
3. "%{project.mainfile.path.full.aslinux}" => "D:/Anton/Projects/Tests/DotnetConsoleAppTestNested/nested/DotnetConsoleAppTestNested.csproj".
4. "%{project.mainfile.path.full.aswindows}" => "D:\\\\Anton\\\\Projects\\\\Tests\\\\DotnetConsoleAppTestNested\\\\nested\\\\DotnetConsoleAppTestNested.csproj"}.
5. "%{project.path.relative.aslinux}" => "/nested".
6. "%{project.path.relative.aswindows}" => "\\\\nested".
7. "%{project.path.full.ascygdrive}" => "/cygdrive/d/Anton/Projects/Tests/DotnetConsoleAppTestNested/nested".

If you need additional variables, please create an [ISSUE](https://github.com/devdotnetorg/vscode-extension-dotnet-fastiot/issues "ISSUE").

## Debugging the template

All errors related to template validation will be displayed in the OUTPUT window.

If a JSON structure validation error occurs, the OUTPUT window will display the position in the file that caused the error. In this case, the original file will remain unchanged and a new one named `debug_launch_json.txt` or `debug_tasks_json.txt` will be created in the project directory.

The **Fastiot: Debug** parameter in the extension settings enables template debugging mode. This mode displays and saves additional information when creating a project from a template or adding Launch to an existing project. This saves the following information:

- Text files containing the values of the variables to be merged are saved in the project folder. Merging with a template is done in several steps. For example, the first step of a merge saves a file called `Step1CopyValues`. This file contains the values of variables obtained during interactive interaction with the user, in the question-answer mode. Only 5 steps: `Step1CopyValues`, `Step2AddDeviceInfo`, `Step3DependencyProjectType`, `Step4Additional`, `Step5DefinePathToProject`.