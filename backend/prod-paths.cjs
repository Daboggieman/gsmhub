/**
 * Runtime module-alias for the compiled production bundle.
 *
 * tsc does not rewrite tsconfig path aliases into the emitted JS, so every
 * compiled file still requires "@shared/..." and "@modules/..." — bare
 * specifiers Node cannot resolve. This hook maps:
 *   @shared/*  → dist/shared/src/*
 *   @modules/* → dist/backend/src/modules/*
 *
 * Loaded before the app via:
 *   node -r ./prod-paths.cjs dist/backend/src/main
 */
const path = require('path');
const Module = require('module');

const aliases = {
  '@shared/': path.resolve(__dirname, 'dist', 'shared', 'src') + path.sep,
  '@modules/': path.resolve(__dirname, 'dist', 'backend', 'src', 'modules') + path.sep,
};
const originalResolve = Module._resolveFilename;

Module._resolveFilename = function (request, ...args) {
  for (const [prefix, target] of Object.entries(aliases)) {
    if (request.startsWith(prefix)) {
      request = path.join(target, request.slice(prefix.length));
      break;
    }
  }
  return originalResolve.call(this, request, ...args);
};
