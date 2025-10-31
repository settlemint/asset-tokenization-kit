import { createLogger } from "@settlemint/sdk-utils/logging";
import fs from "node:fs";
import path from "node:path";
import ts from "typescript";

interface Binding {
  type: "direct" | "hook";
  namespaces: string[];
  keyPrefix?: string;
}

const logger = createLogger({
  level: "info",
});
const projectRoot = path.resolve(__dirname, "../../../");
const srcDir = path.join(projectRoot, "kit/dapp/src");
const localesDir = path.join(projectRoot, "kit/dapp/locales");
const tsconfigPath = path.join(projectRoot, "kit/dapp/tsconfig.json");

const usedKeysByNamespace = new Map<string, Set<string>>();
const keepAllNamespaces = new Set();

function recordKey(namespace: string, key: string) {
  if (!namespace || keepAllNamespaces.has(namespace)) {
    return;
  }
  let set = usedKeysByNamespace.get(namespace);
  if (!set) {
    set = new Set();
    usedKeysByNamespace.set(namespace, set);
  }
  set.add(key);
}

function recordKeys(namespaces: string[], key: string) {
  for (const ns of namespaces) {
    recordKey(ns, key);
  }
}

function markKeepAll(namespaces: string[]) {
  for (const ns of namespaces) {
    if (!ns) continue;
    keepAllNamespaces.add(ns);
    logger.info(
      `Marking all keys for namespace: ${ns} as keep because a dynamic syntax was used`
    );
  }
}

function joinKey(prefix: string, key: string) {
  if (!prefix) return key;
  if (!key) return prefix;
  return `${prefix}.${key}`;
}

function isInsideDir(filePath: string, dir: string) {
  const relative = path.relative(dir, filePath);
  return relative && !relative.startsWith("..") && !path.isAbsolute(relative);
}

function isStringLiteralLike(node: ts.Node) {
  return ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node);
}

function unwrapExpression(
  expression: ts.Expression | undefined
): ts.Expression {
  if (!expression) throw new Error("Expression is undefined");
  let current = expression;
  while (true) {
    if (ts.isParenthesizedExpression(current)) {
      current = current.expression;
      continue;
    }
    if (ts.isAsExpression(current) || ts.isTypeAssertionExpression(current)) {
      current = current.expression;
      continue;
    }
    if (ts.isSatisfiesExpression(current)) {
      current = current.expression;
      continue;
    }
    if (ts.isNonNullExpression(current)) {
      current = current.expression;
      continue;
    }
    break;
  }
  return current;
}

function getPropertyName(node: ts.Node) {
  if (
    ts.isIdentifier(node) ||
    ts.isStringLiteral(node) ||
    ts.isNumericLiteral(node)
  ) {
    return node.text;
  }
  return undefined;
}

function parseKeyPrefix(callExpression: ts.CallExpression) {
  for (const arg of callExpression.arguments) {
    const unwrapped = unwrapExpression(arg);
    if (!ts.isObjectLiteralExpression(unwrapped)) continue;
    for (const property of unwrapped.properties) {
      if (!ts.isPropertyAssignment(property)) continue;
      const name = getPropertyName(property.name);
      if (name !== "keyPrefix") continue;
      const initializer = unwrapExpression(property.initializer);
      if (isStringLiteralLike(initializer)) {
        return { value: initializer.text, dynamic: false };
      }
      return { value: undefined, dynamic: true };
    }
  }
  return { value: undefined, dynamic: false };
}

function extractNamespacesFromObjectLiteral(
  objectLiteral: ts.ObjectLiteralExpression
) {
  for (const property of objectLiteral.properties) {
    if (!ts.isPropertyAssignment(property)) continue;
    const name = getPropertyName(property.name);
    if (name !== "ns") continue;
    const initializer = unwrapExpression(property.initializer);
    if (isStringLiteralLike(initializer)) {
      return { namespaces: [initializer.text], dynamic: false };
    }
    if (ts.isArrayLiteralExpression(initializer)) {
      const namespaces = [];
      for (const element of initializer.elements) {
        const value = unwrapExpression(element);
        if (isStringLiteralLike(value)) {
          namespaces.push(value.text);
        } else {
          return { namespaces: [], dynamic: true };
        }
      }
      return { namespaces, dynamic: false };
    }
    return { namespaces: [], dynamic: true };
  }
  return { namespaces: [], dynamic: false };
}

function parseNamespaces(callExpression: ts.CallExpression) {
  if (callExpression.arguments.length === 0) {
    return { namespaces: [], dynamic: false };
  }

  const [firstArg] = callExpression.arguments;
  if (!firstArg) {
    return { namespaces: [], dynamic: false };
  }
  const unwrapped = unwrapExpression(firstArg);

  if (isStringLiteralLike(unwrapped)) {
    return { namespaces: [unwrapped.text], dynamic: false };
  }

  if (ts.isArrayLiteralExpression(unwrapped)) {
    const namespaces = [];
    for (const element of unwrapped.elements) {
      const value = unwrapExpression(element);
      if (isStringLiteralLike(value)) {
        namespaces.push(value.text);
      } else {
        return { namespaces: [], dynamic: true };
      }
    }
    return { namespaces, dynamic: false };
  }

  if (ts.isObjectLiteralExpression(unwrapped)) {
    return extractNamespacesFromObjectLiteral(unwrapped);
  }

  return { namespaces: [], dynamic: true };
}

function getUseTranslationNames(sourceFile: ts.SourceFile) {
  const names = new Set<string>();
  sourceFile.forEachChild((node) => {
    if (!ts.isImportDeclaration(node)) return;
    const moduleSpecifier = node.moduleSpecifier;
    if (!ts.isStringLiteral(moduleSpecifier)) return;
    if (moduleSpecifier.text !== "react-i18next") return;
    const clause = node.importClause;
    if (
      !clause ||
      !clause.namedBindings ||
      !ts.isNamedImports(clause.namedBindings)
    ) {
      return;
    }
    for (const element of clause.namedBindings.elements) {
      if (element.propertyName) {
        if (element.propertyName.text === "useTranslation") {
          names.add(element.name.text);
        }
        continue;
      }
      if (element.name.text === "useTranslation") {
        names.add(element.name.text);
      }
    }
  });
  return names;
}

function findVariableDeclaration(
  node: ts.Node
): ts.VariableDeclaration | undefined {
  let current = node.parent;
  while (current) {
    if (ts.isVariableDeclaration(current) && current.initializer === node) {
      return current;
    }
    if (
      ts.isBinaryExpression(current) &&
      current.operatorToken.kind === ts.SyntaxKind.EqualsToken &&
      current.right === node
    ) {
      return undefined;
    }
    node = current;
    current = current.parent;
  }
  return undefined;
}

function collectBindings(
  sourceFile: ts.SourceFile,
  checker: ts.TypeChecker,
  hookNames: Set<string>
) {
  const bindings = new Map<ts.Symbol, Binding>();

  function visit(node: ts.Node) {
    if (ts.isCallExpression(node)) {
      const expression = unwrapExpression(node.expression);
      if (ts.isIdentifier(expression) && hookNames.has(expression.text)) {
        const namespacesInfo = parseNamespaces(node);
        const keyPrefixInfo = parseKeyPrefix(node);
        const namespaces = namespacesInfo.namespaces;
        if (!namespaces.length) {
          ts.forEachChild(node, visit);
          return;
        }
        if (namespacesInfo.dynamic) {
          markKeepAll(namespaces);
        }
        if (keyPrefixInfo.dynamic) {
          markKeepAll(namespaces);
        }
        const keyPrefix = keyPrefixInfo.dynamic
          ? undefined
          : keyPrefixInfo.value;
        const declaration = findVariableDeclaration(node);
        if (!declaration) {
          ts.forEachChild(node, visit);
          return;
        }
        const nameNode = declaration.name;
        if (ts.isObjectBindingPattern(nameNode)) {
          for (const element of nameNode.elements) {
            const property = element.propertyName
              ? (element.propertyName as ts.Identifier).text
              : (element.name as ts.Identifier).text;
            if (property !== "t") continue;
            const identifier = element.name;
            if (!ts.isIdentifier(identifier)) continue;
            const symbol = checker.getSymbolAtLocation(identifier);
            if (!symbol) continue;
            bindings.set(symbol, {
              type: "direct",
              namespaces,
              keyPrefix,
            });
          }
        } else if (ts.isIdentifier(nameNode)) {
          const symbol = checker.getSymbolAtLocation(nameNode);
          if (symbol) {
            bindings.set(symbol, {
              type: "hook",
              namespaces,
              keyPrefix,
            });
          }
        }
      }
    }
    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return bindings;
}

function handleTranslationCall(
  binding: Binding,
  callExpression: ts.CallExpression
) {
  if (!binding.namespaces.length) {
    return;
  }
  const args = callExpression.arguments;
  if (!args.length) {
    markKeepAll(binding.namespaces);
    return;
  }
  const firstArg = unwrapExpression(args[0]);
  if (isStringLiteralLike(firstArg)) {
    const key = firstArg.text;
    const fullKey = joinKey(binding.keyPrefix ?? "", key);
    recordKeys(binding.namespaces, fullKey);
    return;
  }
  if (ts.isTemplateExpression(firstArg)) {
    markKeepAll(binding.namespaces);
    return;
  }
  if (ts.isBinaryExpression(firstArg) || ts.isConditionalExpression(firstArg)) {
    markKeepAll(binding.namespaces);
    return;
  }
  if (ts.isArrayLiteralExpression(firstArg)) {
    for (const element of firstArg.elements) {
      const value = unwrapExpression(element);
      if (isStringLiteralLike(value)) {
        const fullKey = joinKey(binding.keyPrefix ?? "", value.text);
        recordKeys(binding.namespaces, fullKey);
      } else {
        markKeepAll(binding.namespaces);
        return;
      }
    }
    return;
  }
  markKeepAll(binding.namespaces);
}

function collectKeysFromSourceFile(
  sourceFile: ts.SourceFile,
  checker: ts.TypeChecker
) {
  const hookNames = getUseTranslationNames(sourceFile);
  if (!hookNames.size) {
    return;
  }
  const bindings = collectBindings(sourceFile, checker, hookNames);
  if (!bindings.size) {
    return;
  }
  function visit(node: ts.Node) {
    if (ts.isCallExpression(node)) {
      const expression = unwrapExpression(node.expression);
      if (ts.isIdentifier(expression)) {
        const symbol = checker.getSymbolAtLocation(expression);
        const binding = symbol && bindings.get(symbol);
        if (binding && binding.type === "direct") {
          handleTranslationCall(binding, node);
        }
      } else if (
        ts.isPropertyAccessExpression(expression) ||
        (typeof ts.isPropertyAccessChain === "function" &&
          ts.isPropertyAccessChain(expression))
      ) {
        const name = expression.name?.text;
        if (name !== "t") {
          ts.forEachChild(node, visit);
          return;
        }
        const innerExpression = unwrapExpression(expression.expression);
        if (ts.isIdentifier(innerExpression)) {
          const symbol = checker.getSymbolAtLocation(innerExpression);
          const binding = symbol && bindings.get(symbol);
          if (binding && binding.type === "hook") {
            handleTranslationCall(binding, node);
          }
        }
      } else if (ts.isElementAccessExpression(expression)) {
        const argumentExpression = expression.argumentExpression;
        if (
          argumentExpression &&
          isStringLiteralLike(argumentExpression) &&
          argumentExpression.text === "t"
        ) {
          const innerExpression = unwrapExpression(expression.expression);
          if (ts.isIdentifier(innerExpression)) {
            const symbol = checker.getSymbolAtLocation(innerExpression);
            const binding = symbol && bindings.get(symbol);
            if (binding && binding.type === "hook") {
              handleTranslationCall(binding, node);
            }
          }
        }
      }
    }
    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
}

function loadProgram() {
  const configFile = ts.readConfigFile(tsconfigPath, ts.sys.readFile);
  if (configFile.error) {
    throw new Error(
      ts.formatDiagnosticsWithColorAndContext([configFile.error], {
        getCanonicalFileName: (fileName) => fileName,
        getCurrentDirectory: () => process.cwd(),
        getNewLine: () => "\n",
      })
    );
  }
  const parsed = ts.parseJsonConfigFileContent(
    configFile.config,
    ts.sys,
    path.dirname(tsconfigPath),
    undefined,
    tsconfigPath
  );
  const compilerOptions = {
    ...parsed.options,
    noEmit: true,
  };
  const host = ts.createCompilerHost(compilerOptions, true);
  const program = ts.createProgram(parsed.fileNames, compilerOptions, host);
  const sourceFiles = program
    .getSourceFiles()
    .filter(
      (file) =>
        !file.isDeclarationFile &&
        isInsideDir(path.resolve(file.fileName), srcDir)
    );
  return { program, sourceFiles };
}

function pruneObject(
  obj: Record<string, string | object>,
  namespace: string,
  prefix = ""
): Record<string, string | object> {
  if (keepAllNamespaces.has(namespace)) {
    return obj;
  }
  const usedKeys = usedKeysByNamespace.get(namespace) || new Set();
  if (typeof obj !== "object" || obj === null) {
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj;
  }
  const result: Record<string, string | object> = {};
  for (const key of Object.keys(obj)) {
    const value = obj[key];
    const currentPath = prefix ? `${prefix}.${key}` : key;
    let keep = false;
    if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      const child = pruneObject(
        value as Record<string, string | object>,
        namespace,
        currentPath
      );
      const hasChildren = child && Object.keys(child).length > 0;
      if (hasChildren) {
        result[key] = child;
        keep = true;
      } else if (usedKeys.has(currentPath)) {
        result[key] = value;
        keep = true;
      }
    } else if (usedKeys.has(currentPath)) {
      result[key] = value as string | object;
      keep = true;
    }
    if (!keep && usedKeys.has(currentPath)) {
      result[key] = value as string | object;
    }
  }
  return result;
}

function writeJson(filePath: string, obj: Record<string, string | object>) {
  const json = JSON.stringify(obj, null, 2);
  fs.writeFileSync(filePath, `${json}\n`, "utf8");
}

const { program, sourceFiles } = loadProgram();
const checker = program.getTypeChecker();
for (const sourceFile of sourceFiles) {
  collectKeysFromSourceFile(sourceFile, checker);
}

logger.info(
  `Detected used keys by namespace: ${JSON.stringify(
    Array.from(usedKeysByNamespace.entries()).map(([namespace, keys]) => ({
      namespace,
      keys: keys.size,
    })),
    undefined,
    2
  )}`
);

function processLocaleDir(localeDir: string) {
  const entries = fs.readdirSync(localeDir, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.endsWith(".json")) continue;
    const namespace = entry.name.replace(/\.json$/, "");
    const filePath = path.join(localeDir, entry.name);
    const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
    const pruned = pruneObject(data, namespace);
    writeJson(filePath, pruned);
  }
}

const localeEntries = fs.readdirSync(localesDir, { withFileTypes: true });
for (const entry of localeEntries) {
  if (entry.isDirectory()) {
    processLocaleDir(path.join(localesDir, entry.name));
  }
}
