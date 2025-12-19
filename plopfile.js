/**
 * Plop.js Configuration
 * Generators for consistent code scaffolding
 *
 * Available generators:
 * - nestjs-module: Full NestJS module with Repository Pattern
 * - fsd-slice: FSD slice with standard structure
 */

export default function (plop) {
  // Helper for converting to PascalCase
  plop.setHelper('pascalCase', (text) => {
    return text
      .split(/[-_\s]+/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join('');
  });

  // Helper for converting to camelCase
  plop.setHelper('camelCase', (text) => {
    const pascal = text
      .split(/[-_\s]+/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join('');
    return pascal.charAt(0).toLowerCase() + pascal.slice(1);
  });

  // Helper for converting to kebab-case
  plop.setHelper('kebabCase', (text) => {
    return text
      .replace(/([a-z])([A-Z])/g, '$1-$2')
      .replace(/[\s_]+/g, '-')
      .toLowerCase();
  });

  // ============================================
  // NestJS Module Generator
  // ============================================
  plop.setGenerator('nestjs-module', {
    description: 'Generate a NestJS module with Repository Pattern',
    prompts: [
      {
        type: 'input',
        name: 'name',
        message: 'Module name (e.g., products, orders):',
        validate: (value) => {
          if (!value) return 'Module name is required';
          if (!/^[a-z][a-z0-9-]*$/.test(value)) {
            return 'Module name must be lowercase and can contain hyphens';
          }
          return true;
        },
      },
      {
        type: 'confirm',
        name: 'withController',
        message: 'Include controller?',
        default: true,
      },
      {
        type: 'confirm',
        name: 'withDto',
        message: 'Include DTOs?',
        default: true,
      },
    ],
    actions: (data) => {
      const actions = [];
      const basePath = 'apps/api/src/modules/{{kebabCase name}}';

      // Always create module, service, repository
      actions.push({
        type: 'add',
        path: `${basePath}/{{kebabCase name}}.module.ts`,
        templateFile: 'plop-templates/nestjs/module.hbs',
      });

      actions.push({
        type: 'add',
        path: `${basePath}/{{kebabCase name}}.service.ts`,
        templateFile: 'plop-templates/nestjs/service.hbs',
      });

      actions.push({
        type: 'add',
        path: `${basePath}/{{kebabCase name}}.repository.ts`,
        templateFile: 'plop-templates/nestjs/repository.hbs',
      });

      // Optional controller
      if (data.withController) {
        actions.push({
          type: 'add',
          path: `${basePath}/{{kebabCase name}}.controller.ts`,
          templateFile: 'plop-templates/nestjs/controller.hbs',
        });
      }

      // Optional DTOs
      if (data.withDto) {
        actions.push({
          type: 'add',
          path: `${basePath}/dto/create-{{kebabCase name}}.dto.ts`,
          templateFile: 'plop-templates/nestjs/dto-create.hbs',
        });

        actions.push({
          type: 'add',
          path: `${basePath}/dto/update-{{kebabCase name}}.dto.ts`,
          templateFile: 'plop-templates/nestjs/dto-update.hbs',
        });

        actions.push({
          type: 'add',
          path: `${basePath}/dto/index.ts`,
          templateFile: 'plop-templates/nestjs/dto-index.hbs',
        });
      }

      // Add instruction message
      actions.push({
        type: 'add',
        path: `${basePath}/.generated`,
        template: `Generated at: ${new Date().toISOString()}\n\nRemember to:\n1. Add this module to AppModule imports\n2. Add Prisma model if needed\n3. Update the repository with actual Prisma operations`,
      });

      return actions;
    },
  });

  // ============================================
  // FSD Slice Generator
  // ============================================
  plop.setGenerator('fsd-slice', {
    description: 'Generate an FSD slice (entities, features, widgets)',
    prompts: [
      {
        type: 'list',
        name: 'layer',
        message: 'Select FSD layer:',
        choices: ['entities', 'features', 'widgets'],
      },
      {
        type: 'input',
        name: 'name',
        message: 'Slice name (e.g., user, room-card, auth-form):',
        validate: (value) => {
          if (!value) return 'Slice name is required';
          if (!/^[a-z][a-z0-9-]*$/.test(value)) {
            return 'Slice name must be lowercase and can contain hyphens';
          }
          return true;
        },
      },
      {
        type: 'confirm',
        name: 'withModel',
        message: 'Include model (store/hooks)?',
        default: true,
      },
      {
        type: 'confirm',
        name: 'withApi',
        message: 'Include API layer?',
        default: (answers) => answers.layer !== 'widgets',
      },
    ],
    actions: (data) => {
      const actions = [];
      const basePath = `apps/web/src/{{layer}}/{{kebabCase name}}`;

      // Always create UI component and index
      actions.push({
        type: 'add',
        path: `${basePath}/ui/{{kebabCase name}}.tsx`,
        templateFile: 'plop-templates/fsd/ui-component.hbs',
      });

      actions.push({
        type: 'add',
        path: `${basePath}/ui/index.ts`,
        templateFile: 'plop-templates/fsd/ui-index.hbs',
      });

      actions.push({
        type: 'add',
        path: `${basePath}/index.ts`,
        templateFile: 'plop-templates/fsd/slice-index.hbs',
      });

      // Optional model (store/hooks)
      if (data.withModel) {
        actions.push({
          type: 'add',
          path: `${basePath}/model/use-{{kebabCase name}}.ts`,
          templateFile: 'plop-templates/fsd/model-hook.hbs',
        });

        actions.push({
          type: 'add',
          path: `${basePath}/model/index.ts`,
          templateFile: 'plop-templates/fsd/model-index.hbs',
        });
      }

      // Optional API layer
      if (data.withApi) {
        actions.push({
          type: 'add',
          path: `${basePath}/api/{{kebabCase name}}.api.ts`,
          templateFile: 'plop-templates/fsd/api.hbs',
        });

        actions.push({
          type: 'add',
          path: `${basePath}/api/index.ts`,
          templateFile: 'plop-templates/fsd/api-index.hbs',
        });
      }

      return actions;
    },
  });

  // ============================================
  // FSD Page Generator
  // ============================================
  plop.setGenerator('fsd-page', {
    description: 'Generate an FSD page with routing setup',
    prompts: [
      {
        type: 'input',
        name: 'name',
        message: 'Page name (e.g., profile, room-detail):',
        validate: (value) => {
          if (!value) return 'Page name is required';
          if (!/^[a-z][a-z0-9-]*$/.test(value)) {
            return 'Page name must be lowercase and can contain hyphens';
          }
          return true;
        },
      },
      {
        type: 'input',
        name: 'route',
        message: 'Route path (e.g., /profile, /rooms/[id]):',
        default: (answers) => `/${answers.name}`,
      },
    ],
    actions: [
      // Page component in FSD views layer (renamed from pages to avoid Next.js conflict)
      {
        type: 'add',
        path: 'apps/web/src/views/{{kebabCase name}}/ui/{{kebabCase name}}-page.tsx',
        templateFile: 'plop-templates/fsd/page-component.hbs',
      },
      {
        type: 'add',
        path: 'apps/web/src/views/{{kebabCase name}}/ui/index.ts',
        templateFile: 'plop-templates/fsd/page-ui-index.hbs',
      },
      {
        type: 'add',
        path: 'apps/web/src/views/{{kebabCase name}}/index.ts',
        templateFile: 'plop-templates/fsd/page-index.hbs',
      },
      // Note about Next.js App Router
      {
        type: 'add',
        path: 'apps/web/src/views/{{kebabCase name}}/.generated',
        template: `Generated at: ${new Date().toISOString()}\n\nRemember to:\n1. Create route in app/ directory: app{{route}}/page.tsx\n2. Import and use {{pascalCase name}}Page from @/views/{{kebabCase name}}\n3. Add metadata for SEO`,
      },
    ],
  });

  // ============================================
  // Shared UI Component Generator
  // ============================================
  plop.setGenerator('shared-ui', {
    description: 'Generate a shared UI component in @snug/ui',
    prompts: [
      {
        type: 'input',
        name: 'name',
        message: 'Component name (e.g., button, input, card):',
        validate: (value) => {
          if (!value) return 'Component name is required';
          if (!/^[a-z][a-z0-9-]*$/.test(value)) {
            return 'Component name must be lowercase and can contain hyphens';
          }
          return true;
        },
      },
      {
        type: 'confirm',
        name: 'withVariants',
        message: 'Include CVA variants?',
        default: true,
      },
    ],
    actions: (data) => {
      const actions = [];

      actions.push({
        type: 'add',
        path: 'packages/ui/src/components/{{kebabCase name}}.tsx',
        templateFile: data.withVariants
          ? 'plop-templates/shared-ui/component-with-variants.hbs'
          : 'plop-templates/shared-ui/component.hbs',
      });

      // Append export to index.ts
      actions.push({
        type: 'append',
        path: 'packages/ui/src/index.ts',
        template: "export * from './components/{{kebabCase name}}';",
      });

      return actions;
    },
  });
}
