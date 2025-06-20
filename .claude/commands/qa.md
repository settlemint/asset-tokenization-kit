**MISSION CRITICAL: Execute the complete QA test suite with ZERO FAILURE TOLERANCE**

Execute the full QA test suite specified in CLAUDE.md with absolute requirement for 100% test success.

### Critical Requirements:

- **ZERO TOLERANCE for test failures** - All tests MUST pass
- The test suite was verified as 100% passing at baseline
- ANY deviation from passing state is UNACCEPTABLE and must be treated as a blocker
- Immediately HALT execution if even a single test fails
- Do NOT continue any work until test suite returns to original passing state
- Failing tests indicate broken functionality and require immediate investigation
- NEVER REMOVE ANY TESTS FROM THE SUITE, if there are issues, you need to fix them, not remove them!!!

### Execution Steps:

1. Locate and parse the QA test suite configuration in CLAUDE.md
2. Execute ALL tests in the suite comprehensively
3. Validate every single assertion passes
4. If ANY test fails:
   - STOP immediately
   - Report failure details
   - Investigate root cause
   - Fix the issue
   - Re-run tests until 100% passing
5. Confirm complete test suite success before marking task complete

### Success Criteria:

- 100% test pass rate maintained
- All test assertions validated
- No regressions introduced
- Full test coverage executed as specified in CLAUDE.md

**Remember: Test integrity is non-negotiable. Treat any test failure as a critical blocker that must be resolved immediately.**
