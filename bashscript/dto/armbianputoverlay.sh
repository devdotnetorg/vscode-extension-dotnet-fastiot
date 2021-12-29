#!/bin/bash
# Run: 
# chmod +x armbianputoverlay.sh
# ./armbianputoverlay.sh sun50i-a64-led-blue-disabled.dts /boot/dtb/allwinner/overlay
# ./armbianputoverlay.sh sun50i-a64-i2c1-bme280.dtbo /boot/dtb/allwinner/overlay

set -e #Exit immediately if a comman returns a non-zero status

echo "Run: armbianputoverlay.sh"

#
NEW_DTS="$1"
OVERLAYDIR="$2"
#

if [ -z $NEW_DTS ]; then
	echo "Error: DTS File not specified"
	exit 1;
fi

if ! type dtc > /dev/null ; then
	echo "Error: dtc not found in PATH"
	echo "Please try to install matching kernel headers"
	exit 2
fi

#get var
extension="${NEW_DTS##*.}"
filename="${NEW_DTS%.*}"

#DTS
if [ "$extension" == "dts" ]; then
	echo "DTS to DTBO"	
	dtc -I dts -O dtb $filename.dts -o $filename.dtbo &>/dev/null || echo ""		
	#check dtbo
	if [ -f $filename.dtbo ]; then
		echo "OK"
		rm $NEW_DTS
	else
		echo "Error compiling .dts file"
		dtc -I dts -O dtb $filename.dts -o $filename.dtbo
		exit 1;
	fi	
fi

#DTBO
sudo cp $filename.dtbo $OVERLAYDIR/$filename.dtbo
rm $filename.dtbo

echo "Successfully"
