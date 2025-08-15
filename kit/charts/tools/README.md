# AWS Marketplace Automation Script

## Overview

This script automates the complete AWS Marketplace submission process for the SettleMint Asset Tokenization Kit. It handles:

- 📦 **Container Image Upload**: Automatically uploads all 33+ container images from `values.yaml` to AWS ECR
- 🚢 **Helm Chart Upload**: Packages and uploads the Helm chart as an OCI artifact to ECR
- 🚀 **Marketplace Submission**: Creates a new version in AWS Marketplace with proper change set format
- ⏱️ **Status Monitoring**: Monitors the submission status with quick 5-check validation

## Prerequisites

### 1. AWS Credentials & Permissions

You need AWS credentials with the following permissions:

#### IAM Policy Requirements
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ecr:GetAuthorizationToken",
        "ecr:CreateRepository",
        "ecr:DescribeImages",
        "ecr:BatchCheckLayerAvailability",
        "ecr:GetDownloadUrlForLayer",
        "ecr:BatchGetImage",
        "ecr:PutImage",
        "ecr:InitiateLayerUpload",
        "ecr:UploadLayerPart",
        "ecr:CompleteLayerUpload"
      ],
      "Resource": [
        "arn:aws:ecr:us-east-1:*:repository/settlemint/*"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "aws-marketplace:StartChangeSet",
        "aws-marketplace:DescribeChangeSet",
        "aws-marketplace:ListChangeSets"
      ],
      "Resource": "*"
    }
  ]
}
```

### 2. Required Tools

- **Docker**: For pulling, tagging, and pushing container images
- **Helm**: For packaging and pushing the Helm chart (v3.8+)
- **AWS CLI**: For ECR authentication
- **Bun**: For running the TypeScript script

### 3. AWS Marketplace Setup

- Active AWS Marketplace seller account
- Existing container product listing
- Product ID from AWS Marketplace Console

## Environment Variables

All environment variables are **required** with no defaults:

```bash
# AWS Credentials
export AWS_ACCESS_KEY_ID="AKIA..."
export AWS_SECRET_ACCESS_KEY="abc123..."

# AWS Marketplace Configuration
export AWS_MARKETPLACE_PRODUCT_ID="prod-3hhx4gxa4ilns"
export AWS_TARGET_ECR_ACCOUNT="709865623651"
```

### Getting Your Values

#### AWS_MARKETPLACE_PRODUCT_ID
1. Go to [AWS Marketplace Management Portal](https://aws.amazon.com/marketplace/management/)
2. Navigate to **Products** → **Container products**
3. Find your product and copy the Product ID (starts with `prod-`)

#### AWS_TARGET_ECR_ACCOUNT
- The AWS account ID where your ECR repositories are hosted
- Usually your main AWS account ID (12-digit number)

## Usage

### Option 1: Using Bun Command (Recommended)

```bash
# Set environment variables
export AWS_ACCESS_KEY_ID="your_access_key"
export AWS_SECRET_ACCESS_KEY="your_secret_key"
export AWS_MARKETPLACE_PRODUCT_ID="prod-3hhx4gxa4ilns"
export AWS_TARGET_ECR_ACCOUNT="709865623651"

# Run from charts directory
cd kit/charts
bun run aws-marketplace
```

### Option 2: Direct Execution

```bash
# Set environment variables first (as above)

# Run directly
cd kit/charts/tools
bun run aws-marketplace-automation.ts
```

## What the Script Does

### Phase 1: Helm Chart Upload
- Packages the ATK Helm chart from `../atk/`
- Logs into ECR using AWS credentials
- Creates ECR repository `settlemint/atk` if needed
- Pushes chart as OCI artifact to `{account}.dkr.ecr.us-east-1.amazonaws.com/settlemint/atk:{version}`

### Phase 2: Container Images Upload
- Extracts all image references from `../atk/values.yaml`
- Creates ECR repositories with path `settlemint/{registry}/{image}`
- Pulls original images from public registries
- Re-tags and pushes to ECR with consistent naming:
  - `docker.io/nginx:1.29.1` → `{account}.dkr.ecr.us-east-1.amazonaws.com/settlemint/docker.io/nginx:1.29.1`
  - `quay.io/prometheus/node-exporter:v1.8.2` → `{account}.dkr.ecr.us-east-1.amazonaws.com/settlemint/quay.io/prometheus/node-exporter:v1.8.2`

### Phase 3: AWS Marketplace Submission
- Creates a properly formatted change set for AWS Marketplace
- Includes all container images in `ContainerImages` array
- Specifies Helm chart separately in `HelmChartUri` field
- Submits with comprehensive metadata and release notes

### Phase 4: Status Monitoring
- Checks submission status 5 times with 15-second intervals
- Exits early if status becomes `SUCCEEDED` or `FAILED`
- After 5 checks, assumes success if still `PREPARING` (normal for AWS review process)

## Output Example

```
🚀 Starting AWS Marketplace automation...
🚀 Starting Helm chart upload to ECR...
✅ Successfully uploaded Helm chart: 709825985650.dkr.ecr.us-east-1.amazonaws.com/settlemint/atk:0.0.6
🚀 Starting image upload to ECR...
📦 Found 33 images to upload:
✅ Successfully uploaded: 709825985650.dkr.ecr.us-east-1.amazonaws.com/settlemint/docker.io/nginx:1.29.1-alpine
... (32 more images)
🚀 Creating new version 0.0.6 in AWS Marketplace...
✅ Change set created successfully!
🆔 Change Set ID: abc123def456
⏳ Monitoring change set: abc123def456
📊 Check 1/5 - Status: PREPARING
⏱️  Waiting 15 seconds before next check...
📊 Check 5/5 - Status: PREPARING
✅ Change set is still in progress after 5 checks.
🎯 Assuming successful publication - AWS review typically takes hours/days.
✅ AWS Marketplace automation completed successfully!
```

## Error Handling

### Common Issues

#### Missing Environment Variables
```
❌ Missing required environment variables:
   All of the following are required:
   - AWS_ACCESS_KEY_ID
   - AWS_SECRET_ACCESS_KEY
   - AWS_MARKETPLACE_PRODUCT_ID
   - AWS_TARGET_ECR_ACCOUNT
```
**Solution**: Set all required environment variables

#### AWS Permissions Error
```
❌ AccessDenied: User not authorized to perform: ecr:CreateRepository
```
**Solution**: Add required IAM permissions (see Prerequisites section)

#### Docker Not Running
```
❌ Error: Cannot connect to the Docker daemon
```
**Solution**: Start Docker Desktop or Docker daemon

#### Immutable Tag Errors
```
⚠️ Image already exists (immutable): 709825985650.dkr.ecr.us-east-1.amazonaws.com/settlemint/docker.io/nginx:1.29.1-alpine
```
**This is normal**: ECR repositories have immutable tags by default. The script continues successfully.

### Recovery

The script is designed to be idempotent:
- **Failed uploads**: Re-running will retry failed images while skipping successful ones
- **Partial completion**: Each phase can succeed independently
- **Network issues**: Temporary failures won't affect already-uploaded artifacts

## File Structure

```
kit/charts/tools/
├── aws-marketplace-automation.ts  # Main automation script
├── README.md                      # This file
└── ...

kit/charts/atk/
├── Chart.yaml                     # Helm chart metadata (version info)
├── values.yaml                    # Container image references
└── ...
```

## Troubleshooting

### Script Fails at Helm Chart Upload
1. Verify Helm is installed: `helm version`
2. Check AWS credentials: `aws sts get-caller-identity`
3. Ensure ECR permissions for repository creation

### Script Fails at Image Upload
1. Verify Docker is running: `docker info`
2. Check if images exist in public registries
3. Verify ECR permissions for image push/pull

### Script Fails at Marketplace Submission
1. Verify AWS Marketplace seller account status
2. Check product ID is correct and product exists
3. Ensure marketplace permissions in IAM policy

### Change Set Shows as FAILED
1. Check AWS Marketplace Console for detailed error messages
2. Verify all container images are accessible and scannable
3. Ensure Helm chart URI format is correct

## Security Notes

- **Never commit AWS credentials** to version control
- Use IAM roles in production environments when possible
- Regularly rotate access keys
- Follow AWS security best practices for ECR and Marketplace access

## Support

For issues with:
- **This script**: Check troubleshooting section above
- **AWS Marketplace**: Contact AWS Marketplace Support
- **SettleMint ATK**: Contact support@settlemint.com