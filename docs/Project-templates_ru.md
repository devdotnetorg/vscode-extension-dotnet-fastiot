# Шаблоны проектов

**Содержание**

1. [Понятие шаблона](#понятие-шаблона)
2. [Структура шаблона](#структура-шаблона)
3. [Структура файлов insert_launch_key.json и insert_tasks_key.json](#структура-файлов-insertlaunchkeyjson-и-inserttaskskeyjson)
4. [Структура файла template.fastiot.yaml](#структура-файла-templatefastiotyaml)
5. [Алгоритм создания проекта](#алгоритм-создания-проекта)
6. [Переменные слияния данных с файлами шаблона](#переменные-слияния-данных-с-файлами-шаблона)
7. [Отладка шаблона](#отладка-шаблона)

## Понятие шаблона

Шаблоны используются для создания проектов и добавления фалов `launch.json` и `tasks.json` к существующему проекту. Располагаются по пути `%userprofile%\fastiot\templates`, например `C:\Users\Anton\fastiot\templates\`. Шаблоны разделяются на два типа, это системные - `system` и пользовательские - `user`. Если системный шаблон не пройдет проверку, то он автоматически будет удален и заменен на валидный. Если системный шаблон удалить, то он тоже будет автоматически восстановлен. Системные шаблоны автоматически обновляются при запуске расширения с ресурса [Github devdotnetorg/vscode-extension-dotnet-fastiot/tree/master/templates/system](https://github.com/devdotnetorg/vscode-extension-dotnet-fastiot/tree/master/templates/system). Далее, все будет рассмотрено на примере шаблона [dotnet-console-runtime-info](/templates/system/dotnet-console-runtime-info).

## Структура шаблона

Шаблон представляет из себя обычный zip-архив со следующей структурой:

- **storage** - папка содержащая необходимые скрипты и исполняемые файлы, используемые в `tasks.json`;
- **template** - папка содержащая сам шаблон;
- **template.fastiot.png** - титульное изображение шаблона (пока не используется);
- **template.fastiot.yaml** - описание шаблона в формате YAML.

### Папка - storage

Могут размещаться любые файлы. В частности, в папке каждого шаблона размещаются утилиты **cwRsync** и **ssh** используемые для удаленного входа на устройство и копирования исполняемых бинарных фалов. По желанию можно заменить пакет, загрузив с официального сайта по [ссылке](https://itefix.net/cwrsync "ссылке").

### Папка - template

Содержимое папки и есть сам шаблон проекта. В это папке обязательно наличие следующих файлов в папке `.vscode`:

- **launch.json** - шаблон Launch, используется для создания проекта;
- **tasks.json** - шаблон Tasks, используется для создания проекта;
- **insert_launch_key.json** - Launch для удаленной отладки, используется при создании проекта  и добавления отдельного Launch к существующему проекту;
- **insert_tasks_key.json** - используется совместно с `insert_launch_key.json`.

### Файл - template.fastiot.png

Изображение шаблона в формате PNG размером не более 256x256 px.

### Файл - template.fastiot.yaml

Описание шаблона в формате YAML.

## Структура файлов insert_launch_key.json и insert_tasks_key.json

Файлы `insert_launch_key.json` и `insert_tasks_key.json` содержат массив значений, которые необходимо вставить в `launch.json` и `tasks.json`. Массив должен быть в ключе `values`, т.е.:

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

Добавлена поддержка нескольких Launch с пересекающимися tasks, т.е. в случае удаления одного из Launch, tasks используемые в других Launch не будут удалены. Примеры двух цепочек Launch => Tasks:

- `Launch on cubieboard (DotnetApp, Cubieboard, debugvscode)` => fastiot-96534065-build, fastiot-96534065-create-folder,  fastiot-96534065-copy-app-to-device;
- `Launch on cubieboard (DotnetApp, Cubieboard, debugvscode) without logs` => fastiot-96534065-build, fastiot-96534065-create-folder, fastiot-96534065-copy-app-to-device-without-logs.

Как видим задачи `fastiot-96534065-build` и `fastiot-96534065-create-folder` общие. Если удалить Launch `Launch on cubieboard (DotnetApp, Cubieboard, debugvscode)`, то удалится только одна задача `fastiot-96534065-copy-app-to-device` т.к. остальные две используются другим Launch. Данный принцип работает только для Launch, созданных данным расширением.

Если значение ключа `name`, например `Launch on cubieboard (DotnetApp, Cubieboard, debugvscode)`, будет совпадать с уже существующими названиями Launch, то тогда автоматически будет добавлен инкремент к названию, например `Launch on cubieboard (DotnetApp, Cubieboard, debugvscode) #1`.

### Дополнительные ключи в Launch

В Launch были добавлены дополнительные ключи, с приставкой `fastiotId*`, ключи: `fastiotIdLaunch`, `fastiotIdDevice`, `fastiotProject`, `fastiotIdTemplate`. Не рекомендуется их изменять т.к. некоторые функции расширения из-за этого могут быть недоступны.

Пример:

```json
{
  "fastiotIdLaunch": "2cecf322",
  "fastiotIdDevice": "cubieboard-5e835aae",
  "fastiotProject": "/DotnetConsoleAppRuntimeInfo.csproj",
  "fastiotIdTemplate": "dotnet-console-runtime-info",
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

### Требования к ключу `fastiotIdLaunch`

В файле `insert_launch_key.json`, ключ `fastiotIdLaunch`:

- Должен всегда начинаться со значения `%{launch.id}`, например: `%{launch.id}-without-logs`;
- Должен быть уникальным, например значения для первого Launch - `%{launch.id}`, второго - `%{launch.id}-without-logs`.

Эти условия необходимо выполнять для признака связности нескольких Launch, в противном случае команда `Rebuild` выполнится только для одного Launch.

## Структура файла template.fastiot.yaml

Файл формата YAML, схема для проверки шаблона [template.schema](/schemas/template.schema.yaml). Рассмотрим поля:

- `id: dotnet-console-runtime-info` - уникальный id шаблона, рекомендуется начинать с название автора или организации, например `anton-dotnet-console` или `contoso-dotnet-console`. Этот параметр должен обязательно совпадать с названием архива шаблона `id: dotnet-console-runtime-info` => `dotnet-console-runtime-info.zip`;
- `platform: - win32 ` - массив платформ, на которых можно использовать данный шаблон. Подразумевается среда исполнения расширения. На данный момент расширение работает только на платформе `win32`. Возможные значения: `win32`, `linux`;
- `version: "0.1"` - версия шаблона;
- `releaseDate: "2023-02-21"` - дата релиза шаблона в формате YYYY-MM-DD;
- `forVersionExt: 0.3.0` - минимальная версия расширения, поддерживающая структуру данного шаблона;
- `author: DevDotNet.ORG` - автор шаблона;
- `emailAuthor: fastiot@devdotnet.org` - email;
- `license: MIT` - лицензия под которой распространяется шаблон;
- `label: .NET Console Application Runtime Info` - название шаблона;
- `detail: Creates a console ...` - краткое описание шаблона;
- `description: The application displays ...` - детальное описание шаблона;
- `language: C#` - язык программирования;
- `endDeviceArchitecture: - armv7l, - aarch64, - x86_64` - массив архитектур процессора конечного устройства на котором будет исполняться приложение. Возможные значения: `armv6l`, `armv7l`, `aarch64`, `riscv64`, `x86_64`;
- `dependOnPackages: # Coming in one of the next version` - необходимые пакеты для работы приложения на конечном устройстве (пока не используется);
- `typeProj: dotnet` - тип проекта. В зависимости от типа формируется дополнительная логика обработки шаблона, например, показывается окно выбора версии .NET framework. Для всех .NET шаблонов необходимо указывать `dotnet`;
- `projName: DotnetConsoleAppRuntimeInfo` - название проекта по умолчанию;
- `mainFileProj: dotnetapp.csproj` - путь в шаблоне к главному файлу проекта. Если размещается в папке, то указывать, например `folder1/dotnetapp.csproj`.
- `mainFileProjLabel: Visual Studio C# Project` - название главного файла проекта;
- `tags: - console` - массив тегов для поиска шаблона, значения могут быть любые (пока не используется);
- `filesToProcess: - dotnetapp.csproj, - Program.cs` - массив путей к файлам в шаблоне, к которым будет применяться подстановка переменных, например `%{project.dotnet.targetframework}`. Если файл размещается в папке, то указывать, например `folder1/file.ext`.;
- `fileNameReplacement` - массив значений, инструкции к переименованию файлов в формате `старый_путь_как_в_шаблоне=новый_путь_как_в_проекте`. Например, возьмем строку `dotnetapp.csproj=%{project.name}.csproj`. Файл `dotnetapp.csproj` в каталоге проекта будет переименован в `DotnetConsoleAppRuntimeInfo.csproj`, исходя из переменных подстановки.

## Алгоритм создания проекта

Алгоритм располагается в классе [IotTemplate](/src/Templates/IotTemplate.ts) функция `CreateProject`. Выполняется следующая последовательность:

1. Целиком копируется папка `/template` из шаблона в каталог проекта.
2. Создается словарь для замены переменных, таких как `%{variable}`.
3. Выполняется переименование файлов из секции `FileNameReplacement`, файл `template.fastiot.yaml`.
4. Переопределение название проекта исходя из предыдущего этапа, если таковое имеется.
5. Выполняется подстановка переменных для файлов из секции `FilesToProcess`.
6. Вставляются Launch из файла `/template/.vscode/insert_launch_key.json`.
7. Переименовываются Launch в случае совпадения названий в проекте.
8. Вставляются Tasks из файла `/template/.vscode/insert_tasks_key.json`.
9. Открывается в VSCode папка с проектов.

## Переменные слияния данных с файлами шаблона

Переменные будут рассмотрены для шаблона [dotnet-console-runtime-info](/templates/system/dotnet-console-runtime-info). Входные данные:

- устройство - [cubieboard](https://github.com/devdotnetorg/Cubieboard);
- шаблон - `dotnet-console-runtime-info`;
- путь к шаблону - `C:\Users\Anton\fastiot\templates\system\dotnet-console-runtime-info`;
- название проекта - `DotnetConsoleAppRuntimeInfo`;
- папка сохранения проекта `D:\Anton\Projects\Tests\DotnetConsoleAppRuntimeInfo`;
- .NET framework - `.NET 5`.

Переменные:

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

**Значения при наличии каталогов в пути**

Значения переменных при вложенном каталоге, например, когда проект располагается не в корне каталога `/template`, а во вложенной папке `/template/nested`. Шаблон [dotnet-console-test-nested](/templates/system/dotnet-console-test-nested). Список переменных только тех, которые были изменены из-за наличия вложенной папки.

Переменные:

1. "%{project.mainfile.path.relative.aslinux}" => "/nested/DotnetConsoleAppTestNested.csproj".
2. "%{project.mainfile.path.relative.aswindows}" => "\\\\nested\\\\DotnetConsoleAppTestNested.csproj".
3. "%{project.mainfile.path.full.aslinux}" => "D:/Anton/Projects/Tests/DotnetConsoleAppTestNested/nested/DotnetConsoleAppTestNested.csproj".
4. "%{project.mainfile.path.full.aswindows}" => "D:\\\\Anton\\\\Projects\\\\Tests\\\\DotnetConsoleAppTestNested\\\\nested\\\\DotnetConsoleAppTestNested.csproj"}.
5. "%{project.path.relative.aslinux}" => "/nested".
6. "%{project.path.relative.aswindows}" => "\\\\nested".
7. "%{project.path.full.ascygdrive}" => "/cygdrive/d/Anton/Projects/Tests/DotnetConsoleAppTestNested/nested".

## Отладка шаблона

Все ошибки связанные с проверкой шаблона будут отображены в окне OUTPUT.

Если возникнет ошибка валидации структуры JSON, то в окне OUTPUT отобразится позиция в файле, которая вызвала ошибку. В этом случае исходный файл останется неизменным, а будет создан новый с именем `debug_launch_json.txt` или `debug_tasks_json.txt` в каталоге проекта.
