#!/bin/bash
# Run: 
# chmod +x armbiandisableoverlay.sh
# ./armbiandisableoverlay.sh led-blue-disabled

set -e #Exit immediately if a comman returns a non-zero status

echo "Run: armbiandisableoverlay.sh"

#
REMOVE_OVERLAY="$1"
filename="/boot/armbianEnv.txt"
thekey="overlays"

#
if [ -z $REMOVE_OVERLAY ]; then
	echo "Error: OVERLAY not specified"
	exit 1;
fi

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