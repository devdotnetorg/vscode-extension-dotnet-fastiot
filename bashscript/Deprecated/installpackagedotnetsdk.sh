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

export DEBIAN_FRONTEND="noninteractive"

sudo apt-get update
sudo apt-get install -y wget

#install
wget https://dot.net/v1/dotnet-install.sh
sudo chmod +x dotnet-install.sh
export DOTNET_CLI_TELEMETRY_OPTOUT=true
sudo ./dotnet-install.sh --channel $NETSDK_CHANNEL --install-dir $INSTALLPATH
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
