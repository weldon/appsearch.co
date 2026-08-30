#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

S3_BUCKET="${S3_BUCKET:-appsearch.co}"

SYNC_ARGS=(--delete)

if [[ -n "${S3_PREFIX:-}" ]]; then
  DEST="s3://${S3_BUCKET%/}/${S3_PREFIX#/}"
else
  DEST="s3://${S3_BUCKET}"
fi

echo "Syncing dist/ to ${DEST}"
aws s3 sync dist/ "${DEST}" "${SYNC_ARGS[@]}" \
  --cache-control "public, max-age=31536000, immutable" \
  --exclude "index.html" \
  --exclude "*.html"

aws s3 sync dist/ "${DEST}" \
  --cache-control "public, max-age=0, must-revalidate" \
  --exclude "*" \
  --include "*.html"

if [[ -n "${CLOUDFRONT_DISTRIBUTION_ID:-}" ]]; then
  echo "Invalidating CloudFront distribution ${CLOUDFRONT_DISTRIBUTION_ID}"
  aws cloudfront create-invalidation \
    --distribution-id "${CLOUDFRONT_DISTRIBUTION_ID}" \
    --paths "/*" \
    --output text \
    --query "Invalidation.Id"
fi

echo "Deploy complete."
