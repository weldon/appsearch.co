#!/usr/bin/env bash
set -euo pipefail

# Provisions HTTPS for appsearch.co via ACM + CloudFront.
#
# Requirements:
#   - AWS CLI configured
#   - Permission for ACM (us-east-1), CloudFront, Route 53 (optional), S3
#   - DNS control for appsearch.co
#
# Usage:
#   bash scripts/setup-https.sh
#   bash scripts/setup-https.sh --wait-for-cert

cd "$(dirname "$0")/.."

DOMAIN="${DOMAIN:-appsearch.co}"
WWW_DOMAIN="${WWW_DOMAIN:-}"
S3_BUCKET="${S3_BUCKET:-appsearch.co}"
CERT_ARN="${CERT_ARN:-}"
CERT_REGION="us-east-1"
WAIT_FOR_CERT=false

if [[ "${1:-}" == "--wait-for-cert" ]]; then
  WAIT_FOR_CERT=true
fi

echo "=== AppSearch HTTPS setup ==="
echo "Domain:    ${DOMAIN}"
if [[ -n "${WWW_DOMAIN}" ]]; then
  echo "WWW domain: ${WWW_DOMAIN}"
fi
echo "S3 bucket: ${S3_BUCKET}"
echo ""

BUCKET_REGION="$(aws s3api get-bucket-location --bucket "${S3_BUCKET}" --output text)"
if [[ "${BUCKET_REGION}" == "None" || -z "${BUCKET_REGION}" ]]; then
  BUCKET_REGION="us-east-1"
fi

ORIGIN_DOMAIN="${S3_BUCKET}.s3.${BUCKET_REGION}.amazonaws.com"
echo "Bucket region:     ${BUCKET_REGION}"
echo "CloudFront origin: ${ORIGIN_DOMAIN}"
echo ""

find_distribution_id() {
  aws cloudfront list-distributions --output json 2>/dev/null | python3 -c '
import json, sys
domain, origin = sys.argv[1:3]
raw = sys.stdin.read().strip()
if not raw:
    sys.exit(0)
data = json.loads(raw)
for item in data.get("DistributionList", {}).get("Items", []) or []:
    origins = item.get("Origins", {}).get("Items", []) or []
    aliases = item.get("Aliases", {}).get("Items", []) or []
    origin_match = any(origin in (o.get("DomainName") or "") for o in origins)
    alias_match = domain in aliases or f"www.{domain}" in aliases
    if origin_match or alias_match:
        print(item["Id"])
        break
' "${DOMAIN}" "${ORIGIN_DOMAIN}"
}

find_certificate_arn() {
  aws acm list-certificates --region "${CERT_REGION}" --output json 2>/dev/null | python3 -c '
import json, sys, subprocess
domain, www = sys.argv[1:3]
raw = sys.stdin.read().strip()
if not raw:
    sys.exit(0)
data = json.loads(raw)
for summary in data.get("CertificateSummaryList", []) or []:
    if summary.get("DomainName") != domain:
        continue
    arn = summary["CertificateArn"]
    if www:
        print(arn)
        break
    detail = subprocess.check_output(
        ["aws", "acm", "describe-certificate", "--region", "us-east-1", "--certificate-arn", arn, "--output", "json"],
        text=True,
    )
    cert = json.loads(detail)["Certificate"]
    sans = cert.get("SubjectAlternativeNames") or []
    extra = [name for name in sans if name != domain]
    if not extra:
        print(arn)
        break
' "${DOMAIN}" "${WWW_DOMAIN}"
}

create_certificate() {
  if [[ -n "${WWW_DOMAIN}" ]]; then
    aws acm request-certificate \
      --region "${CERT_REGION}" \
      --domain-name "${DOMAIN}" \
      --subject-alternative-names "${WWW_DOMAIN}" \
      --validation-method DNS \
      --query CertificateArn \
      --output text
  else
    aws acm request-certificate \
      --region "${CERT_REGION}" \
      --domain-name "${DOMAIN}" \
      --validation-method DNS \
      --query CertificateArn \
      --output text
  fi
}

print_cert_validation_records() {
  local cert_arn="$1"
  local attempt=1
  local max_attempts=12

  while [[ "${attempt}" -le "${max_attempts}" ]]; do
    local records
    records="$(aws acm describe-certificate \
      --region "${CERT_REGION}" \
      --certificate-arn "${cert_arn}" \
      --query "Certificate.DomainValidationOptions[*].ResourceRecord.Name" \
      --output text)"

    if [[ -n "${records}" && "${records}" != "None" && "${records}" != "None None" ]]; then
      aws acm describe-certificate \
        --region "${CERT_REGION}" \
        --certificate-arn "${cert_arn}" \
        --query "Certificate.DomainValidationOptions[*].{Domain:DomainName,Name:ResourceRecord.Name,Type:ResourceRecord.Type,Value:ResourceRecord.Value}" \
        --output table
      return 0
    fi

    if [[ "${attempt}" -eq 1 ]]; then
      echo "Waiting for ACM to publish DNS validation records..."
    fi

    sleep 5
    attempt=$((attempt + 1))
  done

  echo "Validation records are not ready yet."
  echo "Check AWS Console -> Certificate Manager (us-east-1) -> certificate:"
  echo "  ${cert_arn}"
  echo ""
  echo "Or run:"
  echo "  aws acm describe-certificate --region us-east-1 --certificate-arn ${cert_arn} \\"
  echo "    --query 'Certificate.DomainValidationOptions[*].ResourceRecord' --output table"
  return 1
}

wait_for_certificate() {
  echo "Waiting for certificate to become ISSUED..."
  aws acm wait certificate-validated \
    --region "${CERT_REGION}" \
    --certificate-arn "$1"
  echo "Certificate issued."
}

create_distribution() {
  local cert_arn="$1"
  local caller_reference="appsearch-co-$(date +%s)"
  local tmp_config
  tmp_config="$(mktemp)"

  CERT_ARN="${cert_arn}" \
  ORIGIN_DOMAIN="${ORIGIN_DOMAIN}" \
  DOMAIN="${DOMAIN}" \
  WWW_DOMAIN="${WWW_DOMAIN}" \
  CALLER_REFERENCE="${caller_reference}" \
  python3 - <<'PY' > "${tmp_config}"
import json
import os

domain = os.environ["DOMAIN"]
www = os.environ.get("WWW_DOMAIN", "").strip()
aliases = [domain]
if www:
    aliases.append(www)

config = {
    "CallerReference": os.environ["CALLER_REFERENCE"],
    "Comment": f"AppSearch SPA ({domain})",
    "Enabled": True,
    "DefaultRootObject": "index.html",
    "Aliases": {
        "Quantity": len(aliases),
        "Items": aliases,
    },
    "Origins": {
        "Quantity": 1,
        "Items": [
            {
                "Id": f"S3-{os.environ['DOMAIN']}",
                "DomainName": os.environ["ORIGIN_DOMAIN"],
                "S3OriginConfig": {"OriginAccessIdentity": ""},
            }
        ],
    },
    "DefaultCacheBehavior": {
        "TargetOriginId": f"S3-{os.environ['DOMAIN']}",
        "ViewerProtocolPolicy": "redirect-to-https",
        "AllowedMethods": {
            "Quantity": 2,
            "Items": ["GET", "HEAD"],
            "CachedMethods": {"Quantity": 2, "Items": ["GET", "HEAD"]},
        },
        "ForwardedValues": {
            "QueryString": False,
            "Cookies": {"Forward": "none"},
        },
        "MinTTL": 0,
        "DefaultTTL": 86400,
        "MaxTTL": 31536000,
        "Compress": True,
        "TrustedSigners": {"Enabled": False, "Quantity": 0},
    },
    "CustomErrorResponses": {
        "Quantity": 2,
        "Items": [
            {
                "ErrorCode": 403,
                "ResponsePagePath": "/index.html",
                "ResponseCode": "200",
                "ErrorCachingMinTTL": 0,
            },
            {
                "ErrorCode": 404,
                "ResponsePagePath": "/index.html",
                "ResponseCode": "200",
                "ErrorCachingMinTTL": 0,
            },
        ],
    },
    "ViewerCertificate": {
        "ACMCertificateArn": os.environ["CERT_ARN"],
        "SSLSupportMethod": "sni-only",
        "MinimumProtocolVersion": "TLSv1.2_2021",
    },
    "PriceClass": "PriceClass_100",
    "HttpVersion": "http2",
    "IsIPV6Enabled": True,
}

print(json.dumps(config))
PY

  aws cloudfront create-distribution --distribution-config "file://${tmp_config}" \
    --query "Distribution.{Id:Id,Domain:DomainName,Status:Status}" \
    --output table

  rm -f "${tmp_config}"
}

echo "=== Step 1: TLS certificate (ACM, ${CERT_REGION}) ==="
if ! aws acm list-certificates --region "${CERT_REGION}" --output json >/dev/null 2>&1; then
  echo ""
  echo "Access denied for ACM. The appsearch-user IAM user needs ACM permissions."
  echo ""
  echo "Option A — ask your AWS admin to attach:"
  echo "  scripts/iam-appsearch-https-policy.json"
  echo ""
  echo "Option B — create the certificate manually in AWS Console:"
  echo "  1. Certificate Manager -> US East (N. Virginia) / us-east-1"
  echo "  2. Request a public certificate for ${DOMAIN}"
  if [[ -n "${WWW_DOMAIN}" ]]; then
    echo "     (and ${WWW_DOMAIN} if you set WWW_DOMAIN)"
  fi
  echo "  3. Validate with DNS (add the CNAME records ACM shows)"
  echo "  4. Create or edit a CloudFront distribution:"
  echo "     - Origin: ${ORIGIN_DOMAIN}"
  echo "     - Alternate domain names: ${DOMAIN}, ${WWW_DOMAIN}"
  echo "     - Custom SSL certificate: the new ACM cert"
  echo "     - Viewer protocol policy: Redirect HTTP to HTTPS"
  echo "     - Error pages: 403 and 404 -> /index.html (200)"
  echo "  5. Point DNS for ${DOMAIN} at the CloudFront distribution"
  exit 1
fi

CERT_ARN="${CERT_ARN:-$(find_certificate_arn || true)}"
if [[ -z "${CERT_ARN}" ]]; then
  echo "Requesting a new certificate..."
  CERT_ARN="$(create_certificate)"
else
  echo "Using existing certificate:"
fi
echo "${CERT_ARN}"
echo ""
echo "Add these DNS validation records at your DNS provider:"
if ! print_cert_validation_records "${CERT_ARN}"; then
  echo ""
  echo "Re-run this script in a minute to print the CNAME records:"
  echo "  npm run setup:https"
  exit 0
fi
echo ""

if [[ "${WAIT_FOR_CERT}" == true ]]; then
  wait_for_certificate "${CERT_ARN}"
else
  CERT_STATUS="$(aws acm describe-certificate --region "${CERT_REGION}" --certificate-arn "${CERT_ARN}" --query Certificate.Status --output text)"
  if [[ "${CERT_STATUS}" != "ISSUED" ]]; then
    echo "Certificate status: ${CERT_STATUS}"
    echo "Add the validation CNAME records above, then re-run:"
    echo "  bash scripts/setup-https.sh --wait-for-cert"
    exit 0
  fi
  echo "Certificate status: ISSUED"
fi

echo ""
echo "=== Step 2: CloudFront distribution ==="
DISTRIBUTION_ID="$(find_distribution_id || true)"
CF_DOMAIN=""

if [[ -n "${DISTRIBUTION_ID}" ]]; then
  echo "Found existing distribution: ${DISTRIBUTION_ID}"
  CF_DOMAIN="$(aws cloudfront get-distribution --id "${DISTRIBUTION_ID}" --query "Distribution.DomainName" --output text)"
  echo "Verify in AWS Console (CloudFront -> ${DISTRIBUTION_ID} -> Edit):"
  echo "  - Alternate domain name: ${DOMAIN}"
  if [[ -n "${WWW_DOMAIN}" ]]; then
    echo "  - Alternate domain name: ${WWW_DOMAIN}"
  fi
  echo "  - Custom SSL certificate: ${CERT_ARN}"
  echo "  - Viewer protocol policy: Redirect HTTP to HTTPS"
  echo "  - Custom error responses: 403/404 -> /index.html (200)"
else
  echo "Creating CloudFront distribution..."
  create_distribution "${CERT_ARN}"
  DISTRIBUTION_ID="$(find_distribution_id || true)"
  CF_DOMAIN="$(aws cloudfront get-distribution --id "${DISTRIBUTION_ID}" --query "Distribution.DomainName" --output text)"
fi

echo ""
echo "=== Step 3: Point DNS to CloudFront ==="
echo "CloudFront domain: ${CF_DOMAIN}"
echo "Distribution ID:   ${DISTRIBUTION_ID}"
echo ""
echo "Point this hostname at the CloudFront distribution:"
echo "  ${DOMAIN}"
if [[ -n "${WWW_DOMAIN}" ]]; then
  echo "  ${WWW_DOMAIN}"
fi
echo ""
echo "Route 53: create A + AAAA alias records to ${CF_DOMAIN}"
echo "Other DNS: create CNAME records to ${CF_DOMAIN}"
echo ""
echo "Save for deploys:"
echo "  export CLOUDFRONT_DISTRIBUTION_ID=${DISTRIBUTION_ID}"
echo ""
echo "After DNS propagates, https://${DOMAIN} should work and HTTP will redirect to HTTPS."
