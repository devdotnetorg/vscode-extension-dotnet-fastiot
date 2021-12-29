#!/bin/bash
# Run: 
# chmod +x uninstallpackagelibgpiod.sh
# ./uninstallpackagelibgpiod.sh /usr/share/libgpiod

set -e #Exit immediately if a comman returns a non-zero status

echo "Run: uninstallpackagelibgpiod.sh"
#
INSTALLPATH="$1"
#

if [ -z $INSTALLPATH ]; then
	INSTALLPATH=/usr/share/libgpiod
fi

export DEBIAN_FRONTEND="noninteractive"

#========================================
#https://raw.githubusercontent.com/devdotnetorg/docker-libgpiod/master/remove-libgpiod.sh

#
ARMBIT=$(uname -m) #aarch64, armv7l, or x86_64
#

echo "==============================================="
echo "Removing Libgpiod library" 
echo "Library installation path:" $INSTALLPATH
echo "==============================================="
echo ""
echo "=====================Remove====================="
#
rm -rfv ~/libgpiod-* &>/dev/null || echo "libgpiod-* has been removed" 

if [ -d $INSTALLPATH ]; then
	sudo rm -rfv $INSTALLPATH    
fi

LIB_FOLDER=""
case $ARMBIT in

  aarch64)
    LIB_FOLDER="aarch64-linux-gnu"
    ;;

  armv7l)
    LIB_FOLDER="arm-linux-gnueabihf"
    ;;

  x86_64)
    LIB_FOLDER="x86_64-linux-gnu"
    ;;

  *)
    LIB_FOLDER=""
    ;;
esac
# Removing ln
echo "============Removing symbolic links============"
#bin
sudo rm /usr/bin/gpiodetect &>/dev/null || echo "gpiodetect has been removed"
sudo rm /usr/bin/gpiofind &>/dev/null || echo "gpiofind has been removed"
sudo rm /usr/bin/gpioget &>/dev/null || echo "gpioget has been removed"
sudo rm /usr/bin/gpioinfo &>/dev/null || echo "gpioinfo has been removed"
sudo rm /usr/bin/gpiomon &>/dev/null || echo "gpiomon has been removed"
sudo rm /usr/bin/gpioset &>/dev/null || echo "gpioset has been removed"
#/usr/lib
sudo rm /usr/lib/$LIB_FOLDER/libgpiod.a &>/dev/null || echo "libgpiod.a has been removed"
sudo rm /usr/lib/$LIB_FOLDER/libgpiod.la &>/dev/null || echo "libgpiod.la has been removed"
sudo rm /usr/lib/$LIB_FOLDER/libgpiod.so &>/dev/null || echo "libgpiod.so has been removed"
sudo rm /usr/lib/$LIB_FOLDER/libgpiod.so.2 &>/dev/null || echo "libgpiod.so.2 has been removed"
sudo rm /usr/lib/$LIB_FOLDER/libgpiod.so.2.2.2 &>/dev/null || echo "libgpiod.so.2.2.2 has been removed"
#
echo "==============================================="

#========================================
echo "Successfully"
