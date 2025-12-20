// Stub fork-ts-checker-webpack-plugin to avoid dependency conflicts
const fs = require('fs');
const path = require('path');

const pluginDir = path.join(__dirname, '..', 'node_modules', 'fork-ts-checker-webpack-plugin');

// Remove existing plugin
if (fs.existsSync(pluginDir)) {
  fs.rmSync(pluginDir, { recursive: true, force: true });
}

// Create stub
fs.mkdirSync(pluginDir, { recursive: true });
fs.writeFileSync(
  path.join(pluginDir, 'index.js'),
  'module.exports = class ForkTsCheckerWebpackPlugin { constructor() {} apply() {} };'
);
fs.writeFileSync(
  path.join(pluginDir, 'package.json'),
  JSON.stringify({ name: 'fork-ts-checker-webpack-plugin', version: '6.5.3', main: 'index.js' })
);

console.log('Stubbed fork-ts-checker-webpack-plugin');
