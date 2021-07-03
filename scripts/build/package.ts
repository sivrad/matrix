/**
 * Base class for Imports and Exports.
 */
abstract class Packages {
    private packages: Record<
        string,
        { packageName: string | string[]; packageAllias?: string }
    > = {};

    /**
     * Constructor for the package manager.
     * @param {'import' | 'export'} packageStatement Import or Export.
     */
    constructor(private packageStatement: 'import' | 'export') {}

    /**
     * See if the packages contain a package.
     * @param {string} moduleName The package name.
     * @returns {boolean} `true` if found.
     */
    has(moduleName: string): boolean {
        return Object.keys(this.packages).includes(moduleName);
    }

    /**
     * Add an package.
     * @param   {string} moduleName Package to package from.
     * @param   {string} packageNames The items being packageed.
     * @returns {Imports}            The packages instance.
     */
    add(moduleName: string, ...packageNames: string[]): Packages {
        if (typeof this.packages[moduleName] == 'string')
            throw new Error('Can not overwrite a set package');
        if (!this.has(moduleName))
            this.packages[moduleName] = { packageName: [] };
        this.packages[moduleName].packageName = this.packages[
            moduleName
        ].packageName.concat(
            // @ts-expect-error Type is checked at line 23.
            packageNames,
        );
        return this;
    }

    /**
     * Sets a package package.
     * @param   {string} moduleName    Package to package from.
     * @param   {string} packageName   The package for the package.
     * @param   {string} packageAllias An optional allias for the package.
     * @returns {Imports}              The packages instance.
     */
    set(
        moduleName: string,
        packageName: string,
        packageAllias?: string,
    ): Packages {
        if (Array.isArray(this.packages[moduleName]))
            throw Error('Can not set an added package.');
        this.packages[moduleName] = { packageName, packageAllias };
        return this;
    }

    /**
     * Convert the packages to a string.
     * @returns {string} The packages as a string.
     */
    toString(): string {
        let packages = '';
        for (const packageName of Object.keys(this.packages)) {
            const firstImport = this.packages[packageName].packageName;
            const pkg = this.packages[packageName];
            const packageStatement =
                typeof firstImport == 'string'
                    ? firstImport
                    : `{ ${(pkg.packageName as string[]).join(', ')} }`;
            packages += `${this.packageStatement} ${packageStatement}${
                pkg.packageAllias ? ` as ${pkg.packageAllias}` : ''
            } from '${packageName}';\n`;
        }
        return packages;
    }
}

/**
 * Class to represent import statements.
 */
export class Imports extends Packages {
    /**
     * Constructor for Imports.
     */
    constructor() {
        super('import');
    }
}

/**
 * Class to represent exports statements.
 */
export class Exports extends Packages {
    /**
     * Constructor for Exports.
     */
    constructor() {
        super('export');
    }
}
