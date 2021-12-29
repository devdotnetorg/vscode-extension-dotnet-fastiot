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

dotnet --info

echo "Successfully"
