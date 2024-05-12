module.exports = {
    "env": {
        "browser": true,
        "es2021": true
    },
    "extends": [
        "eslint:recommended",
        "plugin:react-hooks/recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:react/recommended"
    ],
    "overrides": [
        {
            "env": {
                "node": true
            },
            "files": [
                ".eslintrc.{js,cjs}"
            ],
            "parserOptions": {
                "sourceType": "script"
            }
        }
    ],
    "parser": "@typescript-eslint/parser",
    "parserOptions": {
        "ecmaVersion": "latest",
        "sourceType": "module",
        "ecmaFeatures": {
            "jsx": true
          }
    },
    "plugins": [
        "@typescript-eslint",
        "@stylistic/js",
        "spellcheck",
        "react"
    ],
    "rules": {
        "@stylistic/js/indent": ["error"],
        "@stylistic/js/array-bracket-spacing": ["error"],
        "@stylistic/js/brace-style": ["error"],
        "@stylistic/js/spaced-comment": ["error"],
        "@stylistic/js/comma-style": ["error"],
        "@typescript-eslint/no-explicit-any": ["error"],
        "spellcheck/spell-checker": [1,  {"skipWords": [
            "str",
            "sluggified",
            "checkbox",
            "minio",
            "goto",
            "frontend",
            "dom",
            "wavesurfer",
            "i",
         ]}],
        "react/react-in-jsx-scope": "off",
        "react/jsx-filename-extension": [1, { "extensions": [".js", ".jsx", ".ts", ".tsx",] }],
        "@typescript-eslint/no-unused-vars": ["error", { "varsIgnorePattern": "^(slug|created_at|data)$" }],
        "no-duplicate-imports": ["error"],
        "camelcase": ["warn"],
        "semi": [
            "error",
            "always"
        ], 
        "no-undef": ["error"],
        "comma-dangle": ["error", "always-multiline"]
    },
    "settings": {
        "react": {
          "version": "detect"
        }
    },
    "globals": {
        "process": "readonly",
        "React": "readonly",
        "AWS": "readonly",
        "jest": "readonly",
        "expect": "readonly",
        "test": "readonly",
        "afterAll": "readonly",
        "beforeEach": "readonly",
        "global": "readonly",
        "JSX": "readonly",
        "describe": "readonly",
        "Buffer": "readonly",
    },
}
