# DALP Language & Tone Guidelines for LLMs
## Institutional-Grade Writing Standards from Book of DALP

---

## 🎯 Core Writing Philosophy

The Book of DALP establishes a distinctive voice that combines **institutional gravitas** with **technical precision** and **bold assertions**. Every statement drives toward business outcomes, not technical features. Every claim references evidence. Every solution addresses a named problem.

### The DALP Voice Formula
**Bold conclusion** → **Evidence** → **Regulatory context** → **Business outcome**

> "**Settlement risk is optional. We remove it.** The Asset Tokenization Kit treats T+0 as the default by shipping ready-to-use atomic settlement patterns, the Cross-Value Proposition (XvP) addon stack, and the payment-rail integrations required to run them."

---

## 📐 Universal Writing Principles

### 1. Lead with Provocative Truth
- **Start with the problem, brutally stated**: "The tokenization market stalled because it runs on a patchwork of point solutions"
- **Name the enemy explicitly**: "Fragmentation keeps institutions exposed"
- **Quantify the pain**: "$2-5M wasted on integration, T+2 settlement risk, 60% manual reconciliation"

### 2. Evidence Over Adjectives
- **NEVER**: "Our superior platform delivers excellence"
- **ALWAYS**: "Settlement finality in 1-3 seconds vs T+2 batch processing"
- **NEVER**: "Industry-leading compliance"
- **ALWAYS**: "Pre-transfer validation aligned with MiFID II Article 27"

### 3. The Non-Negotiable Framing
When defining requirements, use the DALP pattern:
> "If any of these are missing, you do not have a DALP; you have another integration project."

List non-negotiables as numbered laws with bold headers and specific metrics.

### 4. Metrics Are Proof
- Always include targets vs current state
- Use precise measurements: basis points, settlement cycles, uptime percentages
- Present in tables when comparing multiple metrics

| Capability | Target | Current | Notes |
|------------|--------|---------|-------|
| Settlement finality | T+0 | T+0 on 99.2% | No manual fallback |
| Compliance incidents | 0 | 0 | Zero tolerance |
| KYC turnaround | <24 hours | 16 hours p95 | Federated KYC |

### 5. Bold Text for Conclusions
Use **bold text** to highlight:
- Key conclusions and assertions
- Critical terminology on first use
- Non-negotiable requirements
- Quantified outcomes

---

## 🗣️ Level-Specific Language Guidelines

### Level 1: Generic/Business Documentation
**Audience**: Executives, Decision Makers, Sales Teams  
**Voice**: Bold, direct, outcome-focused

#### Opening Pattern
```
The problem: [System failure in plain terms]
The opportunity: [Quantified market size]
The solution: [What the DALP does differently]
The outcome: [Business metrics achieved]
```

#### Language Rules
- **Use active voice with named actors**: "Institutions face $2-5M integration costs" not "Integration costs are high"
- **Lead with market failures**: Start sections with what's broken in the current system
- **Quantify everything**: "95% cost reduction" not "significant savings"
- **Reference frameworks, not features**: "MiCA-compliant asset lifecycle" not "compliance features"

#### Terminology for Level 1
| Instead of | Use |
|------------|-----|
| blockchain platform | Digital Asset Lifecycle Platform (DALP) |
| compliance features | regulatory framework aligned with MiFID II/MiCA |
| fast settlement | T+0 atomic finality vs T+2 batch processing |
| user management | identity registry with federated KYC |
| smart contracts | distributed ledger protocols |

#### Example Paragraph (Level 1)
> **The tokenization market stalled at $50B because institutions can't trust fragmented infrastructure.** Current solutions force organizations to stitch together 5-7 vendors for one asset lifecycle, creating reconciliation gaps, compliance blind spots, and $100K+ monthly operational costs. The Digital Asset Lifecycle Platform (DALP) collapses this complexity into a single control plane that enforces compliance before transfers, settles atomically in 1-3 seconds, and reduces total costs by 95%. This isn't another integration project; it's market infrastructure that runs issuance → compliance → custody → settlement without handoffs.

---

### Level 2: Usage/Operations Documentation
**Audience**: Platform Operators, Administrators, Compliance Teams  
**Voice**: Procedural, precise, outcome-oriented

#### Opening Pattern
```
Objective: [What operation achieves]
Prerequisites: [Required state/permissions]
Procedure: [Numbered steps with checkpoints]
Verification: [How to confirm success]
SLA: [Time targets and escalation]
```

#### Language Rules
- **Use imperative mood**: "Configure compliance modules" not "You should configure"
- **Include timing and SLAs**: "15 min triage, 4h resolution"
- **Reference specific modules**: "Enable CountryAllowList module with EU27 parameters"
- **State outcomes explicitly**: "Transfers from restricted jurisdictions will revert with COUNTRY_BLOCKED reason"

#### Terminology for Level 2
| Instead of | Use |
|------------|-----|
| set up compliance | configure jurisdictional rule engine |
| add users | onboard identities with KYC claims |
| issue tokens | execute primary market creation |
| send tokens | process securities movement with eligibility validation |
| check balance | query securities position |

#### Example Section (Level 2)
> ### Configure MiCA Compliance for EU Distribution
> 
> **Objective**: Enable automated compliance for EU27 distribution under MiCA Title III requirements.
> 
> **Prerequisites**:
> - COMPLIANCE_ADMIN role assigned
> - Trusted issuer registry configured
> - EU template loaded (check: `hasTemplate("EU_MICA_2024")`)
> 
> **Procedure**:
> 1. Access compliance configuration at `/compliance/modules`
> 2. Enable CountryAllowList with parameters:
>    ```
>    allowed_countries: EU27
>    block_mode: EXPLICIT_DENY
>    grace_period: 0
>    ```
> 3. Configure SupplyCap for €8M limit:
>    ```
>    max_supply_eur: 8000000
>    calculation: ROLLING_12M
>    ```
> 4. Activate TransferApproval for amounts >€100K
> 5. Deploy configuration with maker-checker approval
> 
> **Verification**: 
> - Test transfer from non-EU wallet → should revert with `COUNTRY_BLOCKED`
> - Check supply tracker shows remaining capacity
> - Confirm audit log captures configuration change
> 
> **SLA**: Configuration active within 5 minutes of deployment

---

### Level 3: Developer/Modifications Documentation
**Audience**: Developers, System Architects, Integration Teams  
**Voice**: Technical, reference-heavy, implementation-focused

#### Opening Pattern
```
Component: [System/module name with path]
Interface: [Key functions/APIs]
Dependencies: [Required services/contracts]
Implementation: [Code with explanations]
Testing: [Verification approach]
References: [File paths and standards]
```

#### Language Rules
- **Always include file paths**: `(ref: /kit/contracts/contracts/smart/modules/CountryAllowList.sol)`
- **Reference specific functions**: `validateTransfer()` not "validation logic"
- **Include gas costs and complexity**: "O(n) complexity, ~45K gas for 10 countries"
- **State upgrade implications**: "Storage slot 7 reserved for future expansion"

#### Terminology for Level 3
| Instead of | Use |
|------------|-----|
| API call | ORPC procedure invocation |
| database | PostgreSQL with Drizzle ORM schema |
| event handler | subgraph mapping function |
| configuration | environment variables via .env.local |
| authentication | Better Auth with session management |

#### Example Section (Level 3)
> ### Implement Custom Compliance Module
> 
> **Component**: `/kit/contracts/contracts/smart/modules/IComplianceModule.sol`
> 
> **Interface**:
> ```solidity
> interface IComplianceModule {
>     function validateTransfer(
>         address from,
>         address to,
>         uint256 amount
>     ) external view returns (bool, string memory);
> }
> ```
> 
> **Implementation Pattern**:
> ```solidity
> contract RegionalCompliance is IComplianceModule {
>     mapping(address => uint16) public countryIds;  // Storage slot 0
>     uint256 public allowedCountries;                // Storage slot 1 (bitmap)
>     
>     function validateTransfer(
>         address from,
>         address to,
>         uint256 amount
>     ) external view override returns (bool, string memory) {
>         uint16 toCountry = countryIds[to];
>         if ((allowedCountries >> toCountry) & 1 == 0) {
>             return (false, "COUNTRY_BLOCKED");
>         }
>         return (true, "");
>     }
> }
> ```
> 
> **Gas Analysis**: 
> - Cold read: ~2600 gas (SLOAD)
> - Bitmap check: ~30 gas
> - Total: ~2700 gas per validation
> 
> **Testing** (ref: `/kit/contracts/test/modules/RegionalCompliance.t.sol`):
> ```solidity
> function testBlockedCountryReverts() public {
>     vm.expectRevert("COUNTRY_BLOCKED");
>     token.transfer(blockedAddress, 100);
> }
> ```

---

## 📚 Core Terminology Matrix

### Institutional Replacements (All Levels)

| Casual/Crypto Term | DALP Institutional Term | Context |
|--------------------|------------------------|---------|
| **token** | digital security / tokenized instrument | Use "security" for regulated assets |
| **mint** | securities issuance / primary market creation | Emphasize regulated creation |
| **burn** | securities redemption / supply contraction | Focus on authorized reduction |
| **transfer** | transfer of beneficial interest | Emphasize ownership change |
| **wallet** | securities account / digital custody account | Institutional framing |
| **smart contract** | distributed ledger protocol / DLT application logic | Avoid "smart" terminology |
| **whitelist** | eligibility list / qualified investor register | Compliance-focused language |
| **gas fees** | network transaction costs / DLT processing fees | Professional cost terminology |
| **stake/staking** | securities immobilization / collateral posting | Traditional finance terms |
| **yield/rewards** | income distribution / coupon payment | Standard financial terminology |
| **snapshot** | record date determination / holder registry capture | Corporate action language |
| **multi-sig** | multiple authorization control / n-of-m approval | Enterprise control terminology |

### DALP-Specific Terms (Must Use Consistently)

| Concept | DALP Terminology | Definition |
|---------|------------------|------------|
| **Platform** | Digital Asset Lifecycle Platform (DALP) | Full-stack compliance-native infrastructure |
| **Compliance** | Pre-transfer ex-ante validation | Validation before state change |
| **Settlement** | Atomic DvP with settlement finality | Simultaneous irreversible exchange |
| **Identity** | Federated KYC with portable claims | Reusable identity across venues |
| **Architecture** | Plane-based architecture | Separation of concerns by function |
| **Deployment** | On-prem/BYOC/Dedicated SaaS | Three deployment models |
| **Rules** | Jurisdictional rule engine | Encoded regulatory requirements |
| **Integration** | ISO 20022-aligned messaging | Standard payment rail integration |

---

## 🔧 Sentence Templates & Patterns

### Problem → Solution Templates

#### Market Failure Pattern
> "**The problem:** [Current system failure]. [Quantified pain point]. [Who suffers and how]."
> 
> "**The solution:** [What DALP does differently]. [How it works]. [Outcome achieved]."

Example:
> "**The problem:** Tokenization projects chain together 5-7 vendors for one asset lifecycle. Integration costs reach $2-5M upfront with $100K+ monthly operations. Institutions spend more on reconciliation than innovation."
>
> "**The solution:** The DALP collapses the stack into one programmable control plane. Compliance, custody, and settlement execute from the same runtime. Total cost drops 95% while settlement accelerates from T+2 to T+0."

### Compliance Statement Templates

#### Regulatory Alignment
> "The platform enforces [requirement] through [mechanism] aligned with [regulation Article X], ensuring [outcome] with [metric]."

Example:
> "The platform enforces investor eligibility through pre-transfer validation aligned with MiFID II Article 24, ensuring only qualified investors participate with 100% automated screening."

#### By-Construction Compliance
> "Compliance operates by construction: [rule] executes before [action], preventing [violation] while maintaining [audit trail]."

Example:
> "Compliance operates by construction: jurisdictional rules execute before any transfer, preventing cross-border violations while maintaining immutable audit trails for regulatory examination."

### Settlement & Operations Templates

#### Settlement Pattern
> "Settlement achieves [outcome] through [mechanism] in [timeframe], eliminating [risk] that plagues [traditional approach]."

Example:
> "Settlement achieves irrevocable finality through atomic DvP in 1-3 seconds, eliminating the principal risk that plagues T+2 batch processing."

#### Integration Pattern
> "Integration with [system] operates through [standard/protocol], maintaining [critical invariant] while enabling [business capability]."

Example:
> "Integration with core banking operates through ISO 20022 messaging, maintaining settlement finality guarantees while enabling fiat rail coordination."

### Metrics Presentation Templates

#### Comparison Pattern
> "[Metric name]: [DALP performance] vs [traditional performance], delivering [percentage improvement] in [business outcome]."

Example:
> "Settlement efficiency: 1-3 second atomic finality vs T+2 batch processing, delivering 99% reduction in counterparty exposure."

#### SLA Pattern
> "[Operation]: [target metric] with [current achievement], backed by [evidence/guarantee]."

Example:
> "KYC processing: <24 hour target with 16 hour p95 achievement, backed by federated identity networks."

---

## 📏 Writing Rules & Standards

### Must-Have Elements

#### Every Section Must Include:
1. **Bold opening statement** that names the problem or conclusion
2. **Specific metrics** with comparisons to traditional systems
3. **Regulatory citations** with article/section numbers where applicable
4. **Evidence references** (file paths for code, appendix references for specs)
5. **Business outcome** stated explicitly, not implied

#### Technical Claims Requirements:
- Reference actual implementation: `(ref: /kit/contracts/contracts/...)`
- Include complexity/gas costs for blockchain operations
- State dependencies explicitly
- Provide testing references

#### Regulatory Claims Requirements:
- Cite specific articles: "MiFID II Article 27"
- Name the obligation: "best execution requirement"
- State the implementation: "pre-trade validation"
- Include the outcome: "100% compliant transfers"

### Prohibited Elements

#### Never Use:
- ❌ Marketing superlatives: "revolutionary", "industry-leading", "cutting-edge", "best-in-class"
- ❌ Vague quantifiers: "significant", "substantial", "major", "enhanced"
- ❌ Feature-focused language: "powerful features", "robust capabilities", "comprehensive suite"
- ❌ Unsubstantiated claims: "bank-grade" without specifics, "enterprise-ready" without evidence
- ❌ Passive voice for problems: "mistakes were made" vs "institutions lose $2M"

#### Replace With:
- ✅ Specific metrics: "95% cost reduction", "T+0 settlement", "99.9% uptime"
- ✅ Regulatory alignment: "MiCA Title III compliant", "FATF Recommendation 15 aligned"
- ✅ Outcome statements: "eliminates reconciliation", "prevents compliance breaches"
- ✅ Evidence-backed claims: "MPC key management (ref: Appendix K)", "SOC2 Type II certified"

---

## 📊 Metrics & Measurement Standards

### Financial Metrics Presentation

#### Cost Comparisons
- Always show: Traditional cost → DALP cost → Percentage reduction
- Include TCO: Upfront + operational + hidden costs
- Time horizon: 3-year TCO for enterprise comparisons

Example:
> "**Total cost of ownership (3-year):**
> - Traditional infrastructure: $2-5M setup + $100K/month operations = $5.6-8.6M
> - DALP implementation: $50-250K setup + <$10K/month operations = $410K-610K
> - **Reduction: 92-95%**"

#### Performance Metrics
- Settlement: Always compare T+N cycles
- Throughput: Transactions per second with gas costs
- Availability: Uptime percentage with SLA commitment
- Latency: p50, p95, p99 percentiles

### Compliance Metrics

#### Required Measurements
- **Regulatory breaches**: Always zero tolerance
- **KYC completion**: Time from submission to approval
- **Audit findings**: Critical/High/Medium/Low classification
- **Compliance automation**: Percentage of automated vs manual

#### Presentation Format
| Compliance Metric | Target | Current | Method |
|------------------|--------|---------|---------|
| Regulatory incidents | 0 | 0 | Pre-transfer validation |
| KYC turnaround | <24h | 16h p95 | Federated KYC |
| Auto-approval rate | >95% | 97% | Rule engine |

### Operational Metrics

#### SLA Standards
- **Response times**: Triage → Resolution timeframes
- **Availability**: System/component uptime percentages
- **Recovery**: RTO/RPO commitments
- **Throughput**: Peak/sustained transaction rates

Format:
> "**Corporate action SLA:**
> - Detection → Notification: 45-60 minutes
> - Instruction capture → Execution: <18 hours
> - Exception rate: <1%
> - Automation level: 85-95%"

---

## ✅ Quality Assurance Checklist

### Before Publishing Any Document

#### Content Verification
- [ ] **Every problem statement** includes quantified pain ($, time, risk)
- [ ] **Every solution** maps to a specific problem
- [ ] **Every metric** includes comparison to traditional approach
- [ ] **Every regulatory claim** cites specific article/section
- [ ] **Every technical claim** references implementation path

#### Language Compliance
- [ ] **Bold text** highlights key conclusions and terminology
- [ ] **Terminology** matches DALP matrix (no casual crypto terms)
- [ ] **Structure** follows Problem → Solution → Evidence → Outcome
- [ ] **Voice** matches level (Bold/Procedural/Technical)
- [ ] **No marketing language** (check prohibited list)

#### Evidence Requirements
- [ ] **Code references** include full file paths
- [ ] **Metrics** include source/calculation method
- [ ] **Regulatory framework** properly cited
- [ ] **SLAs** stated with current achievement
- [ ] **Architecture** references actual components

#### Level-Specific Validation

**Level 1 (Business)**:
- [ ] Opens with market failure
- [ ] Includes ROI calculation
- [ ] References regulatory frameworks
- [ ] Ends with business outcome

**Level 2 (Operations)**:
- [ ] Includes prerequisites
- [ ] Numbers all steps
- [ ] States verification method
- [ ] Includes timing/SLA

**Level 3 (Developer)**:
- [ ] Includes interface definitions
- [ ] Shows implementation code
- [ ] References test files
- [ ] States complexity/gas costs

---

## 📝 Reference Examples

### Perfect Level 1 Opening
> **Fragmented tokenization is dead. Institutions need lifecycle control.**
> 
> The tokenization market stalled at $50B because enterprises can't trust infrastructure that requires 5-7 vendors for one asset lifecycle. Every handoff creates compliance gaps that regulators punish and boards fear. The Digital Asset Lifecycle Platform collapses this complexity into one programmable control plane where compliance executes before transfers, settlement happens atomically, and operations run without reconciliation. This isn't another tool to integrate; it's the market infrastructure that makes tokenization institutional.

### Perfect Level 2 Procedure
> ### Enable Atomic Settlement
> 
> **Objective**: Configure DvP settlement to eliminate counterparty risk.
> 
> 1. Deploy XvP addon contract:
>    ```
>    deploy --addon xvp --params settlement.yaml
>    ```
> 2. Configure escrow parameters:
>    - Timeout: 300 seconds
>    - Auto-revert: true
>    - ISO 20022: enabled
> 3. Test with small amount transfer
> 4. Monitor first 10 production settlements
> 
> **Verification**: Check `settlement.finalized` events show both legs complete.
> **SLA**: Settlement finality in 1-3 seconds for on-chain legs.

### Perfect Level 3 Reference
> ### Compliance Module Interface
> 
> **Component**: `/kit/contracts/contracts/smart/modules/IComplianceModule.sol:14-22`
> 
> The validation interface executes before every transfer:
> ```solidity
> function validateTransfer(
>     address from,
>     address to, 
>     uint256 amount
> ) external view returns (bool valid, string memory reason);
> ```
> 
> **Gas cost**: 2,700-5,000 depending on rule complexity
> **Test coverage**: `/kit/contracts/test/modules/` (31 test files)

---

## 🎯 Final Guidance

The Book of DALP established a new standard for tokenization documentation: **institutional gravitas without corporate blandness**, **technical precision without jargon**, **bold claims with evidence**. 

Every line of documentation should answer: **What problem does this solve? What outcome does it deliver? Where's the proof?**

When in doubt:
- **Be more direct** (name the problem brutally)
- **Be more specific** (95% not "significant")
- **Be more evidenced** (ref: actual files)
- **Be more outcome-focused** (business result, not feature)

The DALP doesn't apologize for its opinions. Neither should its documentation.

**The standard is set. Meet it.**

