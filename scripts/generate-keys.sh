#!/bin/bash
#
# Generate an RS256 (RSA) key pair for JWT signing + JWKS publishing.
# Usage: bash scripts/generate-keys.sh [OUTPUT_PATH]
#   OUTPUT_PATH defaults to keys/private.pem
#
# Writes:
#   <OUTPUT_PATH>            private key (PKCS8, 4096-bit, chmod 600)
#   <OUTPUT_PATH%.pem>.pub.pem  public key
# Prints the JWT_PRIVATE_KEY_PATH line to add to your .env, plus the derived kid.

set -e

OUTPUT_PATH="${1:-keys/private.pem}"
PUBLIC_PATH="${OUTPUT_PATH%.pem}.pub.pem"

mkdir -p "$(dirname "$OUTPUT_PATH")"

# Private key (PKCS8, 4096-bit)
openssl genpkey -algorithm RSA -pkeyopt rsa_keygen_bits:4096 -out "$OUTPUT_PATH" 2>/dev/null
chmod 600 "$OUTPUT_PATH"

# Public key
openssl rsa -in "$OUTPUT_PATH" -pubout -out "$PUBLIC_PATH" 2>/dev/null

# Derive kid = first 16 hex chars of sha256(public key DER)
FINGERPRINT=$(openssl rsa -in "$OUTPUT_PATH" -pubout -outform DER 2>/dev/null \
    | openssl dgst -sha256 -hex | cut -d' ' -f2 | cut -c1-16)

echo ""
echo "✓ RSA key pair generated:"
echo "  private: $OUTPUT_PATH"
echo "  public:  $PUBLIC_PATH"
echo "  kid:     $FINGERPRINT"
echo ""
echo "Add to your .env:"
echo "  JWT_PRIVATE_KEY_PATH=$OUTPUT_PATH"
echo ""
echo "NOTE: never commit private keys. 'keys/' should stay git-ignored."
