/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    // ===========================================
    // NestJS Layer Architecture Rules
    // ===========================================

    // Controllers can ONLY import from:
    // - Services (same module)
    // - DTOs (same module)
    // - Common (guards, decorators, etc.)
    // - NestJS core
    {
      name: 'no-controller-to-repository',
      comment: 'Controllers should not directly access Repositories. Use Services instead.',
      severity: 'error',
      from: { path: '\\.controller\\.ts$' },
      to: { path: '\\.repository\\.ts$' },
    },
    {
      name: 'no-controller-to-prisma',
      comment: 'Controllers should not directly access Prisma. Use Services instead.',
      severity: 'error',
      from: { path: '\\.controller\\.ts$' },
      to: { path: 'prisma' },
    },

    // Services can ONLY import from:
    // - Repositories (same module)
    // - DTOs (same module)
    // - Other Services (via module imports)
    // - Common utilities
    {
      name: 'no-service-to-prisma',
      comment: 'Services should not directly access Prisma. Use Repositories instead.',
      severity: 'error',
      from: { path: 'modules/.*\\.service\\.ts$' },
      to: { path: 'prisma/prisma\\.service\\.ts$' },
    },
    {
      name: 'no-service-to-controller',
      comment: 'Services should not import from Controllers.',
      severity: 'error',
      from: { path: '\\.service\\.ts$' },
      to: { path: '\\.controller\\.ts$' },
    },

    // Repositories can ONLY import from:
    // - Prisma
    // - Common utilities
    // - DTOs (for types)
    {
      name: 'no-repository-to-controller',
      comment: 'Repositories should not import from Controllers.',
      severity: 'error',
      from: { path: '\\.repository\\.ts$' },
      to: { path: '\\.controller\\.ts$' },
    },
    {
      name: 'no-repository-to-service',
      comment: 'Repositories should not import from Services (except PrismaService).',
      severity: 'error',
      from: { path: '\\.repository\\.ts$' },
      to: {
        path: '\\.service\\.ts$',
        pathNot: ['prisma\\.service\\.ts$'],
      },
    },

    // ===========================================
    // Module Isolation Rules
    // ===========================================

    // Modules should not import internals from other modules
    // (except through their public exports)
    {
      name: 'no-cross-module-internals',
      comment: 'Modules should not import internals (repository, service) from other modules directly.',
      severity: 'warn',
      from: { path: '^src/modules/([^/]+)/' },
      to: {
        path: '^src/modules/([^/]+)/',
        pathNot: [
          '^src/modules/$1/', // Same module is OK
          '\\.module\\.ts$', // Module exports are OK
          '/guards/', // Guards are designed to be shared
          '/decorators/', // Decorators are designed to be shared
          '/dto/', // DTOs can be shared for inter-module communication
        ],
      },
    },

    // ===========================================
    // Circular Dependency Prevention
    // ===========================================
    {
      name: 'no-circular',
      comment: 'Circular dependencies are not allowed.',
      severity: 'error',
      from: {},
      to: { circular: true },
    },

    // ===========================================
    // Common Module Rules
    // ===========================================

    // Common should not import from feature modules
    {
      name: 'no-common-to-modules',
      comment: 'Common utilities should not depend on feature modules.',
      severity: 'error',
      from: { path: '^src/common/' },
      to: { path: '^src/modules/' },
    },

    // ===========================================
    // Gateway Rules (Socket.io)
    // ===========================================
    {
      name: 'no-gateway-to-controller',
      comment: 'Gateways should not import from Controllers.',
      severity: 'error',
      from: { path: '\\.gateway\\.ts$' },
      to: { path: '\\.controller\\.ts$' },
    },
  ],

  options: {
    doNotFollow: {
      path: ['node_modules', 'dist'],
    },
    tsPreCompilationDeps: true,
    tsConfig: {
      fileName: './tsconfig.json',
    },
    enhancedResolveOptions: {
      exportsFields: ['exports'],
      conditionNames: ['import', 'require', 'node', 'default'],
    },
    reporterOptions: {
      dot: {
        collapsePattern: 'node_modules/(@[^/]+/[^/]+|[^/]+)',
      },
    },
  },
};
