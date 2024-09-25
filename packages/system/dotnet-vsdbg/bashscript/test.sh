#!/bin/bash
# Run: 
# chmod +x test.sh
# ./test.sh
# package: dotnet-vsdbg

set -e #Exit immediately if a comman returns a non-zero status

echo "Run: package/dotnet-vsdbg/test.sh"

#test
/usr/share/vsdbg/vsdbg --help

echo "Successfully"
