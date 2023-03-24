# Настройки расширения

Для изменения настроек расширения необходимо открыть пункт меню `File > Preferences > Settings`. Затем перейти на закладку `User` и выбрать `Extensions`.

![VSCode dotnet FastIoT](vscode-dotnet-fastiot-settings-1.png)

Настройки:

- **Fastiot › Device › Account: Groups** - группа пользователей в Linux на удаленном устройстве (например, Raspberry Pi), в которую будет добавлена учетная запись (`debugvscode`) для управления устройством. Данная группа должна обладать правами Администратора. Значение по умолчанию: `sudo`.
- **Fastiot › Device › Account: Username** - название учетной записи, создается на удаленном устройстве. Используется для управления устройством и выполнения удаленной отладки. Значение по умолчанию: `debugvscode`.
- **Fastiot › Device › All: JSON** - настройки устройств в JSON формате, не рекомендуется изменять вручную. Из-за неверных изменений, список устройств может не загрузиться.
- **Fastiot › Device: Applicationdatafolder** - общая папка для хранения ключей доступа к устройствам (например, Raspberry Pi), шаблонов, настроек расширения. Значение по умолчанию: `%userprofile%\fastiot`. Пример: `C:\Users\Anton\fastiot`.
- **Fastiot › Device > ssh > Key: Bits** - длина ключа в битах. Значение по умолчанию: `256`.
- **Fastiot › Device > ssh > Key: Type** - Название используемого алгоритма для генерации ключа. Более подробно об алгоритмах для ключей в публикации [How To Set Up SSH Keys](https://goteleport.com/blog/how-to-set-up-ssh-keys/). Значение по умолчанию: `ed25519`. Если выберете алгоритм `rsa`, то вам потребуется в файл `/etc/ssh/sshd_config` внести строку `PubkeyAcceptedAlgorithms=+ssh-rsa`.
- **Fastiot › Launch: Templatetitle** - шаблон для формирования названия Launch. Значения переменных можно посмотреть по [ссылке](Launch-title-template_ru.md "Template for forming the name Launch"). Значение по умолчанию: `Launch on %{device.label} (%{project.name}, %{device.board.name}, %{device.user.debug})`.
- **Fastiot › Template: Isupdate** - вкл/выкл обновление шаблонов с ресурсов сети Интернет.
- **Fastiot › Template: Lastupdate** - время последнего обновления. Технически параметр.
- **Fastiot › Template: Loadonstart** - загрузка шаблонов при старте расширения. При отключенном параметре шаблоны загрузятся только при первом обращение к ним.
- **Fastiot › Template: Updateinterval** - интервал обновления шаблонов в часах.
