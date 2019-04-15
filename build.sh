#!/usr/bin/env bash
set -e
set +x

NOT_VALID_BUMP_LEVEL_TEXT="Please provide bump level: major/minor/patch"

if [ -z "$VER" ]
then
    (>&2 echo $NOT_VALID_BUMP_LEVEL_TEXT)
    exit 1
fi

echo "Building $VER version..."

WEBPACK_ENV=build npx webpack
echo "Build done"
sed -i 's/var filestorage=/module.exports=/' ./dist/filestorage.min.js
echo "Fix done"

VERSION_NUM=`npm --no-git-tag-version version $VER`
echo "Updated to $VERSION_NUM, version increment: $VER"
