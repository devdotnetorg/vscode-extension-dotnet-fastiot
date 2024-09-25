#!/bin/bash
# Run: 
# chmod +x remove.sh
# ./remove.sh --dir /usr/share/vsdbg --full no
# --full yes/no
# package: dotnet-vsdbg

set -e #Exit immediately if a comman returns a non-zero status

echo "Run: package/dotnet-vsdbg/remove.sh"

# reading arguments from CLI
POSITIONAL_ARGS=()
while [[ $# -gt 0 ]]; do
  case $1 in
    -v|--version)
      VERSION="$2" # not used
      shift # past argument
      shift # past value
      ;;
    -e|--edition)
      EDITION="$2" # not used
      shift # past argument
      shift # past value
      ;;
    -d|--dir)
      DIR="$2"
      shift # past argument
      shift # past value
      ;;
    -t|--tag)
      TAG="$2" # not used
      shift # past argument
      shift # past value
      ;;
    -f|--full)
      FULL="$2" # not used
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

if [ -z $DIR ]; then
	echo "Error: dir not specified"
	exit 1;
fi

#
FULL="yes"
#

export DEBIAN_FRONTEND="noninteractive"

# check for complete removal
if [ "${FULL}" == "yes" ]; then
	echo "Complete removal of the package."
	
	#deleting a folder
	sudo rm -R $DIR
	
	echo "${DIR} has been removed"

	#removing a symbolic link 
	if [ -h /usr/bin/vsdbg ]; then
		sudo rm /usr/bin/vsdbg
	fi

	echo "Successfully"

	exit 0;
fi

echo "Successfully"
