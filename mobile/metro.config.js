const path = require("path");
const fs = require("fs");
const { getDefaultConfig } = require("expo/metro-config");

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "..");

const config = getDefaultConfig(projectRoot);

config.watchFolders = [workspaceRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(workspaceRoot, "node_modules"),
];

function resolveModule(name) {
  const local = path.resolve(projectRoot, "node_modules", name);
  if (fs.existsSync(local)) return local;
  return path.resolve(workspaceRoot, "node_modules", name);
}

const reactNativeRoot = resolveModule("react-native");

// Only pin React singletons — remapping react-native breaks deep imports
// like `react-native/Libraries/Core/InitializeCore`.
config.resolver.extraNodeModules = {
  react: resolveModule("react"),
  "react-dom": resolveModule("react-dom"),
};

config.resolver.disableHierarchicalLookup = true;

const upstreamResolveRequest = config.resolver.resolveRequest;

config.resolver.resolveRequest = (context, moduleName, platform) => {
  // Deep react-native imports (needed by @expo/metro-runtime)
  if (moduleName.startsWith("react-native/")) {
    const subpath = moduleName.slice("react-native/".length);
    const candidates = [
      path.join(reactNativeRoot, `${subpath}.js`),
      path.join(reactNativeRoot, subpath),
      path.join(reactNativeRoot, subpath, "index.js"),
    ];
    for (const filePath of candidates) {
      try {
        if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
          return { type: "sourceFile", filePath };
        }
      } catch {
        // continue
      }
    }
  }

  if (upstreamResolveRequest) {
    return upstreamResolveRequest(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
