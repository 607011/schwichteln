#!/bin/bash
DIST=dist/
DEST=cx20:/var/www/ersatzworld.net/html/schwichteln

JSFILES="worker.js wichtel.js"
HTMLFILES="index.html"
OTHERFILES=""

echo Cleaning up ...
rm -rf $DIST
mkdir $DIST

echo Compressing JavaScript ...
for f in $JSFILES; do
  uglifyjs --compress --mangle -o $DIST/$f -- $f
done

echo Compressing HTML ...
for f in $HTMLFILES; do
  html-minifier \
    --collapse-whitespace \
    --remove-comments \
    --remove-optional-tags \
    --remove-script-type-attributes \
    --remove-tag-whitespace \
    --use-short-doctype \
    --minify-css true \
    --minify-js true \
    $f -o $DIST/$f
done

echo Copying other files ...
for f in $OTHERFILES; do
  cp -a $f $DIST
done

echo Deploying to $DEST ...
FILES="$HTMLFILE $JSFILES $OTHERFILES"
cd $DIST
rsync -rqtazv $FILES $DEST
