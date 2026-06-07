// Learn more: https://docs.expo.dev/guides/monorepos/
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const path = require("path");

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "..");

const config = getDefaultConfig(projectRoot);

// 1. Monorepo'nun tamamini izle (shared/* paketleri burada yasiyor).
config.watchFolders = [workspaceRoot];

// 2. Once app'in, sonra root'un node_modules'una bak.
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(workspaceRoot, "node_modules"),
];

// 3. pnpm hoisted kurulumda yukari dogru "kacan" cozumlemeleri engelle.
config.resolver.disableHierarchicalLookup = true;

module.exports = withNativeWind(config, { input: "./src/global.css" });
