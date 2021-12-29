#!/bin/bash
# Run: 
# chmod +x installpackagedocker.sh
# ./installpackagedocker.sh debugvscode

set -e #Exit immediately if a comman returns a non-zero status

echo "Run: installpackagedocker.sh"

#
USERNAME="$1"
#

if [ -z $USERNAME ]; then
	echo "Error: USERNAME not specified"
	exit 1;
fi

export DEBIAN_FRONTEND="noninteractive"

sudo apt-get update
sudo apt-get install -y curl

#install
curl -fsSL https://get.docker.com -o get-docker.sh
chmod +x get-docker.sh
sudo ./get-docker.sh
#removal of artifacts
if [ -f /etc/apt/sources.list.d/docker.list ]; then
	#rm
	sudo rm /etc/apt/sources.list.d/docker.list
fi

#
sudo usermod -aG docker $USERNAME

sudo systemctl status docker

docker --version

echo "Successfully"
