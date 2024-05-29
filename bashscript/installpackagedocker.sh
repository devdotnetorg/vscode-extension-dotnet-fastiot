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

# **************** definition of variables ****************
declare ARCH_OS=$(uname -m) #aarch64, armv7l, x86_64 or riscv64

# requirements check
if [ $ARCH_OS != "aarch64" ] && [ $ARCH_OS != "armv7l" ] \
 && [ $ARCH_OS != "x86_64" ]&& [ $ARCH_OS != "riscv64" ]; then
	echo "ERROR. Current OS architecture ${ARCH_OS} is not supported."
	exit 1;
fi

export DEBIAN_FRONTEND="noninteractive"

sudo apt-get update

#install
#for aarch64, armv7l, x86_64
if [ $ARCH_OS == "aarch64" ] || [ $ARCH_OS == "armv7l" ] \
 || [ $ARCH_OS == "x86_64" ]; then
	#install
	sudo apt-get install -y curl
	curl -fsSL https://get.docker.com -o get-docker.sh
	chmod +x get-docker.sh
	sudo ./get-docker.sh
fi

#for riscv64
if [ $ARCH_OS == "riscv64" ]; then
	#install
	sudo apt-get install -y docker.io
fi

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
