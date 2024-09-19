#!/bin/bash
# Run: 
# chmod +x remove.sh
# ./remove.sh --version 5.0.408 --dir /usr/share/dotnet/sdk --full no
# --full yes/no
# package: dotnet-sdk

set -e #Exit immediately if a comman returns a non-zero status

echo "Run: package/dotnet-sdk/remove.sh"

# reading arguments from CLI
POSITIONAL_ARGS=()
while [[ $# -gt 0 ]]; do
  case $1 in
    -v|--version)
      VERSION="$2"
      shift # past argument
      shift # past value
      ;;
    -e|--edition)
      EDITION="$2"
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
      FULL="$2"
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
if [ -z $VERSION ]; then
	echo "Error: version not specified"
	exit 1;
fi

if [ -z $DIR ]; then
	echo "Error: dir not specified"
	exit 1;
fi

export DEBIAN_FRONTEND="noninteractive"

# check for complete removal
if [ "${FULL}" == "yes" ]; then
	echo "Complete removal of the package."
	
	REMOVEDIR=$(echo "${DIR}/*") # /usr/share/dotnet/sdk/*
	
	sudo rm -R $REMOVEDIR # /usr/share/dotnet/sdk/*
	
	echo "${REMOVEDIR} has been removed"

	echo "Successfully"

	exit 0;
fi

# remove
REMOVEDIR=$(echo "${DIR}/${VERSION}")
sudo rm -R $REMOVEDIR
echo "${REMOVEDIR} has been removed"

echo "Successfully"
