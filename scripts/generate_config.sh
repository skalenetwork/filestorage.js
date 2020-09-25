VERSION=$(npm view @skalenetwork/filestorage version)
ARTIFACTS_PATH=$PWD/test/data/artifacts.json
curl -LJO https://github.com/skalenetwork/filestorage/releases/download/$VERSION/artifacts.json
mv artifacts.json $ARTIFACTS_PATH
node -e 'require("./test/utils/helper.js").generateConfig()'

