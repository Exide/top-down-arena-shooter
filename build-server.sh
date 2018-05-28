#!/bin/bash

set -eo pipefail
set +x

cd $(dirname $0)

# helper methods
# --------------

function binary_exists {
    path=$(type -P "$1")
    if [ -n "${path}" ]; then
        return 0
    else
        return 1
    fi
}

function print_info {
    echo -e "$*"
    #printf "%s\n" "$*" >&1;
}

function print_error {
    printf "ERROR: %s\n" "$*" >&2;
}

function execute {
    print_info "> $1"
    $1
}

# find the native docker binary
# -----------------------------
print_info "Detecting native Docker binary..."
if binary_exists "docker"; then
    docker="docker"
elif binary_exists "docker.exe"; then
    docker="docker.exe"
else
    print_error "Couldn't find a native Docker binary to use!"
    exit 1
fi
print_info "Using: $(which ${docker})"


# package everything up
# ---------------------
name="exide/${image_name}:latest"
print_info "Building: ${name}"
execute "${docker} build --tag ${name} --file server.Dockerfile ."
execute "${docker} push ${name}"
