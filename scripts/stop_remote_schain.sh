#!/bin/bash

ssh -o StrictHostKeyChecking=no "$USER"@"$ENDPOINT" "docker stop schain_$PORT"