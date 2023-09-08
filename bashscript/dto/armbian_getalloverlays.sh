#!/bin/bash
# Run: 
# chmod +x armbian_getalloverlays.sh
# ./armbian_getalloverlays.sh

set -e #Exit immediately if a comman returns a non-zero status

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

# echo "overlay_prefix: ${overlay_prefix}"
# echo "overlays: '${overlays}'"

# list path files overlays
declare arraypaths=($(ls ${overlaydir}/${overlay_prefix}-* -d))

# echo "My array: ${arraypaths[@]}"
# echo "Number of elements in the array: ${#arraypaths[@]}"

declare JSON_STRING=""
declare JSON_STRING_LINE=""
declare overlaytype="user" # type DTO: system, user

IFS=' ' read -r -a arrayoverlays <<< "$overlays"

for (( i=0; i<${#arraypaths[@]}; i=i+1)); do
	#echo "${i} - ${arraypaths[i]}"
	filename="${arraypaths[i]%.*}"
	#echo "${filename}"
	overlay="${filename#*${overlay_prefix}-}"
	#echo "${overlay}"
	# check Enable/Disable
	overlayactive=false
	for j in ${!arrayoverlays[@]}; do
		if [ "${arrayoverlays[$j]}" == "${overlay}" ]; then
			overlayactive=true
		fi
	done
	# json
	JSON_STRING_LINE=$( jq -n --arg name "${overlay}" --arg path "${arraypaths[i]}" --arg active "${overlayactive}" --arg type "${overlaytype}" '{name: $name, path: $path, active: $active, type: $type}' )
	JSON_STRING="${JSON_STRING}${JSON_STRING_LINE} "
done

# echo $JSON_STRING

# print
for i in ${!JSON_STRING[@]}; do
  echo "${JSON_STRING[$i]}"
done | jq -n '.overlays |= [inputs]'
