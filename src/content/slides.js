/**
 * Backwards-compatible alias.
 *
 * Canonical scene content lives in `./scenes.js`. This module preserves the
 * previous import path for local tooling and older references.
 */
export { deckMeta, partIndex, scenes as slides } from './scenes.js'
