# Шаблон, отладка шаблона

**Содержание**

1. Понятие шаблона
2. Структура шаблона
3. Структура файлов insert_launch_key.json и insert_tasks_key.json
4. Структура файла template.fastiot.yaml
5. Алгоритм создания проекта
6. Переменные слияния данных с файлами шаблона
7. Отладка шаблона

## Понятие шаблона

Шаблоны используются для создания проектов и добавления фалов `launch.json` и `tasks.json` к существующему проекту. Располагаются по пути `%userprofile%\fastiot\templates`, например `C:\Users\Anton\fastiot\templates\`. Шаблоны разделяются на два типа это системные - `system` и пользовательские - `user`. Если системный шаблон не продет проверку, то он автоматически будет удален и заменен на валидный. Если системны шаблон удалить, то он тоже будет автоматически восстановлен. Системные шаблоны автоматически обновляются при запуске расширения с ресурса [Github devdotnetorg/vscode-extension-dotnet-fastiot/tree/master/templates/system](https://github.com/devdotnetorg/vscode-extension-dotnet-fastiot/tree/master/templates/system). Далее, все будет рассмотрено на примере шаблона [dotnet-console-runtime-info](/templates/system/dotnet-console-runtime-info).

## Структура шаблона

Шаблон представляет из себя обычный zip-архив со следующей структурой:

- **storage** - папка содержащая необходимые скрипты и исполняемые файлы используемые в `tasks.json`;
- **template** - папка содержащая сам шаблон;
- **template.fastiot.png** - титульное изображение шаблона (пока не используется);
- **template.fastiot.yaml** - описание шаблона в формате YAML.

### Папка - storage

Могут размещаться любые файлы. В частности в папке каждого шаблона размещаются утилиты **cwRsync** и **ssh** используемые для удаленного входа на устройство и копирования исполняемыех бинарных фалов. По желанию можно заменить пакет, загрузив с официального сайта по [ссылке](https://itefix.net/cwrsync "ссылке").

### Папка - template

Содержимое папки и есть сам шаблон проекта. В это папке обязательно наличие следующих фалов в папке `.vscode`:

**launch.json** - шаблон Launch, используется при создание проекта;
**tasks.json** - шаблон Tasks, используется при создание проекта;
**insert_launch_key.json** - Launchs связанные непосредственно с запуском проекта, используется при создание проекта  и добавление отдельного Launch к существующему проекту;
**insert_tasks_key.json** - используется вместе с `insert_launch_key.json`.

### Файл - template.fastiot.png

Изображение шаблона в формате PNG размером не более 256x256 px.

### Файл - template.fastiot.yaml

Описание шаблона в формате YAML.

## Структура файлов insert_launch_key.json и insert_tasks_key.json

Файлы `insert_launch_key.json` и `insert_tasks_key.json` содержат массив значений которые необходимо вставить в `launch.json` и `tasks.json`. Массив должен быть в ключе `values`, т.е.:

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

Причем добавлена поддержка несколько Launch с пересекающимися tasks, т.е. в случае удаления одного из Launch, tasks используемые в других Launch не будут удалены. Например цепочки Launch => Tasks:

- `Launch on cubieboard (DotnetApp, Cubieboard, debugvscode)` => fastiot-96534065-build, fastiot-96534065-create-folder,  fastiot-96534065-copy-app-to-device;
- `Launch on cubieboard (DotnetApp, Cubieboard, debugvscode) without logs` => fastiot-96534065-build, fastiot-96534065-create-folder, fastiot-96534065-copy-app-to-device-without-logs.

Как видим задачи fastiot-96534065-build и fastiot-96534065-create-folder общие. Если удалить Launch `Launch on cubieboard (DotnetApp, Cubieboard, debugvscode)`, то удалится только одна задача `fastiot-96534065-copy-app-to-device` т.к. остальные две используются другим Launch.

Данный принцип работает только для Launch созданных данным расширением.

Если значение ключа `name`, например `Launch on cubieboard (DotnetApp, Cubieboard, debugvscode)`, будет совпадать с уже сущесвующися названиями Launch, то тогда автоматически будет добавлен инкремент к названию, например `Launch on cubieboard (DotnetApp, Cubieboard, debugvscode) #1`.

### Дополнительные ключи в Launch

В Launch были добавлены дополнительные ключи, с приставкой `fastiotId*`. Ключи: `fastiotIdLaunch`, `fastiotIdDevice`, `fastiotProject`, `fastiotIdTemplate`. Не рекомендуется их изменять т.к. некоторые функции расширения из-за этого могут быть недоступны.

### Требования к ключу `fastiotIdLaunch`

В файле `insert_launch_key.json`, ключ `fastiotIdLaunch`:

- Должен всегда начинаться со значения `%{launch.id}`, например: `%{launch.id}-without-logs`. Этот признак обеспечивает связность нескольких Launch, для выполнения команды `Rebuild` ;
- Должен быть уникальным, например значения для первого Launch - `%{launch.id}`, второго - `%{launch.id}-without-logs`.

Эти условия необходимо выполниять для признака связности нескольких Launch, для выполнения команды `Rebuild`.

## Структура файла template.fastiot.yaml

Файл формата YAML, схема для проверки шаблона [template.schema](/schemas/template.schema.yaml). Рассмотрим поля:

- `id: dotnet-console-runtime-info` - уникальный id шаблона, рекомендуется начинать с название автора или организации, например `anton-dotnet-console` или `contoso-dotnet-console`. Этот параметр должен обязательно совпадать с названием архива шаблона `id: dotnet-console-runtime-info` => `dotnet-console-runtime-info.zip`;
- `platform: - win32 ` - массив платформ на которых можно использовать данный шаблон. Подразумевается среда исполнения расширения. На данный момент расширение работает только на платформе `win32`. Возможные значения: `win32`, `linux`;
- `version: "0.1"` - версия шаблона;
- `releaseDate: "2023-02-21"` - дата релиза шаблона в формате YYYY-MM-DD;
- `forVersionExt: 0.3.0` - минимальная версия расширения поддерживающая структуру данного шаблона;
- `author: DevDotNet.ORG` - автор шаблона;
- `emailAuthor: fastiot@devdotnet.org` - email;
- `license: MIT` - лицензия под которой распространяется шаблон;
- `label: .NET Console Application Runtime Info` - название шаблона;
- `detail: Creates a console ...` - краткое описание шаблона;
- `description: The application displays ...` - детальное описание шаблона;
- `language: C#` - язык программирования;
- `endDeviceArchitecture: - armv7l, - aarch64, - x86_64` - массив архитектур процессора конечного устройства на котором будет исполняться приложение. Возможные значения: `armv6l`, `armv7l`, `aarch64`, `riscv64`, `x86_64`;
- `dependOnPackages: # Coming in one of the next version` - необходимые пакеты для работы приложения на конечном устройстве (пока не используется);
- `typeProj: dotnet` - тип проекта. В зависимости от типа формируется дополнительная логика обработки шаблона, например показывается окно выбора версии .NET framework. Для всех .NET шаблонов необходимо указывать `dotnet`;
- `projName: DotnetConsoleAppRuntimeInfo` - название проекта по умолчанию;
- `mainFileProj: dotnetapp.csproj` - путь в шаблоне к главному файлу проекта. Если размещается в папке, то указывать например `folder1/dotnetapp.csproj`.
- `mainFileProjLabel: Visual Studio C# Project` - название главного файла проекта;
- `tags: - console` - массив тегов для поиска шаблона, значения могут быть любые (пока не используется);
- `filesToProcess: - dotnetapp.csproj, - Program.cs` - массив путей к файлам в шаблоне, к которым будет применяться подстановка переменных, например `%{project.dotnet.targetframework}`. Если файл размещается в папке, то указывать например `folder1/file.ext`.;
- `fileNameReplacement` - массив значений, инструкции к переименовыванию файлов в формате `старый_путь_как_в_шаблоне=новый_путь_как_в_проекте`. Например возьмем строку `dotnetapp.csproj=%{project.name}.csproj`. Файл `dotnetapp.csproj` в каталоге проекта будет переименован в `DotnetConsoleAppRuntimeInfo.csproj`, исходя из переменных подстановки.

## Алгоритм создания проекта

Алгоритм располагается в классе [IotTemplate](/src/Templates/IotTemplate.ts) функция `CreateProject`. Выполняется следующая последовательность:

TODO

## Переменные слияния данных с файлами шаблона

TODO

## Отладка шаблона

TODO
