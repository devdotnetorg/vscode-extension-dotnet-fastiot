#!/bin/bash
# Run: 
# chmod +x armbian_disableoverlay.sh
# ./armbian_disableoverlay.sh --overlay led-blue-disabled

set -e #Exit immediately if a comman returns a non-zero status

echo "Run: armbian_disableoverlay.sh"

# reading arguments from CLI
POSITIONAL_ARGS=()
while [[ $# -gt 0 ]]; do
  case $1 in
    -o|--overlay)
      REMOVE_OVERLAY="$2"
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
if [ -z $REMOVE_OVERLAY ]; then
	echo "Error: --overlay not specified"
	exit 2;
fi

#
filename="/boot/armbianEnv.txt"
thekey="overlays"

#Remove overlay in file /boot/armbianEnv.txt, overlays=
#read current value
declare value="$(cat $filename | grep $thekey | sed 's/.*=\s*//')"
echo "OLD Value = $value"

#new value
declare newvalue=""
IFS=', ' read -r -a array <<< "$value"
for element in "${array[@]}"
do    
	if [ "$REMOVE_OVERLAY" != "$element" ]; then
		newvalue="${newvalue} ${element}"
	fi
done

#trim
newvalue="$(echo $newvalue | sed 's/ *$//g')"

echo "NEW Value = $newvalue"

#record new value
if ! grep -R "^[#]*\s*${thekey}=.*" $filename > /dev/null; then
  echo "APPENDING because '${thekey}' not found"
  #newline
  sudo sh -c "echo '\n' >> $filename"
  #
  sudo sh -c "echo "$thekey=$newvalue" >> $filename"
else
  echo "SETTING because '${thekey}' found already"
  sudo sed -ir "s/^[#]*\s*${thekey}=.*/$thekey=$newvalue/" $filename
  #newline
  sudo sh -c "echo '\n' >> $filename"
fi

#delete empty lines
sudo sed -ir '/^[[:space:]]*$/d' $filename

#check "overlays="
value="$(cat $filename | grep $thekey | sed 's/.*=\s*//')"
if [ "$value" == "" ]; then
	sudo sed -ir '/overlays=/d' $filename
fi

echo "Successfully"