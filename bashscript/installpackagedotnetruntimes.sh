#!/bin/bash
# Run: 
# chmod +x installpackagedotnetruntimes.sh
# ./installpackagedotnetruntimes.sh dotnet 5.0 /usr/share/dotnet

set -e #Exit immediately if a comman returns a non-zero status

echo "Run: installpackagedotnetruntimes.sh"

#
RUNTIME_NAME="$1"
RUNTIME_CHANNEL="$2"
INSTALLPATH="$3"
#

if [ -z $RUNTIME_NAME ]; then
	RUNTIME_NAME=dotnet
fi

if [ -z $RUNTIME_CHANNEL ]; then
	echo "Error: .NET Runtime not specified"
	exit 1;
fi

if [ -z $INSTALLPATH ]; then
	INSTALLPATH=/usr/share/dotnet
fi

# **************** definition of variables ****************
declare ARCH_OS=$(uname -m) #aarch64, armv7l, x86_64 or riscv64

# requirements check
if [ $ARCH_OS != "aarch64" ] && [ $ARCH_OS != "armv7l" ] \
 && [ $ARCH_OS != "x86_64" ]; then
	echo "ERROR. Current OS architecture ${ARCH_OS} is not supported. For riscv64 architecture you can install .NET SDK 8.0"
	exit 1;
fi

export DEBIAN_FRONTEND="noninteractive"

sudo apt-get update
sudo apt-get install -y wget

#install 
wget https://dot.net/v1/dotnet-install.sh
sudo chmod +x dotnet-install.sh
sudo ./dotnet-install.sh --runtime $RUNTIME_NAME --channel $RUNTIME_CHANNEL --install-dir $INSTALLPATH
if [ -h /usr/bin/dotnet ]; then
	sudo rm /usr/bin/dotnet    
fi
sudo ln -s $INSTALLPATH/dotnet /usr/bin/dotnet

rm dotnet-install.sh

#Disabled telemetry in .NET
#Telemetry is collected when using any of the .NET CLI commands, such as:
#    dotnet build
#    dotnet pack
#    dotnet run

filename="/etc/environment"

#add
if sudo grep -Fxq "DOTNET_CLI_TELEMETRY_OPTOUT=true" $filename
then
    echo "String exists: DOTNET_CLI_TELEMETRY_OPTOUT=true"
else
	echo "Adding a line: DOTNET_CLI_TELEMETRY_OPTOUT=true in $filename"
	#newline
	sudo sh -c "echo '\n' >> $filename"
	sudo sh -c "echo 'DOTNET_CLI_TELEMETRY_OPTOUT=true' >> $filename"
fi

echo "Disabled telemetry in .NET CLI"
echo "Read more about .NET CLI Tools telemetry: https://aka.ms/dotnet-cli-telemetry"

dotnet --info

echo "Successfully"
