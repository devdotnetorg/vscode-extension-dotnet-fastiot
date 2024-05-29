#!/bin/bash
# Run: 
# chmod +x installpackagedotnetsdk.sh
# ./installpackagedotnetsdk.sh 5.0 /usr/share/dotnet

set -e #Exit immediately if a comman returns a non-zero status

echo "Run: installpackagedotnetsdk.sh"
#
NETSDK_CHANNEL="$1"
INSTALLPATH="$2"
#

if [ -z $NETSDK_CHANNEL ]; then
	echo "Error: .NET SDK CHANNEL not specified"
	exit 1;
fi

if [ -z $INSTALLPATH ]; then
	INSTALLPATH=/usr/share/dotnet
fi

# **************** definition of variables ****************
declare ARCH_OS=$(uname -m) #aarch64, armv7l, x86_64 or riscv64
declare ID_OS=("$(cat /etc/*release | grep '^ID=' | sed 's/.*=\s*//')") # ubuntu, debian, alpine
declare VERSION_OS=("$(cat /etc/*release | grep '^VERSION_ID=' | sed 's/.*=\s*//')")
VERSION_OS=("$(echo ${VERSION_OS} | sed 's/\"//g')")
# get only type XX.YY
VERSION_OS=("$(cut -d '.' -f 1 <<< "$VERSION_OS")"."$(cut -d '.' -f 2 <<< "$VERSION_OS")")

# requirements check
if [ $ARCH_OS != "aarch64" ] && [ $ARCH_OS != "armv7l" ] \
 && [ $ARCH_OS != "x86_64" ]&& [ $ARCH_OS != "riscv64" ]; then
	echo "ERROR. Current OS architecture ${ARCH_OS} is not supported."
	exit 1;
fi

if [ $ID_OS != "ubuntu" ] && [ $ID_OS != "debian" ] && [ $ID_OS != "alpine" ]; then
	echo "ERROR. Current OS ${ID_OS} not supported."
	exit 1;
fi

export DEBIAN_FRONTEND="noninteractive"

sudo apt-get update
sudo apt-get install -y wget

#for aarch64, armv7l, x86_64
if [ $ARCH_OS == "aarch64" ] || [ $ARCH_OS == "armv7l" ] \
 || [ $ARCH_OS == "x86_64" ]; then
	#install
	wget https://dot.net/v1/dotnet-install.sh
	sudo chmod +x dotnet-install.sh
	export DOTNET_CLI_TELEMETRY_OPTOUT=true
	sudo ./dotnet-install.sh --channel $NETSDK_CHANNEL --install-dir $INSTALLPATH
	rm dotnet-install.sh
fi

#for riscv64
if [ $ARCH_OS == "riscv64" ]; then
	if [ $NETSDK_CHANNEL != "8.0" ]; then
		echo "ERROR. You can only install dotnet sdk 8.0 for riscv64."
		exit 1;
	fi
	sudo apt-get install -y tar
	wget -O dotnet-sdk-riscv64.tar.gz "https://github.com/dkurt/dotnet_riscv/releases/download/v8.0.100/dotnet-sdk-8.0.100-linux-riscv64.tar.gz"
	sudo mkdir -p $INSTALLPATH
	sudo tar -xf dotnet-sdk-riscv64.tar.gz -C "$INSTALLPATH" --checkpoint=.100
	echo ""
	rm dotnet-sdk-riscv64.tar.gz
fi

if [ -h /usr/bin/dotnet ]; then
	sudo rm /usr/bin/dotnet
fi
sudo ln -s $INSTALLPATH/dotnet /usr/bin/dotnet

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
