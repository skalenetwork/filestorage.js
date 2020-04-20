#!/bin/bash

ssh -o StrictHostKeyChecking=no "$USER"@"$ENDPOINT" "docker rm -f schain_$PORT"
ssh -o StrictHostKeyChecking=no "$USER"@"$ENDPOINT" "rm -r schains/$PORT"