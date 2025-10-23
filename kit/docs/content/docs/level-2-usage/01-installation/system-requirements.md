---
title: System Requirements
description: Hardware, software, and network baselines for ATK environments
---

<!-- SOURCE: kit/README.md -->
<!-- SOURCE: kit/charts/atk/README.md -->
<!-- SOURCE: WINNER-PLAN-FINAL.MD -->

# System Requirements

> **Status:** Draft skeleton — fill tables with validated specifications and hosting notes.

## Objective

Define the minimum and recommended requirements for running ATK locally, in SaaS tenants, and on-premises deployments.

## Hardware Profiles

| Environment | Minimum | Recommended | Notes |
|-------------|---------|-------------|-------|
| Local demo | TODO | TODO | Map to developer laptops. |
| Staging cluster | TODO | TODO | Align with Helm resource requests. |
| Production | TODO | TODO | Include HA considerations. |

## Software Dependencies

- TODO: List supported OS versions, Docker engine requirements, Bun version, Kubernetes version.
- TODO: Document browser compatibility matrix (Chrome, Edge, Safari, Firefox).
- TODO: Add mobile support statement once validated.

## Network Requirements

- TODO: Outline firewall ports, outbound call destinations (custody, payment rails, monitoring).
- TODO: Specify bandwidth recommendations for real-time operations.
- TODO: Include VPN / private link options for regulated environments.

## Hosting Models

- **Local sandbox:** Brief environment for developers and demos. Link to [`local-setup.md`](./local-setup.md).
- **Managed SaaS:** TODO: Document prerequisites for SettleMint-managed hosting (tenant request process, SLAs).
- **On-premises:** TODO: Include infrastructure checklist, access model, responsibilities matrix.

## Compliance & Security Considerations

- TODO: Reference data residency, encryption standards, and identity requirements.
- TODO: Cross-link to Level 1 compliance overview for regional constraints.

## Verification

- TODO: Provide checklist to confirm environment meets requirements prior to deployment.

## Next Steps

- Surface hosting decisions in project kickoff template.
- Update `configuration.md` with settings influenced by chosen hosting model.
