#!/bin/bash
# Run: 
# chmod +x installpackagedotnetsdk.sh
# ./installpackagedotnetsdk.sh 5.0 /usr/share/dotnet

set -e #Exit immediately if a comman returns a non-zero status

echo "Run: installpackagedotnetsdk.sh"
#
NETSDK_VERSION="$1"
INSTALLPATH="$2"
#

if [ -z $NETSDK_VERSION ]; then
	echo "Error: .NET SDK version not specified"
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
chmod +x dotnet-install.sh
sudo ./dotnet-install.sh -c $NETSDK_VERSION -i $INSTALLPATH
if [ -h /usr/bin/dotnet ]; then
	sudo rm /usr/bin/dotnet
fi
sudo ln -s $INSTALLPATH/dotnet /usr/bin/dotnet

rm dotnet-install.sh

dotnet --info

echo "Successfully"
