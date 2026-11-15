// Lets src/app/tabs.ts import the repo-root features.json (outside this folder).
const path = require("path");
const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);
config.watchFolders = [...(config.watchFolders ?? []), path.resolve(__dirname, "..")];
module.exports = config;
