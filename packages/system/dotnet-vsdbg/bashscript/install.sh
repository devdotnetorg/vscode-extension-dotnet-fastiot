#!/bin/bash
# Run: 
# chmod +x install.sh
# ./install.sh --installdir /usr/share/vsdbg
# https://learn.microsoft.com/ru-ru/dotnet/iot/debugging?tabs=self-contained&pivots=vscode
# package: dotnet-vsdbg

set -e #Exit immediately if a comman returns a non-zero status

echo "Run: package/dotnet-vsdbg/install.sh"

# reading arguments from CLI
POSITIONAL_ARGS=()
while [[ $# -gt 0 ]]; do
  case $1 in
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
if [ -z $INSTALLDIR ]; then
	INSTALLDIR=/usr/share/vsdbg
fi

export DEBIAN_FRONTEND="noninteractive"

#Combining @ssokolow's last comment with the answer from here, this command will run apt-get update if it hasn't run in the last 1 days:
#https://askubuntu.com/questions/410247/how-to-know-last-time-apt-get-update-was-executed
[ -z "$(find -H /var/lib/apt/lists -maxdepth 0 -mtime -1)" ] && sudo apt-get update

sudo apt-get install -y curl

#install
sudo mkdir -p $INSTALLDIR
curl -sSL https://aka.ms/getvsdbgsh | sudo bash /dev/stdin -v latest -l $INSTALLDIR

if [ -h /usr/bin/vsdbg ]; then
	sudo rm /usr/bin/vsdbg    
fi
sudo ln -s $INSTALLDIR/vsdbg /usr/bin/vsdbg

#test
vsdbg --help

echo "Successfully"
