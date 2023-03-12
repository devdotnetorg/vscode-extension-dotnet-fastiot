# Устранение неполадок

**Содержание:**

1. [Устранение неполадок при добавление устройства](#устранение-неполадок-при-добавление-устройства)
2. [Устранение неполадок при выполнении bash-скриптов на устройстве](#устранение-неполадок-при-выполнении-bash-скриптов-на-устройстве)
3. [Проблемы с запуском/работой расширения](#проблемы-с-запускомработой-расширения)
4. [Проблема с загрузкой системных шаблонов](#проблема-с-загрузкой-системных-шаблонов)

## Устранение неполадок при добавление устройства

### Сетевая доступность

Во время подключения к устройству выдается подробны отчет проверки соединения:

```bash
Checklist:
✔️ IP-Address defined;
✔️ Host availability. Command: "ping";
✔️ Port 22 availability;
✔️ Authorization via ssh protocol.
```

Первые три пункта касаются сетевой доступности. Если до последнего пункта проверка не доходит, значит устройство не доступно по сети. Для решения проблемы c сетевой доступностью проверьте следующие пункты:

1. Физическое подключение устройства к сети;
2. Проверьте доступность устройства по сети командой `ping`, например `ping 192.168.43.208`;
3. Проверьте открыт ли сетевой порт `22`, проверяется командой на самом устройстве: `lsof -i :22`;
4. Убедись что фаервол (может быть не установлен) в системе отключен, по умолчанию - это ufw. Команда отключения: `sudo ufw disable`.

Если не выполняется только пункт `Authorization via ssh protocol`, то значит устройство доступно по сети и к порту `22` можно подключиться.

### Устранение неполадок при подключении к ssh-серверу

Невыполнение пункта `Authorization via ssh protocol` означает наличие проблем подключения к OpenSSH серверу.

Возможны три основные причины:

1. Проблемы с работой исполняемых файлов операционной системы и OpenSSH сервера;
2. Неверные параметры логин, пароль, порт подключения;
3. Проблемы с конфигурационными файлами.

**Проблемы с работой исполняемых файлов операционной системы и OpenSSH сервера**

Для исключения проблем связанных с исполнением файлов обновите операционную систему и OpenSSH сервер. Выполните следующие команды на самом устройстве:

```bash
sudo apt-get update
sudo apt-get upgrade
sudo apt-get install -y openssh-server
```

Перезагрузите устройство командой:

```bash
sudo reboot now
```

Если проблема не была решена, то переходите к следующему разделу.

**Неверные параметры логин, пароль, порт подключения**

При подключение к устройству проверьте логин и пароль. Эти же реквизиты должны пройти проверку при локальном входе на устройстве. Проверьте доступность порта `22` используя терминал удаленного подключения, например [MobaXterm](https://mobaxterm.mobatek.net/download.html "MobaXterm Xserver with SSH, telnet, RDP, VNC and X11").

**Проблемы с конфигурационными файлами**

Конфигурационные файлы OpenSSH сервера располагаются в папке `/etc/ssh`. Откройте конфигурационный файл `/etc/ssh/sshd_config` OpenSSH сервера и проверьте настройки:

```bash
PermitRootLogin yes
PasswordAuthentication yes
ChallengeResponseAuthentication yes
AuthenticationMethods publickey keyboard-interactive password
```

Если настройки были изменены, то перезапустите OpenSSH сервер командой: `sudo systemctl reload ssh`. И посмотрите статус службы командой: `sudo systemctl status ssh`.

Если не удалось решить проблему, то замените конфигурационный файл `sshd_config` по пути `/etc/ssh/sshd_config` на [базовый](/linux/config/sshd_config), после этого перезапустите OpenSSH сервер.

Если так и не удалось решить проблему, то можно полностью удалить OpenSSH сервер и инициализировать настройки по умолчанию. Cпособ ☢️ `nuclear option`:

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

Не забудьте добавить строки в файл `/etc/ssh/sshd_config`:

```bash
PermitRootLogin yes
PasswordAuthentication yes
ChallengeResponseAuthentication yes
AuthenticationMethods publickey keyboard-interactive password
```
И перезапустить OpenSSH сервер командой: `sudo systemctl status ssh`.

Если возникнут проблемы с конфигурационными файлами, то выполните следующие действия:

```bash
sudo dpkg --configure -a
sudo dpkg --configure openssh-server
sudo apt-get install -f
```

Возможно проблемы с алгоритмом ключа, можете изменить используемый алгоритм для генерации ключа и его длину в настройках расширения.

Если так и не удалось решить проблему, то создавайте [Issue](https://github.com/devdotnetorg/vscode-extension-dotnet-fastiot/issues).

## Устранение неполадок при выполнении bash-скриптов на устройстве

1. Проверьте возможность повышение привилегий до root-уровня на устройстве командой `sudo`, например `sudo su`;
2. Сообщение об ошибке. Все действия выполняются путем запуска bash-скриптов на устройстве. Если bash-скрипт завершится с ошибкой, то в окне OUTPUT будет сообщение об ошибке и код ошибки. Например скрипт выполнит установку несуществующего пакета `abyur-abyur`, команда:

```bash
sudo apt-get install -y abyur-abyur
```

В окне появится следующее сообщение:

```bash
STDERR: ERROR: Unable to locate package abyur-abyur
CODEERR: 100
------------- Result -------------
Status: ERROR
Message: The execution of the installpackagedemo.sh script ended with an error.
----------------------------------
```

Скрипт вызвавший ошибку - `installpackagedemo.sh`, располагается в папке [bashscript](/bashscript/).

Сообщение об ошибке `STDERR: ERROR: Unable to locate package abyur-abyur`. `ERROR` - критическая ошибка, дальнешее выполнение скрипта невозможно.

Строка `CODEERR: 100`, код ошибки - 100.

Если будет `WARNING`, то скрипт продолжит свое выполнение. Пример сообщения:

```bash
STDERR: WARNING: https://download.mono-project.com/repo/ubuntu/dists/stable-focal/InRelease: Key is stored in legacy trusted.gpg keyring (/etc/apt/trusted.gpg), see the DEPRECATION section in apt-key(8) for details.
```

3. Запуск скрипта напосредственно на устройстве. Если выполняемая задача завершается с ошибкой, то скрипт вызвавший ошибку остается на самом устройстве. Вы можете попробовать выполнить скрипт на устройстве вручную. Путь к скрипту на устройстве для пользователя `debugvscode`: `/home/debugvscode/vscode-dotnetfastiot.sh`, для пользователя `root`: `/root/vscode-dotnetfastiot.sh`. Входные параметры для скрипта описаны в комментариях самого скрипта.

Запуск скрипта:

```bash
chmod +x vscode-dotnetfastiot.sh
./vscode-dotnetfastiot.sh
```

## Проблемы с запуском/работой расширения

Если по каким то причинам не работает расширение или работает с ошибками, то одним из путей решения проблемы является полное удаление текущих настроек расширения.

Настройки расширения хранятся в файле формата json по пути `%userprofile%\AppData\Roaming\Code\User\settings.json`, например `C:\Users\Anton\AppData\Roaming\Code\User\settings.json`.

В файле `settings.json` все параметры относящиеся к расширению, начинаются с `fastiot.*`. Для решения проблемы закройте VSCode, удалите в файле `settings.json` все параметры которые начинаются с `fastiot.*`, запустите VSCode.

Если проблемы не исчезли, то следует удалить/переименовать папку расширения, в которой хранятся ключи, шаблоны, и т.д. Папки для удаления/переименования:

- `C:\RemoteCode\`;
- `%userprofile%\fastiot`, например `C:\Users\Anton\fastiot`.

Если после перезапуска расширения проблемы остались, то возможно проблемы связаны с предоставлением прав доступа к выше указанным папкам.

Исполняемые файлы расширения располагются в папке `%USERPROFILE%\.vscode\extensions`, например `C:\Users\Anton\.vscode\extensions`. Вы можете удалить расширение из указанно папки и заново его установить.

## Проблема с загрузкой системных шаблонов

Если возникли проблемы с загрузкой системных шаблонов, то можно выполнить команду `Restore/upgrade system templates (offline)` из меню окна `Templates` либо удалить существующие системные шаблоны и перезапустить VSCode. При запуске расширения шаблоны автоматически восстановятся.
