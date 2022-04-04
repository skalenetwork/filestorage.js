#!/bin/bash


ssh -o StrictHostKeyChecking=no "$USER"@"$ENDPOINT" "mkdir schains/$PORT"
if [ $? -ne 0 ]
then
    exit 1
fi
ssh -o StrictHostKeyChecking=no "$USER"@"$ENDPOINT" "mkdir schains/$PORT/data_dir"

scp -o StrictHostKeyChecking=no ./test/data/config.json "$USER"@"$ENDPOINT":schains/"$PORT"/config.json
ssh -o StrictHostKeyChecking=no "$USER"@"$ENDPOINT" "docker run -d -v ~/schains/$PORT:/schain_data \
        -p $PORT:2234 \
        -e SSL_CERT_PATH=None \
        -e HTTP_RPC_PORT=2234 \
        -e NO_NTP_CHECK=1 \
        --name schain_$PORT \
        skalenetwork/schain:$VERSION \
        --config /schain_data/config.json \
        -d /schain_data/data_dir \
        --aa no"
