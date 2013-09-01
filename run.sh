#!/bin/bash

# Download jQuery
if [ ! -f app/jquery.js ]; then
  wget -O app/jquery.js http://ajax.googleapis.com/ajax/libs/jquery/2.0.3/jquery.min.js app/jquery.js
fi

mkdir build
zip -j build/app.nw src/* app/*
nw build/app.nw &