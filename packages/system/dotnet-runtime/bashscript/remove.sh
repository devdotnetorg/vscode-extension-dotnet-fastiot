#!/bin/bash
# Run: 
# chmod +x remove.sh
# ./remove.sh --version 8.0.6 --edition Microsoft.AspNetCore.App --dir /usr/share/dotnet/shared/Microsoft.AspNetCore.App --full no
# --full yes/no
# package: dotnet-runtime

set -e #Exit immediately if a comman returns a non-zero status

echo "Run: package/dotnet-runtime/remove.sh"

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

if [ -z $EDITION ]; then
	echo "Error: edition not specified"
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
	
	PARENTDIR="$(dirname "${DIR}")" # "/usr/share/dotnet/shared"
	REMOVEDIR="$(dirname "${PARENTDIR}")" # "/usr/share/dotnet"
	
	sudo rm -R $REMOVEDIR
	
	echo "${REMOVEDIR} has been removed"

	#removing a symbolic link 
	if [ -h /usr/bin/dotnet ]; then
		sudo rm /usr/bin/dotnet
	fi

	echo "Successfully"

	exit 0;
fi

# removing related AspNetCore
if [ $EDITION == "Microsoft.NETCore.App" ]; then
	echo "Removing related AspNetCore"
	PARENTDIR="$(dirname "${DIR}")" # "/usr/share/dotnet/shared"
	REMOVEDIRASPNET=$(echo "${PARENTDIR}/Microsoft.AspNetCore.App/${VERSION}") # "/usr/share/dotnet/shared/Microsoft.AspNetCore.App/8.0.6"
	# remove
	if [ -d $REMOVEDIRASPNET ]; then
		sudo rm -rfv $REMOVEDIRASPNET  
		echo "${REMOVEDIRASPNET} has been removed"
	fi
fi

# remove
REMOVEDIR=$(echo "${DIR}/${VERSION}")
sudo rm -R $REMOVEDIR
echo "${REMOVEDIR} has been removed"

echo "Successfully"
