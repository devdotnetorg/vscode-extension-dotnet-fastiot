#!/bin/bash
# Run: 
# chmod +x armbian_enableoverlay.sh
# ./armbian_enableoverlay.sh --overlay led-blue-disabled

set -e #Exit immediately if a comman returns a non-zero status

echo "Run: armbian_enableoverlay.sh"

# reading arguments from CLI
POSITIONAL_ARGS=()
while [[ $# -gt 0 ]]; do
  case $1 in
    -o|--overlay)
      ADD_OVERLAY="$2"
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
if [ -z $ADD_OVERLAY ]; then
	echo "Error: --overlay not specified"
	exit 2;
fi

declare filename="/boot/armbianEnv.txt"
declare thekey="overlays"

#Add overlay in file /boot/armbianEnv.txt, overlays=
#read current value
declare value="$(cat $filename | grep $thekey | sed 's/.*=\s*//')"
echo "OLD Value = $value"

#new value
if [ ${#value} -ge 1 ]; then declare newvalue="${value} ${ADD_OVERLAY}" ;
else declare newvalue="${ADD_OVERLAY}"
fi

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

echo "Successfully"
