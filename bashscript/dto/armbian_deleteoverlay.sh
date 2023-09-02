#!/bin/bash
# Run: 
# chmod +x armbian_deleteoverlay.sh
# ./armbian_deleteoverlay.sh --path /boot/dtb/allwinner/overlay/sun50i-a64-i2c1-bme280.dtbo

set -e #Exit immediately if a comman returns a non-zero status

echo "Run: armbian_deleteoverlay.sh"

# reading arguments from CLI
POSITIONAL_ARGS=()
while [[ $# -gt 0 ]]; do
  case $1 in
    -p|--path)
      DELETE_OVERLAY="$2"
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
if [ -z $DELETE_OVERLAY ]; then
	echo "Error: --path not specified"
	exit 2;
fi

#delete *.dtbo
sudo rm $DELETE_OVERLAY

echo "Successfully"
