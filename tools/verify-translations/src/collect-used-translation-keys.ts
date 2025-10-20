import { readFileSync } from "node:fs";
import { join } from "node:path";
import { CallExpression, Node, Project, Symbol as TsSymbol } from "ts-morph";

interface TranslationBinding {
  namespaces: string[];
  keyPrefix?: string;
}

interface UsedTranslationKeys {
  keysByNamespace: Map<string, Set<string>>;
  allKeys: Set<string>;
  array: string[];
  namespacesWithDynamicUsage: Set<string>;
}

function getStringLiteralValue(node: Node): string | undefined {
  if (
    Node.isStringLiteral(node) ||
    Node.isNoSubstitutionTemplateLiteral(node)
  ) {
    return node.getLiteralText();
  }
  return undefined;
}

function getDefaultNamespace(): string {
  const i18nConfigPath = join(
    __dirname,
    "../../../kit/dapp/src/lib/i18n/index.ts"
  );

  try {
    const contents = readFileSync(i18nConfigPath, "utf-8");
    const match = contents.match(
      /export\s+const\s+defaultNS\s*=\s*(["'`])([^"'`]+)\1/
    );
    if (match && match[2]) {
      return match[2];
    }
  } catch (error) {
    // Ignore file read issues and fall back to the known default.
  }

  return "general";
}

function parseNamespaces(
  callExpression: CallExpression,
  defaultNamespace: string
): string[] {
  const args = callExpression.getArguments();
  if (args.length === 0) {
    return [defaultNamespace];
  }

  const firstArg = args[0];
  if (
    Node.isStringLiteral(firstArg) ||
    Node.isNoSubstitutionTemplateLiteral(firstArg)
  ) {
    return [firstArg.getLiteralText()];
  }

  if (Node.isArrayLiteralExpression(firstArg)) {
    const namespaces: string[] = [];
    for (const element of firstArg.getElements()) {
      const value = getStringLiteralValue(element);
      if (value) {
        namespaces.push(value);
      }
    }
    if (namespaces.length > 0) {
      return namespaces;
    }
  }

  return [defaultNamespace];
}

function parseKeyPrefix(callExpression: CallExpression): string | undefined {
  const args = callExpression.getArguments();
  if (args.length < 2) {
    return undefined;
  }

  const secondArg = args[1];
  if (!Node.isObjectLiteralExpression(secondArg)) {
    return undefined;
  }

  const property = secondArg.getProperty("keyPrefix");
  if (!property) {
    return undefined;
  }

  if (Node.isPropertyAssignment(property)) {
    const initializer = property.getInitializer();
    if (initializer) {
      const value = getStringLiteralValue(initializer);
      if (value) {
        return value;
      }
    }
  }

  return undefined;
}

export function collectUsedTranslationKeys(): UsedTranslationKeys {
  const project = new Project({
    tsConfigFilePath: join(__dirname, "../../../kit/dapp/tsconfig.json"),
    skipAddingFilesFromTsConfig: false,
  });

  const defaultNamespace = getDefaultNamespace();
  const keysByNamespace = new Map<string, Set<string>>();
  const allKeys = new Set<string>();
  const namespacesWithDynamicUsage = new Set<string>();

  const addKey = (namespace: string, key: string) => {
    if (!namespace || !key) {
      return;
    }
    const formattedKey = `${namespace}:${key}`;
    allKeys.add(formattedKey);
    if (!keysByNamespace.has(namespace)) {
      keysByNamespace.set(namespace, new Set());
    }
    keysByNamespace.get(namespace)!.add(key);
  };

  const markDynamicUsage = (binding: TranslationBinding) => {
    for (const namespace of binding.namespaces) {
      if (namespace) {
        namespacesWithDynamicUsage.add(namespace);
      }
    }
  };

  const useTranslationBindings = new Map<CallExpression, TranslationBinding>();
  const functionBindings = new Map<TsSymbol, TranslationBinding>();
  const objectBindings = new Map<TsSymbol, TranslationBinding>();

  for (const sourceFile of project.getSourceFiles()) {
    const importDeclarations = sourceFile
      .getImportDeclarations()
      .filter(
        (declaration) =>
          declaration.getModuleSpecifierValue() === "react-i18next"
      );

    if (importDeclarations.length === 0) {
      continue;
    }

    const useTranslationAliases = new Set<string>();
    for (const declaration of importDeclarations) {
      for (const namedImport of declaration.getNamedImports()) {
        if (namedImport.getName() === "useTranslation") {
          const alias =
            namedImport.getAliasNode()?.getText() ?? namedImport.getName();
          useTranslationAliases.add(alias);
        }
      }
    }

    if (useTranslationAliases.size === 0) {
      continue;
    }

    const ensureBinding = (
      callExpression: CallExpression
    ): TranslationBinding => {
      let binding = useTranslationBindings.get(callExpression);
      if (!binding) {
        binding = {
          namespaces: parseNamespaces(callExpression, defaultNamespace),
          keyPrefix: parseKeyPrefix(callExpression),
        };
        useTranslationBindings.set(callExpression, binding);
      }
      return binding;
    };

    // First pass: gather bindings from direct useTranslation calls
    sourceFile.forEachDescendant((node) => {
      if (!Node.isCallExpression(node)) {
        return;
      }

      const expression = node.getExpression();
      if (!Node.isIdentifier(expression)) {
        return;
      }

      if (!useTranslationAliases.has(expression.getText())) {
        return;
      }

      const binding = ensureBinding(node);
      const parent = node.getParent();

      if (Node.isVariableDeclaration(parent)) {
        const nameNode = parent.getNameNode();
        if (Node.isObjectBindingPattern(nameNode)) {
          for (const element of nameNode.getElements()) {
            const propertyNameNode = element.getPropertyNameNode();
            const isTProperty =
              propertyNameNode?.getText() === "t" ||
              (!propertyNameNode && element.getName() === "t");

            if (!isTProperty) {
              continue;
            }

            const nameIdentifier = element.getNameNode();
            if (Node.isIdentifier(nameIdentifier)) {
              const symbol = nameIdentifier.getSymbol();
              if (symbol) {
                functionBindings.set(symbol, binding);
              }
            }
          }
        } else if (Node.isIdentifier(nameNode)) {
          const symbol = nameNode.getSymbol();
          if (symbol) {
            objectBindings.set(symbol, binding);
          }
        }
      }
    });

    // Second pass: destructuring from previously stored translation objects
    sourceFile.forEachDescendant((node) => {
      if (!Node.isVariableDeclaration(node)) {
        return;
      }

      const initializer = node.getInitializer();
      if (!initializer || !Node.isIdentifier(initializer)) {
        return;
      }

      const initializerSymbol = initializer.getSymbol();
      if (!initializerSymbol) {
        return;
      }

      const binding = objectBindings.get(initializerSymbol);
      if (!binding) {
        return;
      }

      const nameNode = node.getNameNode();
      if (!Node.isObjectBindingPattern(nameNode)) {
        return;
      }

      for (const element of nameNode.getElements()) {
        const propertyNameNode = element.getPropertyNameNode();
        const isTProperty =
          propertyNameNode?.getText() === "t" ||
          (!propertyNameNode && element.getName() === "t");

        if (!isTProperty) {
          continue;
        }

        const nameIdentifier = element.getNameNode();
        if (Node.isIdentifier(nameIdentifier)) {
          const symbol = nameIdentifier.getSymbol();
          if (symbol) {
            functionBindings.set(symbol, binding);
          }
        }
      }
    });

    const recordUsedKey = (binding: TranslationBinding, rawKey: string) => {
      let namespace: string | undefined;
      let key = rawKey;
      const colonIndex = rawKey.indexOf(":");

      if (colonIndex >= 0) {
        namespace = rawKey.slice(0, colonIndex);
        key = rawKey.slice(colonIndex + 1);
      }

      if (!namespace) {
        const prefixedKey = binding.keyPrefix
          ? `${binding.keyPrefix}.${key}`
          : key;
        for (const ns of binding.namespaces) {
          addKey(ns, prefixedKey);
        }
        return;
      }

      addKey(namespace, key);
    };

    sourceFile.forEachDescendant((node) => {
      if (!Node.isCallExpression(node)) {
        return;
      }

      const expression = node.getExpression();

      if (Node.isIdentifier(expression)) {
        const symbol = expression.getSymbol();
        if (!symbol) {
          return;
        }
        const binding = functionBindings.get(symbol);
        if (!binding) {
          return;
        }
        const firstArg = node.getArguments()[0];
        if (!firstArg) {
          markDynamicUsage(binding);
          return;
        }
        const key = getStringLiteralValue(firstArg);
        if (key) {
          recordUsedKey(binding, key);
        } else {
          markDynamicUsage(binding);
        }
        return;
      }

      if (Node.isPropertyAccessExpression(expression)) {
        if (expression.getName() !== "t") {
          return;
        }

        const innerExpression = expression.getExpression();
        if (Node.isIdentifier(innerExpression)) {
          const symbol = innerExpression.getSymbol();
          if (!symbol) {
            return;
          }
          const binding = objectBindings.get(symbol);
          if (!binding) {
            return;
          }
          const firstArg = node.getArguments()[0];
          if (!firstArg) {
            markDynamicUsage(binding);
            return;
          }
          const key = getStringLiteralValue(firstArg);
          if (key) {
            recordUsedKey(binding, key);
          } else {
            markDynamicUsage(binding);
          }
          return;
        }

        if (Node.isCallExpression(innerExpression)) {
          const innerCallExpr = innerExpression;
          const innerCallee = innerCallExpr.getExpression();
          if (Node.isIdentifier(innerCallee)) {
            if (!useTranslationAliases.has(innerCallee.getText())) {
              return;
            }
            const binding = ensureBinding(innerCallExpr);
            const firstArg = node.getArguments()[0];
            if (!firstArg) {
              markDynamicUsage(binding);
              return;
            }
            const key = getStringLiteralValue(firstArg);
            if (key) {
              recordUsedKey(binding, key);
            } else {
              markDynamicUsage(binding);
            }
          }
        }
      }
    });
  }

  return {
    keysByNamespace,
    allKeys,
    array: Array.from(allKeys).sort(),
    namespacesWithDynamicUsage,
  };
}
