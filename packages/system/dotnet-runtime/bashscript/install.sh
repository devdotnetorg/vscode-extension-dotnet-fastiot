#!/bin/bash
# Run: 
# chmod +x install.sh
# ./install.sh --runtime dotnet --channel 8.0 --installdir /usr/share/dotnet
# runtime: dotnet, aspnetcore
# channel: 8.0, 7.0, 6.0, 5.0
# https://dotnet.microsoft.com/en-us/platform/support/policy/dotnet-core
# package: dotnet-runtime

set -e #Exit immediately if a comman returns a non-zero status

echo "Run: package/dotnet-runtime/install.sh"

# reading arguments from CLI
POSITIONAL_ARGS=()
while [[ $# -gt 0 ]]; do
  case $1 in
    -r|--runtime)
      RUNTIME_NAME="$2"
      shift # past argument
      shift # past value
      ;;
    -c|--channel)
      RUNTIME_CHANNEL="$2"
      shift # past argument
      shift # past value
      ;;
    -i|--installdir)
      INSTALLDIR="$2"
      shift # past argument
      shift # past value
      ;;
    -*|--*)
      echo "Unknown option $1"
      exit 1
      ;;
    *)
      POSITIONAL_ARGS+=("$1") # save positional arg
      shift # past argument
      ;;
  esac
done

# check
if [ -z $RUNTIME_NAME ]; then
	RUNTIME_NAME=dotnet
fi

if [ -z $RUNTIME_CHANNEL ]; then
	echo "Error: .NET Runtime not specified"
	exit 1;
fi

if [ -z $INSTALLPATH ]; then
	INSTALLDIR=/usr/share/dotnet
fi

export DEBIAN_FRONTEND="noninteractive"

#Combining @ssokolow's last comment with the answer from here, this command will run apt-get update if it hasn't run in the last 1 days:
#https://askubuntu.com/questions/410247/how-to-know-last-time-apt-get-update-was-executed
[ -z "$(find -H /var/lib/apt/lists -maxdepth 0 -mtime -1)" ] && sudo apt-get update

sudo apt-get install -y wget

#install
#https://learn.microsoft.com/en-us/dotnet/core/tools/dotnet-install-script

wget https://dot.net/v1/dotnet-install.sh
sudo chmod +x dotnet-install.sh
sudo ./dotnet-install.sh --runtime $RUNTIME_NAME --channel $RUNTIME_CHANNEL --install-dir $INSTALLDIR
if [ -h /usr/bin/dotnet ]; then
	sudo rm /usr/bin/dotnet    
fi
sudo ln -s $INSTALLDIR/dotnet /usr/bin/dotnet

rm dotnet-install.sh

dotnet --info

echo "Successfully"
