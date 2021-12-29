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

dotnet --info

echo "Successfully"
