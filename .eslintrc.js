module.exports = {
  extends: [
    'airbnb-base/legacy',
    'prettier',
    'plugin:vue/vue3-recommended',
    'plugin:vitest-globals/recommended',
    // use recommended-legacy when upgrading the plugin to v4
    'plugin:@intlify/vue-i18n/recommended',
  ],
  overrides: [
    {
      files: ['**/*.spec.{j,t}s?(x)'],
      env: {
        'vitest-globals/env': true,
      },
    },
    {
      files: ['**/*.story.vue'],
      rules: {
        'vue/no-undef-components': [
          'error',
          {
            ignorePatterns: ['Variant', 'Story'],
          },
        ],
        // Story files can have static strings, it doesn't need to handle i18n always.
        'vue/no-bare-strings-in-template': 'off',
        'no-console': 'off',
      },
    },
    // Puertas propias del fork, acotadas a portelia/: ver PORTELIA.md > "Puertas de calidad".
    // Upstream no se gatea (más de 9k archivos ajenos, 453 avisos preexistentes).
    {
      files: ['app/javascript/dashboard/portelia/**/*.vue'],
      extends: ['plugin:vuejs-accessibility/recommended'],
      // El preset de accesibilidad fija ecmaVersion 2020; lo reponemos porque el fork usa
      // separadores numéricos (86_400_000) y otra sintaxis de ES2021+.
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
      rules: {
        'vue/no-setup-props-reactivity-loss': 'error',
        'vue/no-ref-object-reactivity-loss': 'error',
        // El diseño de estos componentes ya asocia el control con su label puertas adentro
        // (Input/TextArea renderizan <label :for> + :id internos; Select expone :aria-label).
        // Las dos reglas sólo miran el sitio de la llamada, no el template del hijo, así que
        // marcan en falso cada uso de esos componentes. El componente propio de Chatwoot
        // `Label` (badge de estado, no un form label) además choca con `label-has-for`: la
        // regla matchea el nombre "label" sin forma de excluirlo por config.
        'vuejs-accessibility/label-has-for': 'off',
        'vuejs-accessibility/form-control-has-label': 'off',
        // `Button` siempre resuelve a texto visible (o :aria-label si es sólo ícono); evita
        // duplicar aria-label en cada <a> que lo envuelve.
        'vuejs-accessibility/anchor-has-content': [
          'error',
          { accessibleChildren: ['Button'] },
        ],
      },
    },
  ],
  plugins: ['html', 'prettier'],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  rules: {
    'prettier/prettier': ['error'],
    camelcase: 'off',
    'no-param-reassign': 'off',
    'import/no-extraneous-dependencies': 'off',
    'import/prefer-default-export': 'off',
    'import/no-named-as-default': 'off',
    'jsx-a11y/no-static-element-interactions': 'off',
    'jsx-a11y/click-events-have-key-events': 'off',
    'jsx-a11y/label-has-associated-control': 'off',
    'jsx-a11y/label-has-for': 'off',
    'jsx-a11y/anchor-is-valid': 'off',
    'import/no-unresolved': 'off',
    'vue/html-indent': 'off',
    'vue/multi-word-component-names': 'off',
    'vue/next-tick-style': ['error', 'callback'],
    'vue/block-order': [
      'error',
      {
        order: ['script', 'template', 'style'],
      },
    ],
    'vue/component-name-in-template-casing': [
      'error',
      'PascalCase',
      {
        registeredComponentsOnly: true,
      },
    ],
    'vue/component-options-name-casing': ['error', 'PascalCase'],
    'vue/custom-event-name-casing': ['error', 'camelCase'],
    'vue/define-emits-declaration': ['error'],
    'vue/define-macros-order': [
      'error',
      {
        order: ['defineProps', 'defineEmits'],
        defineExposeLast: false,
      },
    ],
    'vue/define-props-declaration': ['error', 'runtime'],
    'vue/match-component-import-name': ['error'],
    'vue/no-bare-strings-in-template': [
      'error',
      {
        allowlist: [
          '(',
          ')',
          ',',
          '.',
          '&',
          '+',
          '-',
          '=',
          '*',
          '/',
          '#',
          '%',
          '!',
          '?',
          ':',
          '[',
          ']',
          '{',
          '}',
          '<',
          '>',
          '⌘',
          '📄',
          '🎉',
          '🚀',
          '💬',
          '👥',
          '📥',
          '🔖',
          '❌',
          '✅',
          '\u00b7',
          '\u2022',
          '\u2010',
          '\u2013',
          '\u2014',
          '\u2212',
          '|',
        ],
        attributes: {
          '/.+/': [
            'title',
            'aria-label',
            'aria-placeholder',
            'aria-roledescription',
            'aria-valuetext',
          ],
          input: ['placeholder'],
        },
        directives: ['v-text'],
      },
    ],
    'vue/no-empty-component-block': 'error',
    'vue/no-multiple-objects-in-class': 'error',
    'vue/no-root-v-if': 'warn',
    'vue/no-static-inline-styles': [
      'error',
      {
        allowBinding: false,
      },
    ],
    'vue/no-template-target-blank': [
      'error',
      {
        allowReferrer: false,
        enforceDynamicLinks: 'always',
      },
    ],
    'vue/no-required-prop-with-default': [
      'error',
      {
        autofix: false,
      },
    ],
    'vue/no-this-in-before-route-enter': 'error',
    'vue/no-undef-components': [
      'error',
      {
        ignorePatterns: [
          '^woot-',
          '^fluent-',
          '^multiselect',
          '^router-link',
          '^router-view',
          '^ninja-keys',
          '^FormulateForm',
          '^FormulateInput',
          '^highlightjs',
        ],
      },
    ],
    'vue/no-unused-emit-declarations': 'error',
    'vue/no-unused-refs': 'error',
    'vue/no-use-v-else-with-v-for': 'error',
    'vue/prefer-true-attribute-shorthand': 'error',
    'vue/no-useless-v-bind': [
      'error',
      {
        ignoreIncludesComment: false,
        ignoreStringEscape: false,
      },
    ],
    'vue/no-v-text': 'error',
    'vue/padding-line-between-blocks': ['error', 'always'],
    'vue/prefer-separate-static-class': 'error',
    'vue/require-explicit-slots': 'error',
    'vue/require-macro-variable-name': [
      'error',
      {
        defineProps: 'props',
        defineEmits: 'emit',
        defineSlots: 'slots',
        useSlots: 'slots',
        useAttrs: 'attrs',
      },
    ],
    'vue/no-unused-properties': [
      'error',
      {
        groups: ['props'],
        deepData: false,
        ignorePublicMembers: false,
        unreferencedOptions: [],
      },
    ],
    'vue/max-attributes-per-line': [
      'error',
      {
        singleline: {
          max: 20,
        },
        multiline: {
          max: 1,
        },
      },
    ],
    'vue/html-self-closing': [
      'error',
      {
        html: {
          void: 'always',
          normal: 'always',
          component: 'always',
        },
        svg: 'always',
        math: 'always',
      },
    ],
    'vue/no-v-html': 'off',
    'vue/component-definition-name-casing': 'off',
    'vue/singleline-html-element-content-newline': 'off',
    'import/extensions': ['off'],
    'no-console': 'error',
    '@intlify/vue-i18n/no-dynamic-keys': 'warn',
    '@intlify/vue-i18n/no-unused-keys': [
      'warn',
      {
        extensions: ['.js', '.vue'],
      },
    ],
  },
  settings: {
    'vue-i18n': {
      localeDir: './app/javascript/*/i18n/**.json',
    },
  },
  env: {
    browser: true,
    es2020: true,
    node: true,
  },
  globals: {
    bus: true,
    vi: true,
  },
};
