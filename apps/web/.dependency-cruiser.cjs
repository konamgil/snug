/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    // ===========================================
    // FSD (Feature Sliced Design) Layer Rules
    // ===========================================
    // Layer hierarchy: app > pages > widgets > features > entities > shared
    // Lower layers cannot import from higher layers

    // shared: Can only import external packages
    {
      name: 'fsd-shared-isolation',
      comment: 'Shared layer cannot import from any other layer.',
      severity: 'error',
      from: { path: '^src/shared/' },
      to: {
        path: [
          '^src/entities/',
          '^src/features/',
          '^src/widgets/',
          '^src/pages/',
          '^src/app/',
        ],
      },
    },

    // entities: Can only import from shared
    {
      name: 'fsd-entities-layer',
      comment: 'Entities can only import from shared layer.',
      severity: 'error',
      from: { path: '^src/entities/' },
      to: {
        path: [
          '^src/features/',
          '^src/widgets/',
          '^src/pages/',
          '^src/app/',
        ],
      },
    },

    // features: Can only import from entities and shared
    {
      name: 'fsd-features-layer',
      comment: 'Features can only import from entities and shared layers.',
      severity: 'error',
      from: { path: '^src/features/' },
      to: {
        path: ['^src/widgets/', '^src/pages/', '^src/app/'],
      },
    },

    // widgets: Can only import from features, entities, and shared
    {
      name: 'fsd-widgets-layer',
      comment: 'Widgets can only import from features, entities, and shared layers.',
      severity: 'error',
      from: { path: '^src/widgets/' },
      to: {
        path: ['^src/pages/', '^src/app/'],
      },
    },

    // pages: Can only import from widgets, features, entities, and shared
    {
      name: 'fsd-pages-layer',
      comment: 'Pages can only import from widgets, features, entities, and shared layers.',
      severity: 'error',
      from: { path: '^src/pages/' },
      to: {
        path: ['^src/app/'],
      },
    },

    // ===========================================
    // FSD Slice Isolation Rules
    // ===========================================

    // Slices within the same layer should not import from each other
    // (Cross-slice imports should go through public API)
    {
      name: 'fsd-no-cross-slice-entities',
      comment: 'Entity slices should not import from other entity slices directly.',
      severity: 'warn',
      from: { path: '^src/entities/([^/]+)/' },
      to: {
        path: '^src/entities/([^/]+)/',
        pathNot: '^src/entities/$1/',
      },
    },

    {
      name: 'fsd-no-cross-slice-features',
      comment: 'Feature slices should not import from other feature slices directly.',
      severity: 'warn',
      from: { path: '^src/features/([^/]+)/' },
      to: {
        path: '^src/features/([^/]+)/',
        pathNot: '^src/features/$1/',
      },
    },

    // ===========================================
    // Segment Rules (ui, model, api, lib)
    // ===========================================

    // UI segment should not import from model directly in other slices
    {
      name: 'fsd-ui-isolation',
      comment: 'UI components should not directly access other slices model layer.',
      severity: 'warn',
      from: { path: '/ui/' },
      to: {
        path: '/model/',
        pathNot: ['node_modules'],
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
    // Import from index.ts only (Public API)
    // ===========================================
    {
      name: 'fsd-public-api',
      comment: 'Import from slice root (index.ts), not internal files.',
      severity: 'warn',
      from: { pathNot: '^src/(shared|entities|features|widgets|pages)/[^/]+/' },
      to: {
        path: '^src/(entities|features|widgets|pages)/[^/]+/.+',
        pathNot: [
          '^src/(entities|features|widgets|pages)/[^/]+/index\\.ts$',
          'node_modules',
        ],
      },
    },
  ],

  options: {
    doNotFollow: {
      path: ['node_modules', '.next', 'out', 'dist'],
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
