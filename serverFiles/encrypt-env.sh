#!/bin/bash
openssl enc -aes-256-cbc -salt -pbkdf2 -in .env -out .env.enc
