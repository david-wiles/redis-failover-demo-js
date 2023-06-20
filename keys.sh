#!/bin/bash

set -eo pipefail

COUNT=$1

if [ -z $COUNT ]; then
  echo "Usage: ./keys.sh [count]";
  exit 1
fi

echo -n "" > ./k6/keys.txt

for (( i=0; i<$COUNT; i++ )) ; do
    uuidgen >> k6/keys.txt
done
