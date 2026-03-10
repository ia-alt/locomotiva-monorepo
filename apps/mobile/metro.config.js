const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
// Caminho para a raiz do monorepo
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// Fazer o Metro monitorar a pasta raiz também
config.watchFolders = [workspaceRoot];

// Forçar o Metro a procurar dependências também no node_modules da raiz
config.resolver.nodeModulesPaths = [
    path.resolve(projectRoot, 'node_modules'),
    path.resolve(workspaceRoot, 'node_modules'),
];
// Ativa a resolução correta de exports não-relativos caso a API use
config.resolver.disableHierarchicalLookup = false;

module.exports = config;
