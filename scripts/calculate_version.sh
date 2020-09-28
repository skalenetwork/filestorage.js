#!/usr/bin/env bash
VERSION=$(npm run --silent version)
USAGE_MSG='Usage: BRANCH=[BRANCH] calculate_version.sh'

if [ -z "$BRANCH" ]; then
    (>&2 echo 'You should provide branch')
    echo $USAGE_MSG
    exit 1
fi

if [ -z "$VERSION" ]; then
      echo "The base version is not set."
      exit 1
fi

if [[ $BRANCH == 'master' ]]; then
    echo $VERSION
    exit 1
fi

if [[ $BRANCH == 'stable' ]]; then
    echo $VERSION
    exit 0
fi

git fetch --tags > /dev/null

for (( NUMBER=0; ; NUMBER++ ))
do
    FULL_VERSION="$VERSION-$BRANCH.$NUMBER"
    if ! [[ $(git tag -l | grep $FULL_VERSION) ]]; then
        echo "$FULL_VERSION" | tr / -
        break
    fi
done