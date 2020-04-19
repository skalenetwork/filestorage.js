#!/bin/bash

ssh -o StrictHostKeyChecking=no "$USER"@"$ENDPOINT" "mkdir schains/$PORT"
ssh -o StrictHostKeyChecking=no "$USER"@"$ENDPOINT" "mkdir schains/$PORT/data_dir"

scp -o StrictHostKeyChecking=no ./test/utils/config.json "$USER"@"$ENDPOINT":schains/$PORT/config.json
ssh -o StrictHostKeyChecking=no "$USER"@"$ENDPOINT" "docker run -d -v ~/schains/$PORT:/schain_data \
                    -p $PORT:2234 \
                    -e SSL_CERT_PATH=None \
                    -e HTTP_RPC_PORT=2234 \
                    -e NO_NTP_CHECK=1 \
                    -e DATA_DIR=/schain_data/data_dir \
                    -e CONFIG_FILE=/schain_data/config.json \
                    --name schain_$PORT \
                    skalenetwork/schain:$VERSION"