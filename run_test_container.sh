port=$((1000 + RANDOM % 10000)); 

ssh -o StrictHostKeyChecking=no $USER@$ENDPOINT "mkdir schains/$port"
ssh -o StrictHostKeyChecking=no $USER@$ENDPOINT "mkdir schains/$port/data_dir"

scp -o StrictHostKeyChecking=no ./test/utils/config.json $USER@$ENDPOINT:schains/$port/config.json > /dev/null
ssh -o StrictHostKeyChecking=no $USER@$ENDPOINT "docker run -d -v ~/schains/$port:/schain_data \
                    -p $port:2234 \
                    -e SSL_CERT_PATH=None \
                    -e HTTP_RPC_PORT=2234 \
                    -e DATA_DIR=/schain_data/data_dir \
                    -e CONFIG_FILE=/schain_data/config.json \
                    skalenetwork/schain:$VERSION" > /dev/null
echo $port