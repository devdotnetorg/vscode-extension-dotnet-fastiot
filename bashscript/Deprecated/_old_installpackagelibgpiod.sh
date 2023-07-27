#!/bin/bash
# Run: 
# chmod +x installpackagelibgpiod.sh
# ./installpackagelibgpiod.sh 1.6.3 /usr/share/libgpiod

set -e #Exit immediately if a comman returns a non-zero status

echo "Run: installpackagelibgpiod.sh"
#
LIBGPIOD_VERSION="$1"
INSTALLPATH="$2"
#

if [ -z $LIBGPIOD_VERSION ]; then
	echo "Error: library version not specified"
	exit 1;
fi

if [ -z $INSTALLPATH ]; then
	INSTALLPATH=/usr/share/libgpiod
fi

export DEBIAN_FRONTEND="noninteractive"

sudo apt-get update
sudo apt-get install -y curl

#install
curl -SL --output setup-libgpiod.sh https://raw.githubusercontent.com/devdotnetorg/docker-libgpiod/master/setup-libgpiod.sh
chmod +x setup-libgpiod.sh
sudo ./setup-libgpiod.sh $LIBGPIOD_VERSION $INSTALLPATH

gpiodetect --version

echo "Successfully"
