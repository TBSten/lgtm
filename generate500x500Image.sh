#!/bin/bash

mkdir -p 500x500
for img in base/*; do
  case "${img##*.}" in
    png|jpg|jpeg|PNG) ;;
    *) continue ;;
  esac
  [ -e "$img" ] || continue
  filename=$(basename "$img")
  echo "start transform: $filename"
  convert "$img" -resize 500x500^ -gravity center -extent 500x500 "500x500/$filename"
  echo "finish transform: $filename"
done

