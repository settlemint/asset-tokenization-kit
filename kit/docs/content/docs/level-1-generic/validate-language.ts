#!/usr/bin/env bun
/**
 * DALP Language Compliance Validator for Level 1 Documentation
 * Ensures all content follows institutional voice and terminology requirements
 */

import { readdir, readFile } from 'fs/promises';
import { join } from 'path';

// Language rules from DALP_LANGUAGE_GUIDELINES.md
const FORBIDDEN_WORDS = [
  'revolutionary', 'industry-leading', 'cutting-edge', 'best-in-class',
  'powerful features', 'robust capabilities', 'comprehensive suite',
  'significant', 'substantial', 'major', 'enhanced'
];

const REQUIRED_REPLACEMENTS = {
  'token': 'digital security',
  'mint': 'securities issuance',
  'burn': 'securities redemption', 
  'wallet': 'securities account',
  'smart contract': 'distributed ledger protocol',
  'whitelist': 'eligibility list',
  'gas fees': 'network transaction costs',
  'yield': 'income distribution',
  'staking': 'securities immobilization'
};

const REQUIRED_PATTERNS = {
  boldOpening: /^\*\*[A-Z]/m,
  metrics: /\d+%|\$[\d,]+[MBK]?|T\+\d|[\d.]+-[\d.]+ (seconds?|minutes?|hours?|days?)/,
  evidence: /\(ref:|Part [IVX]+\/|Appendix [A-Z]|\/kit\//,
  outcome: /(ROI|efficiency|reduction|improvement|eliminat|transform|achiev)/i
};

interface ValidationResult {
  file: string;
  violations: string[];
  warnings: string[];
  metrics: {
    hasMetrics: boolean;
    hasBoldOpening: boolean;
    hasEvidence: boolean;
    hasOutcome: boolean;
  };
}

async function validateFile(filePath: string): Promise<ValidationResult> {
  const content = await readFile(filePath, 'utf-8');
  const violations: string[] = [];
  const warnings: string[] = [];
  
  // Skip framework and validation files
  if (filePath.includes('EXECUTION_FRAMEWORK') || filePath.includes('validate-language')) {
    return { file: filePath, violations: [], warnings: [], metrics: {
      hasMetrics: true, hasBoldOpening: true, hasEvidence: true, hasOutcome: true
    }};
  }
  
  // Check forbidden words
  FORBIDDEN_WORDS.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    const matches = content.match(regex);
    if (matches) {
      violations.push(`Forbidden word "${word}" found ${matches.length} time(s)`);
    }
  });
  
  // Check for crypto terminology that should be replaced
  Object.entries(REQUIRED_REPLACEMENTS).forEach(([wrong, correct]) => {
    const regex = new RegExp(`\\b${wrong}s?\\b`, 'gi');
    const matches = content.match(regex);
    if (matches) {
      // Check if the correct term is also present
      if (!content.toLowerCase().includes(correct.toLowerCase())) {
        violations.push(`Replace "${wrong}" with "${correct}" (${matches.length} occurrences)`);
      } else {
        warnings.push(`Both "${wrong}" and "${correct}" found - ensure consistency`);
      }
    }
  });
  
  // Check required patterns
  const metrics = {
    hasMetrics: REQUIRED_PATTERNS.metrics.test(content),
    hasBoldOpening: REQUIRED_PATTERNS.boldOpening.test(content),
    hasEvidence: REQUIRED_PATTERNS.evidence.test(content),
    hasOutcome: REQUIRED_PATTERNS.outcome.test(content)
  };
  
  if (!metrics.hasMetrics) {
    warnings.push('Missing quantified metrics (percentages, amounts, timeframes)');
  }
  
  if (!metrics.hasBoldOpening) {
    warnings.push('Missing bold opening statement');
  }
  
  if (!metrics.hasEvidence && content.length > 500) {
    warnings.push('Missing evidence references (source citations)');
  }
  
  if (!metrics.hasOutcome && content.length > 1000) {
    warnings.push('Missing clear business outcome statement');
  }
  
  // Check for passive voice in problem statements
  const passivePatterns = [
    /mistakes were made/gi,
    /has been/gi,
    /is being/gi,
    /was done/gi
  ];
  
  passivePatterns.forEach(pattern => {
    if (pattern.test(content)) {
      warnings.push('Passive voice detected - use active voice with named actors');
    }
  });
  
  // Check source attribution
  if (!content.includes('SOURCE:') && !content.includes('<!-- SOURCE')) {
    warnings.push('Missing source attribution comment');
  }
  
  return {
    file: filePath,
    violations,
    warnings,
    metrics
  };
}

async function validateDirectory(dirPath: string): Promise<ValidationResult[]> {
  const results: ValidationResult[] = [];
  const entries = await readdir(dirPath, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = join(dirPath, entry.name);
    
    if (entry.isDirectory() && !entry.name.startsWith('.')) {
      const subResults = await validateDirectory(fullPath);
      results.push(...subResults);
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      const result = await validateFile(fullPath);
      results.push(result);
    }
  }
  
  return results;
}

async function main() {
  console.log('🔍 DALP Language Compliance Validator\n');
  console.log('Checking Level 1 documentation for language compliance...\n');
  
  const baseDir = process.argv[2] || './';
  const results = await validateDirectory(baseDir);
  
  let totalViolations = 0;
  let totalWarnings = 0;
  let filesWithIssues = 0;
  
  results.forEach(result => {
    if (result.violations.length > 0 || result.warnings.length > 0) {
      filesWithIssues++;
      const fileName = result.file.replace(baseDir, '').replace(/^\//, '');
      console.log(`\n📄 ${fileName}`);
      
      if (result.violations.length > 0) {
        console.log('  ❌ Violations:');
        result.violations.forEach(v => {
          console.log(`     - ${v}`);
          totalViolations++;
        });
      }
      
      if (result.warnings.length > 0) {
        console.log('  ⚠️  Warnings:');
        result.warnings.forEach(w => {
          console.log(`     - ${w}`);
          totalWarnings++;
        });
      }
      
      // Show metrics status
      console.log('  📊 Metrics:');
      console.log(`     Bold Opening: ${result.metrics.hasBoldOpening ? '✅' : '❌'}`);
      console.log(`     Quantification: ${result.metrics.hasMetrics ? '✅' : '❌'}`);
      console.log(`     Evidence: ${result.metrics.hasEvidence ? '✅' : '❌'}`);
      console.log(`     Outcome: ${result.metrics.hasOutcome ? '✅' : '❌'}`);
    }
  });
  
  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 VALIDATION SUMMARY\n');
  console.log(`Files checked: ${results.length}`);
  console.log(`Files with issues: ${filesWithIssues}`);
  console.log(`Total violations: ${totalViolations} ❌`);
  console.log(`Total warnings: ${totalWarnings} ⚠️`);
  
  if (totalViolations === 0 && totalWarnings === 0) {
    console.log('\n✅ All files pass DALP language compliance!');
    process.exit(0);
  } else if (totalViolations === 0) {
    console.log('\n⚠️  No violations, but warnings should be reviewed.');
    process.exit(0);
  } else {
    console.log('\n❌ Violations must be fixed before documentation is approved.');
    process.exit(1);
  }
}

// Run validation
main().catch(console.error);
