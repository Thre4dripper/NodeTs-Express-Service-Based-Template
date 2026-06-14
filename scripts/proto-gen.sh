#!/bin/bash
#
# Generate TypeScript gRPC stubs from local .proto files using ts-proto.
# Usage: bash scripts/proto-gen.sh [PROTO_DIR]
#   PROTO_DIR defaults to src-typescript/proto
#
# All .proto files are compiled together (with both the proto dir and its parent
# on the include path) so cross-file imports like `import "shared/models.proto"`
# resolve correctly.

set -e

PROTO_DIR="${1:-src-typescript/proto}"
GENERATED_DIR="${PROTO_DIR}/generated"
PROTO_PARENT_DIR="$(dirname "$PROTO_DIR")"

if [ ! -d "$PROTO_DIR" ]; then
    echo "Error: proto directory not found: ${PROTO_DIR}"
    exit 1
fi

# Update git submodules if this repo ever opts into a central proto repo.
if [ -f .gitmodules ]; then
    echo "Updating git submodules..."
    git submodule update --init --recursive
fi

mkdir -p "$GENERATED_DIR"

# Find all protos except generated output.
PROTO_FILES=$(find "$PROTO_DIR" -name "*.proto" -not -path "*/generated/*")

if [ -z "$PROTO_FILES" ]; then
    echo "No .proto files found under ${PROTO_DIR}"
    exit 0
fi

echo "Generating TypeScript stubs into ${GENERATED_DIR}..."

# Prefer grpc-tools' bundled protoc (installed via npm, no system setup required);
# fall back to a system-installed protoc if grpc-tools is unavailable.
GRPC_TOOLS_PROTOC="./node_modules/.bin/grpc_tools_node_protoc"
if [ -x "$GRPC_TOOLS_PROTOC" ]; then
    PROTOC_BIN="$GRPC_TOOLS_PROTOC"
else
    PROTOC_BIN="$(command -v protoc || true)"
fi

if [ -z "$PROTOC_BIN" ]; then
    echo "Error: no protoc found. Install project dependencies (pnpm install) to get the"
    echo "bundled compiler from 'grpc-tools', or install Protocol Buffers system-wide:"
    echo "  macOS:  brew install protobuf"
    echo "  linux:  apt-get install -y protobuf-compiler"
    exit 1
fi

"$PROTOC_BIN" \
    --plugin=protoc-gen-ts_proto="./node_modules/.bin/protoc-gen-ts_proto" \
    --ts_proto_out="$GENERATED_DIR" \
    --ts_proto_opt=outputServices=grpc-js,useExactTypes=false,esModuleInterop=true \
    -I "$PROTO_DIR" \
    -I "$PROTO_PARENT_DIR" \
    $PROTO_FILES

echo "Done. Generated stubs in ${GENERATED_DIR}"
