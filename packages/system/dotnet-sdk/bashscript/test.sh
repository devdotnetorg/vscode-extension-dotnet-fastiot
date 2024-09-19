#!/bin/bash
# Run: 
# chmod +x test.sh
# ./test.sh
# package: dotnet-sdk

set -e #Exit immediately if a comman returns a non-zero status

echo "Run: package/dotnet-sdk/test.sh"

#
dotnet --info

echo "Successfully"
