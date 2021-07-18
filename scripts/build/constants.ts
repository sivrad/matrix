export const SOURCE_DIRECTORY = 'src/';
export const TYPES_DIRECTORY = `${SOURCE_DIRECTORY}types/`;
export const BUILT_IN_TYPES = ['string', 'number', 'boolean', 'null'];
export const COLLECTION_REPO_PREFIX = 'matrix-collection-';
export const COLLECTION_PACKAGE_PREFIX = `@sivrad/${COLLECTION_REPO_PREFIX}`;
export const TEMPLATES_PATH = './scripts/build/templates/';
// This is used for debugging, ideally, everything should be set to `true`.
export const ENABLED_METHODS = {
    GET: false,
    GET_ALL: false,
    GET_TYPE_CLASS: true,
    FIELDS: false,
    PROTECTED_FIELDS: false,
};
