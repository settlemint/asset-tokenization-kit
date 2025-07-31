// Shared Context Management System for Agent Handoffs

export interface AgentContext {
  sessionId: string;
  taskId: string;
  projectState: ProjectState;
  decisions: DecisionRecord;
  caches: CacheStore;
  handoffs: HandoffQueue;
}

export interface ProjectState {
  contractAddresses: Record<string, string>;
  apiEndpoints: Record<string, string>;
  migrationStates: Record<string, number>;
  deployedServices: Record<string, DeploymentInfo>;
  testResults: Record<string, TestResult>;
}

export interface DeploymentInfo {
  version: string;
  environment: "development" | "staging" | "production";
  timestamp: number;
  health: "healthy" | "degraded" | "failing";
}

export interface TestResult {
  passed: boolean;
  coverage: number;
  timestamp: number;
  details?: string;
}

export interface DecisionRecord {
  [key: string]: Decision;
}

export interface Decision {
  value: any;
  rationale: string;
  timestamp: number;
  madeBy: string;
  alternatives?: Alternative[];
}

export interface Alternative {
  value: any;
  pros: string[];
  cons: string[];
  rejectionReason: string;
}

export interface CacheStore {
  gemini: Record<string, CacheEntry>;
  context7: Record<string, CacheEntry>;
  realWorldExamples: Record<string, CacheEntry>;
  agentOutputs: Record<string, AgentOutput>;
}

export interface CacheEntry {
  data: any;
  timestamp: number;
  ttl: number;
  scope: "session" | "task" | "global";
}

export interface HandoffQueue {
  pending: HandoffItem[];
  completed: HandoffItem[];
  blocked: BlockedHandoff[];
}

export interface HandoffItem {
  fromAgent: string;
  toAgents: string[];
  context: HandoffContext;
  priority: "critical" | "high" | "medium" | "low";
  timestamp: number;
}

export interface HandoffContext {
  dependencies: string[];
  constraints: Record<string, any>;
  artifacts: Record<string, string>; // key: artifact type, value: location
  decisions: string[]; // keys from DecisionRecord
}

export interface BlockedHandoff extends HandoffItem {
  blockReason: string;
  unblockConditions: string[];
}

// Enhanced Agent Return Format
export interface AgentOutput {
  // Executive Summary
  taskCompletion: TaskCompletion;
  summary: ExecutiveSummary;

  // Technical Deliverables
  deliverables: TechnicalDeliverables;

  // Context for Next Agents
  contextHandoff: ContextHandoff;

  // Quality Gates
  qualityGates: QualityGates;

  // Cache References
  cacheKeys: CacheReferences;

  // Metrics
  metrics: ExecutionMetrics;
}

export interface TaskCompletion {
  status: "completed" | "blocked" | "partial";
  blockers?: string[];
  partialReason?: string;
}

export interface ExecutiveSummary {
  primaryOutcome: string;
  confidenceLevel: "high" | "medium" | "low";
  keyDecisions: string[];
}

export interface TechnicalDeliverables {
  filesModified: FileModification[];
  artifactsCreated: Artifact[];
  configurationsChanged: ConfigChange[];
  codeSnippets: CodeSnippet[];
}

export interface FileModification {
  path: string;
  changeType: "created" | "modified" | "deleted";
  specificChanges: string;
  linesAdded: number;
  linesRemoved: number;
}

export interface Artifact {
  type: "contract" | "api" | "component" | "type" | "test" | "config";
  name: string;
  location: string;
  interfaces?: string[];
}

export interface ConfigChange {
  file: string;
  changes: Record<string, any>;
}

export interface CodeSnippet {
  purpose: string;
  language: string;
  code: string;
  usage?: string;
}

export interface ContextHandoff {
  readyForAgents: AgentTask[];
  blockedDependencies: string[];
  sharedResources: SharedResource[];
}

export interface AgentTask {
  agent: string;
  task: string;
  priority: "critical" | "high" | "medium" | "low";
  requiredContext: string[];
}

export interface SharedResource {
  type: string;
  identifier: string;
  location: string;
  description: string;
}

export interface QualityGates {
  tests: TestStatus;
  security: SecurityStatus;
  performance: PerformanceStatus;
  documentation: DocStatus;
}

export interface TestStatus {
  unitTests: CheckStatus;
  integrationTests: CheckStatus;
  e2eTests: CheckStatus;
  coverage?: number;
}

export interface SecurityStatus {
  vulnerabilities: CheckStatus;
  manualReviewNeeded: boolean;
  findings?: string[];
}

export interface PerformanceStatus {
  impact: string;
  metrics?: Record<string, number>;
}

export interface DocStatus {
  inline: CheckStatus;
  readme: CheckStatus;
  api: CheckStatus;
}

export type CheckStatus = "passed" | "failed" | "pending" | "not_applicable";

export interface CacheReferences {
  geminiAnalysis?: string;
  context7Docs?: string;
  realWorldExamples?: string[];
  previousOutputs?: string[];
}

export interface ExecutionMetrics {
  timeInvested: number; // milliseconds
  timeEstimated: number;
  tokensUsed?: number;
  confidence: number; // 0-1
}

// Compressed Format for Token Efficiency
export interface CompressedAgentOutput {
  s: "✓" | "⚠" | "✗"; // status
  f: string[]; // files: ["/path:+45-12", "/path:new"]
  n: string[]; // next: ["agent:task", ...]
  b?: string[]; // blockers
  c?: string[]; // cache: ["type:key", ...]
  m?: {
    // metrics
    t: number; // time in seconds
    cf: number; // confidence 0-1
  };
}

// Cache Strategy Configuration
export const CACHE_STRATEGIES = {
  context7: { ttl: 3600000, scope: "session" as const }, // 1 hour
  gemini: { ttl: 600000, scope: "task" as const }, // 10 minutes
  grep_examples: { ttl: 86400000, scope: "global" as const }, // 1 day
  agent_outputs: { ttl: 0, scope: "workflow" as const }, // task duration
};

// Helper functions for context management
export function createHandoff(
  from: string,
  to: string[],
  context: Partial<HandoffContext>,
  priority: HandoffItem["priority"] = "medium"
): HandoffItem {
  return {
    fromAgent: from,
    toAgents: to,
    context: {
      dependencies: [],
      constraints: {},
      artifacts: {},
      decisions: [],
      ...context,
    },
    priority,
    timestamp: Date.now(),
  };
}

export function compressOutput(output: AgentOutput): CompressedAgentOutput {
  const statusMap = { completed: "✓", partial: "⚠", blocked: "✗" } as const;

  return {
    s: statusMap[output.taskCompletion.status],
    f: output.deliverables.filesModified.map(
      (f) =>
        `${f.path}:${f.changeType === "created" ? "new" : `+${f.linesAdded}-${f.linesRemoved}`}`
    ),
    n: output.contextHandoff.readyForAgents.map((a) => `${a.agent}:${a.task}`),
    b: output.taskCompletion.blockers,
    c: Object.entries({
      ...(output.cacheKeys.geminiAnalysis && {
        gemini: output.cacheKeys.geminiAnalysis,
      }),
      ...(output.cacheKeys.context7Docs && {
        ctx7: output.cacheKeys.context7Docs,
      }),
    }).map(([k, v]) => `${k}:${v}`),
    m: output.metrics && {
      t: Math.round(output.metrics.timeInvested / 1000),
      cf: output.metrics.confidence,
    },
  };
}

export function expandCompressedOutput(
  compressed: CompressedAgentOutput
): Partial<AgentOutput> {
  const statusMap = {
    "✓": "completed",
    "⚠": "partial",
    "✗": "blocked",
  } as const;

  return {
    taskCompletion: {
      status: statusMap[compressed.s],
      blockers: compressed.b,
    },
    deliverables: {
      filesModified: compressed.f.map((f) => {
        const [path, changes] = f.split(":");
        if (changes === "new") {
          return {
            path,
            changeType: "created",
            specificChanges: "New file",
            linesAdded: 0,
            linesRemoved: 0,
          };
        }
        const match = changes.match(/\+(\d+)-(\d+)/);
        return {
          path,
          changeType: "modified" as const,
          specificChanges: "Modified",
          linesAdded: match ? parseInt(match[1]) : 0,
          linesRemoved: match ? parseInt(match[2]) : 0,
        };
      }),
      artifactsCreated: [],
      configurationsChanged: [],
      codeSnippets: [],
    },
    contextHandoff: {
      readyForAgents: compressed.n.map((n) => {
        const [agent, task] = n.split(":");
        return {
          agent,
          task,
          priority: "medium" as const,
          requiredContext: [],
        };
      }),
      blockedDependencies: [],
      sharedResources: [],
    },
    metrics: compressed.m && {
      timeInvested: compressed.m.t * 1000,
      timeEstimated: 0,
      confidence: compressed.m.cf,
    },
  };
}
