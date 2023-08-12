#!/bin/bash
# Run: 
# chmod +x 7_addusertogroups.sh
# ./7_addusertogroups.sh --username debugvscode --groups gpio,video,i2c --creategroup yes
# ./7_addusertogroups.sh --username managementvscode --groups sudo
# arguments:
# -c|--creategroup: yes or no, create group if they don't exist

# Add, Delete And Grant Sudo Privileges To Users In Alpine Linux
# https://ostechnix.com/add-delete-and-grant-sudo-privileges-to-users-in-alpine-linux/

set -e #Exit immediately if a comman returns a non-zero status

echo "Run: 7_addusertogroups.sh"

# definition of variables
declare ID_OS=("$(cat /etc/*release | grep '^ID=' | sed 's/.*=\s*//')") # ubuntu, debian, alpine
#

# reading arguments from CLI
POSITIONAL_ARGS=()
while [[ $# -gt 0 ]]; do
  case $1 in
    -u|--username)
      NEWUSERNAME="$2"
      shift # past argument
      shift # past value
      ;;
    -g|--groups)
      NEWGROUPS="$2"
      shift # past argument
      shift # past value
      ;;
	-c|--creategroup)
      CREATEGROUP="$2"
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
if [ -z $NEWUSERNAME ]; then
	echo "Error: --username not specified"
	exit 2;
fi

if [ $NEWUSERNAME == "root" ]; then
	echo "No need to add user 'root' to groups."
	exit 0;
fi

if [ -z $NEWGROUPS ]; then
	echo "Error: --groups not specified"
	exit 2;
fi

if [ -z $CREATEGROUP ]; then
	CREATEGROUP="no"
fi

if [ $CREATEGROUP != "yes" ] && [ $CREATEGROUP != "no" ]; then
	echo "ERROR. Invalid --creategroup option. 'yes' or 'no' values."
	exit 2;
fi

echo "********************************************************"
echo "Adding '${NEWUSERNAME}' user to '${NEWGROUPS}' groups."
echo "Create group if they don't exist: '${CREATEGROUP}'"
echo "********************************************************"

#replace ',' to ' '
NEWGROUPS="$(echo "${NEWGROUPS}" | sed -r 's/[,]+/ /g')"

for NEWGROUP in $NEWGROUPS
  do
    #create groups
	if [ $CREATEGROUP == "yes" ]; then
		if [ $ID_OS != "alpine" ]; then
			# ubuntu, debian
			sudo groupadd --force $NEWGROUP
		else
			# alpine
			sudo addgroup $NEWGROUP &>/dev/null || echo "${NEWGROUP} group already exists"
		fi
		echo "Group created: ${NEWGROUP}."
	fi
	#add user to group
	echo "Adding a '${NEWUSERNAME}' user to the '${NEWGROUP}' group."
	if [ $ID_OS != "alpine" ]; then
		# ubuntu, debian
		sudo usermod -aG $NEWGROUP $NEWUSERNAME
	else
		# alpine
		sudo addgroup $NEWUSERNAME $NEWGROUP
	fi
	# sudo usermod -aG $NEWGROUP $NEWUSERNAME &>/dev/null || echo "Group '${NEWGROUP}' does not exist"
	#check user in group
	LISTGROUPS="$(sudo getent group $NEWGROUP | awk -F: '{print $4}' |  tr "," " ")" # out: root debugvscode
	if [[ "$LISTGROUPS" == *"$NEWUSERNAME"* ]]; then
		echo "[ OK ] User '${NEWUSERNAME}' added to group '${NEWGROUP}'."
	else
		echo "[ ERROR ] User '${NEWUSERNAME}' was not added to group '${NEWGROUP}'."
		exit 3;
	fi
  done

echo "Successfully"
