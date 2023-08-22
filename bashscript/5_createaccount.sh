#!/bin/bash
# Run: 
# chmod +x 5_createaccount.sh
# ./5_createaccount.sh --username debugvscode --sshkeytypebits ed25519-256
# https://manpages.ubuntu.com/manpages/jammy/man1/ssh-keygen.1.html
# TYPEKEY = dsa | ecdsa | ed25519 | rsa
# BITS = 256 | 384 | 521 | 1024 | 2048 | 3072 | 4096

# Add, Delete And Grant Sudo Privileges To Users In Alpine Linux
# https://ostechnix.com/add-delete-and-grant-sudo-privileges-to-users-in-alpine-linux/

set -e #Exit immediately if a comman returns a non-zero status

echo "Run: 5_createaccount.sh"

# reading arguments from CLI
POSITIONAL_ARGS=()
while [[ $# -gt 0 ]]; do
  case $1 in
    -u|--username)
      NEWUSERNAME="$2"
      shift # past argument
      shift # past value
      ;;
    -s|--sshkeytypebits)
      TYPEKEYBITS="$2"
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

if [ -z $TYPEKEYBITS ]; then
	echo "Error: --sshkeytypebits not specified"
	exit 2;
fi

#split
IFS='-' read -r -a myarray <<< "$TYPEKEYBITS"
TYPEKEY="${myarray[0]}"
BITS="${myarray[1]}"

echo "********************************************************"
echo "Creation of account '${NEWUSERNAME}',"
echo "key type '${TYPEKEY}', length '${BITS}' bits."
echo "********************************************************"

#create user
id -u $NEWUSERNAME &>/dev/null || sudo adduser --disabled-password --gecos "" $NEWUSERNAME
sudo echo "${NEWUSERNAME} ALL=(ALL) NOPASSWD:ALL" > /etc/sudoers.d/$NEWUSERNAME

#get homedir
HOMEDIR="$(sudo awk -F: -v v="${NEWUSERNAME}" '{if ($1==v) print $6}' /etc/passwd)"

if [ "$HOMEDIR" == "" ]; then
	echo "User '${NEWUSERNAME}' not found."
	exit 3;
fi

#create keys
mkdir -p $HOMEDIR/.ssh

if [ -f $HOMEDIR/.ssh/id_$TYPEKEY ]; then
	rm $HOMEDIR/.ssh/id_$TYPEKEY
fi

if [ -f $HOMEDIR/.ssh/id_$TYPEKEY.pub ]; then
	rm $HOMEDIR/.ssh/id_$TYPEKEY.pub
fi

NAMEHOST="$(uname -n)"
ssh-keygen -t $TYPEKEY -b $BITS -f $HOMEDIR/.ssh/id_$TYPEKEY -C $NEWUSERNAME@$NAMEHOST -N ""
cat $HOMEDIR/.ssh/id_$TYPEKEY.pub > $HOMEDIR/.ssh/authorized_keys

#copy file for get
cp $HOMEDIR/.ssh/id_$TYPEKEY ~/vscode_authorized_key

echo "Created access keys '$HOMEDIR/.ssh/id_$TYPEKEY' and '$HOMEDIR/.ssh/id_$TYPEKEY.pub' for account '$NEWUSERNAME'"

echo "Successfully"
