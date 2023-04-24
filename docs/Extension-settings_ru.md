# Настройки расширения

Для изменения настроек расширения необходимо открыть пункт меню `File > Preferences > Settings`. Затем перейти на закладку `User` и выбрать `Extensions`.

![VSCode dotnet FastIoT](vscode-dotnet-fastiot-settings-1.png)

Настройки:
- **Fastiot: Debug** - отладка сущностей, таких как шаблоны. При включенном значении сохраняет дополнительную отладочную информацию.
- **Fastiot › Device › Account: Group** - группа пользователей в Linux на удаленном устройстве (например, Raspberry Pi), в которую будет добавлена учетная запись (`debugvscode`) для управления устройством. Данная группа должна обладать правами Администратора. Значение по умолчанию: `sudo`.
- **Fastiot › Device › Account: Username** - название учетной записи, создается на удаленном устройстве. Используется для управления устройством и выполнения удаленной отладки. Значение по умолчанию: `debugvscode`.
- **Fastiot › Device › All: JSON** - настройки устройств в JSON формате, не рекомендуется изменять вручную. Из-за неверных изменений, список устройств может не загрузиться.
- **Fastiot › Device: Applicationdatafolder** - общая папка для хранения ключей доступа к устройствам (например, Raspberry Pi), шаблонов, настроек расширения. Значение по умолчанию: `%userprofile%\fastiot`. Пример: `C:\Users\Anton\fastiot`.
- **Fastiot › Device › Ssh › Key: Custombits** - пользовательское значение длины ключа в битах. Переопределяет параметр: `Fastiot › Device › Ssh: Keytype`. Пример: `256`.
- **Fastiot › Device › Ssh › Key: Customtype** - название пользовательского используемого алгоритма для генерации ключа. Переопределяет параметр: `Fastiot › Device › Ssh: Keytype`. Пример: `ed25519`. 
- **Fastiot › Device › Ssh: Keytype** - название алгоритма, длина ключа, для генерации ключа, используется на входа на удаленное устройство. Если выберете алгоритм `rsa`, то вам потребуется в файл `/etc/ssh/sshd_config` внести строку `PubkeyAcceptedAlgorithms=+ssh-rsa`. Более подробно об алгоритмах для ключей в публикации [How To Set Up SSH Keys](https://goteleport.com/blog/how-to-set-up-ssh-keys/). Значение по умолчанию: `ed25519-256`. 
- **Fastiot: Isupdate** - вкл/выкл обновление сущностей, таких как шаблонов, с ресурсов сети Интернет. Значение по умолчанию: `true`. 
- **Fastiot › Launch: Templatetitle** - шаблон для формирования названия Launch. Значения переменных можно посмотреть по [ссылке](Launch-title-template_ru.md "Template for forming the name Launch"). Значение по умолчанию: `Launch on %{device.label} (%{project.name}, %{device.board.name}, %{device.user.debug})`.
- **Fastiot: Loglevel** - уровень журналирования событий. Значение `Information` выводит только основные события, значение `Debug` выводит подробную информацию о событиях. Значение по умолчанию: `Information`.
- **Fastiot › Template › Community: Updatesource** - источник обновления для community шаблонов. Добавляет возможность загружать шаблоны со сторонних ресурсов. Пример: `htts://url1/list.yaml;htts://url2/list.yaml`. Структура файла `list.yaml` в формате YAML должна соответствовать структуре файла [templatelist.fastiot.yaml](https://github.com/devdotnetorg/vscode-extension-dotnet-fastiot/blob/master/templates/system/templatelist.fastiot.yaml). Файлы шаблонов в формате zip архива необходимо размещать в каталоге вместе с файлом `list.yaml`.
 - **Fastiot › Template: Defaultprojectfolder** - папка `Projects` для выбора местоположения размещения проектов по умолчанию. Пример: `C:\Users\Anton\Documents\Projects`.
- **Fastiot › Template: Loadonstart** - загрузка шаблонов при старте расширения. При отключенном параметре шаблоны загрузятся только при первом обращение к ним.  Значение по умолчанию: `true`.
- **Fastiot: Updateinterval** - интервал обновления шаблонов в часах.  Значение по умолчанию: `1 day`.
