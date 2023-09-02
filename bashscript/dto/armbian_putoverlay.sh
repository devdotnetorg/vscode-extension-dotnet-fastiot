#!/bin/bash
# Run: 
# chmod +x armbian_putoverlay.sh
# ./armbian_putoverlay.sh --file sun50i-a64-led-blue-disabled.dts
# ./armbian_putoverlay.sh --file led-blue-disabled.dts
# ./armbian_putoverlay.sh --file sun50i-a64-i2c1-bme280.dtbo
# ./armbian_putoverlay.sh --file i2c1-bme280.dtbo

set -e #Exit immediately if a comman returns a non-zero status

echo "Run: armbian_putoverlay.sh"

# reading arguments from CLI
POSITIONAL_ARGS=()
while [[ $# -gt 0 ]]; do
  case $1 in
    -f|--file)
      NEW_DTS="$2"
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
if [ -z $NEW_DTS ]; then
	echo "Error: --file not specified"
	exit 2;
fi

#BASE BLOCK

declare overlay_prefix="$(cat /boot/armbianEnv.txt | grep overlay_prefix | sed 's/overlay_prefix=//g')"
declare overlays="$(cat /boot/armbianEnv.txt | grep overlays | sed 's/overlays=//g')"
declare linuxfamily="$(cat /etc/armbian-release | grep '^LINUXFAMILY=' | sed 's/.*=\s*//')"

case $linuxfamily in

  sunxi64)
    declare overlaydir="/boot/dtb/allwinner/overlay"
    ;;

  meson64)
    declare overlaydir="/boot/dtb/amlogic/overlay"
    ;;

  rockchip64)
    declare overlaydir="/boot/dtb/rockchip/overlay"
    ;;

  rk3399)
    declare overlaydir="/boot/dtb/rockchip/overlay"
    ;;
	
  *)
    declare overlaydir="/boot/dtb/overlay"
    ;;
esac

#END BASE BLOCK

if ! type dtc > /dev/null ; then
	echo "Error: dtc not found in PATH"
	echo "Please try to install matching kernel headers"
	exit 3
fi

#check overlay prefix
if [[ $NEW_DTS != *"${overlay_prefix}-"* ]]; then
	# add
	declare NEW_DTS_2="${overlay_prefix}-${NEW_DTS}"
	cp ${NEW_DTS} ${NEW_DTS_2}
	rm ${NEW_DTS}
	NEW_DTS=$NEW_DTS_2
	echo "Added overlay prefix: ${overlay_prefix}"
	echo "File: ${NEW_DTS}"
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
sudo cp $filename.dtbo $overlaydir/$filename.dtbo
rm $filename.dtbo

echo "Successfully"
