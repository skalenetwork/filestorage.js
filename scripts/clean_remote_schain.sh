#!/bin/bash

ssh -o StrictHostKeyChecking=no "$USER"@"$ENDPOINT" "docker rm -f schain_$PORT"
ssh -o StrictHostKeyChecking=no "$USER"@"$ENDPOINT" "sudo rm -r schains/$PORT"