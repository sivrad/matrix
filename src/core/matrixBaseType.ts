import { AlreadyInstantiated, NoMatrixInstance, Uninstantiated } from './error';
import { Matrix } from './matrixInstance';
import { Driver } from './driver';
import {
    MatrixBaseTypeData,
    SerializedMatrixBaseTypeData,
    ClassInformation,
    schema,
    ConstructorArguments,
    TypeStructure,
    FieldStructure,
    SerializeData,
    InstanceData,
    FieldData,
} from './type';
import { Values } from './constants';
import { mapObject, removeDuplicateData } from './util';
import { FieldManager } from './fieldManager';

/**
 * Base class for the Matrix.
 */
export class MatrixBaseType {
    /**
     * The collection assigned to the type.
     */
    private static matrix?: Matrix;
    /**
     * Field information.
     */
    protected static fields: Record<string, schema.Field> = {};
    /**
     * Field values.
     */
    protected static staticFields: Record<string, unknown> = {};
    /**
     * Information on the class.
     */
    protected static classInformation: ClassInformation;
    /**
     * The field manager.
     */
    private fieldManager: FieldManager;
    /**
     * Id of the type.
     */
    private id: string | null;
    /**
     * UNIX timestamp of last updated in seconds.
     */
    private updatedAt = -1;
    /**
     * UNIX timestamp of when the instance was created in seconds.
     */
    private createdAt = -1;

    /**
     * Contructor for a base type.
     * @param {MatrixBaseTypeData} data Type data.
     */
    constructor(data: ConstructorArguments<MatrixBaseTypeData>) {
        // Set the ID if provided.
        if (Object.keys(data).includes('$id')) this.setId(data.$id as string);
        // Remove the '$id'
        delete data.$id;
        // Create the field manager.
        this.fieldManager = new FieldManager(this);
        // Skip the data validation if flag is set.
        if (data.$skipDataPopulation) return;
        // Popualte the fields with the FM.
        this.fieldManager.populate(data);
    }

    /**
     * Set the ID, can only be done once.
     * @param {string} id The id of the type.
     */
    // @typeMethod()
    setId(id: string): void {
        if (this.isInstance()) throw new AlreadyInstantiated(this);
        this.id = id;
    }

    /**
     * Is instance.
     * @function isInstance
     * @memberof MatrixBaseType
     * @returns {boolean} If the type is an instance or not.
     */
    isInstance(): boolean {
        return this.getId() != null;
    }

    /**
     * Retrive the Id.
     * @returns {string} The Id of the type.
     */
    getId(): string | null {
        return this.id;
    }

    /**
     * Return the type class.
     * @function getTypeClass
     * @memberof MatrixBaseType
     * @returns {MatrixBaseType} Base thing class.
     */
    getTypeClass(): typeof MatrixBaseType {
        return MatrixBaseType;
    }

    /**
     * Get all the fields for the type.
     * @function getFields
     * @memberof BaseType
     * @static
     * @returns {Field[]} The type's field.
     */
    static getFields(): Record<string, schema.Field> {
        let parent = this.getParent();
        let allFields: Record<string, schema.Field> = this.fields;
        while (parent != null) {
            const fields = parent.fields;
            allFields = { ...allFields, ...fields };
            parent = Object.getPrototypeOf(parent);
        }
        return allFields;
    }

    /**
     * Get all the static field values.
     * @function getStaticFieldValues
     * @memberof MatrixBaseType
     * @static
     * @returns {Record<string, unknown>} The static fields.
     */
    static getStaticFieldValues(): Record<string, unknown> {
        return this.staticFields;
    }

    /**
     * Return the parent class.
     * @returns {typeof MatrixBaseType | null} The MatrixBaseType class or null if no parent.
     */
    static getParent(): typeof MatrixBaseType | null {
        return Object.getPrototypeOf(this);
    }

    /**
     * Get the type name.
     * @function getName
     * @memberof MatrixBaseType
     * @static
     * @example
     * MyType.getName() // "MyType"
     * @returns {string} Name of the type.
     */
    static getName(): string {
        if (!this.classInformation) return Values.BASE_TYPE_NAME;
        return this.classInformation.name;
    }

    /**
     * Get the type.
     *
     * This is in collection name notation, see example.
     * @function getType
     * @memberof MatrixBaseType
     * @static
     * @example
     * MyType.getType() // "collectionName.MyType"
     * @returns {string} Type of the type.
     */
    static getType(): string {
        return `${this.getCollection()}.${this.getName()}`;
    }

    /**
     * Get the collection name.
     * @function getCollection
     * @memberof MatrixBaseType
     * @static
     * @example
     * MyType.getCollection() // "std"
     * @returns {string} Name of the collection.
     */
    static getCollection(): string {
        return this.classInformation.collection;
    }

    /**
     * Get a value.
     * @function getField
     * @memberof MatrixBaseType
     * @protected
     * @param   {string}  fieldName The name of the field.
     * @param   {number}  timestamp The timestamp to get.
     * @returns {unknown}           The value of the field.
     */
    getFieldValue<T = unknown>(fieldName: string, timestamp?: number): T {
        return this.fieldManager.getFieldValue(fieldName, timestamp) as T;
    }

    /**
     * Set a value.
     * @function setField
     * @memberof MatrixBaseType
     * @protected
     * @param {string}  fieldName The name of the field.
     * @param {unknown} value     The value of the field.
     */
    setFieldValue(fieldName: string, value: unknown): void {
        this.fieldManager.setFieldValue(fieldName, value, 'INTERNAL');
    }

    /**
     * Return the children classes.
     * @function getChildren
     * @memberof MatrixBaseType
     * @returns {typeof MatrixBaseType[]} The children class.
     * @static
     */
    static getChildren(): typeof MatrixBaseType[] {
        let children = this.getDirectChildren();
        for (const child of children) {
            children = children.concat(child.getChildren());
        }
        return children;
    }

    /**
     * Return the direct children classes.
     * @function getChildren
     * @memberof MatrixBaseType
     * @returns {typeof MatrixBaseType[]} The children class.
     * @static
     */
    static getDirectChildren(): typeof MatrixBaseType[] {
        return this.getMatrix().getChildTypes(this.getType());
    }

    /**
     * Set the type's Matrix instance.
     * @function setMatrix
     * @memberof Matrix
     * @private
     * @static
     * @param {Matrix} matrix The matrix instance.
     * @returns {void}
     */
    private static setMatrix(matrix: Matrix): void {
        this.matrix = matrix;
    }

    /**
     * Get the Matrix instance.
     * @function getMatrix
     * @memberof Matrix
     * @static
     * @returns {Matrix} Matrix instance.
     */
    static getMatrix(): Matrix {
        if (this.matrix == null) throw new NoMatrixInstance(this);
        return this.matrix;
    }

    /**
     * Get the type label.
     * @function getLabel
     * @memberof MatrixBaseType
     * @static
     * @returns {string} Label of the type.
     */
    static getLabel(): string {
        return this.classInformation.label;
    }

    /**
     * Get the type description.
     * @function getDescription
     * @memberof MatrixBaseType
     * @static
     * @returns {string} Description of the type.
     */
    static getDescription(): string {
        return this.classInformation.description;
    }

    /**
     * Get the type icon.
     * @function getIcon
     * @memberof MatrixBaseType
     * @static
     * @returns {string} Icon of the type.
     */
    static getIcon(): string {
        return this.classInformation.icon;
    }

    /**
     * Get the type flags.
     * @function getFlags
     * @memberof MatrixBaseType
     * @static
     * @returns {string[]} Flags of the type.
     */
    static getFlags(): string[] {
        return this.classInformation.flags;
    }

    /**
     * Get the type schema.
     *
     * This can be serialized to JSON and be built.
     * @function getSchema
     * @memberof MatrixBaseType
     * @static
     * @returns {Schema} Schema of the type.
     */
    static getSchema(): schema.Type {
        return {
            name: this.getName(),
            label: this.getLabel(),
            description: this.getDescription(),
            icon: this.getIcon(),
            flags: this.getFlags() as schema.Type['flags'],
            parent: this.getParent()?.getType() || null,
            fieldValues: this.staticFields as schema.Type['fieldValues'],
            fields: this.fields,
        };
    }

    /**
     * Return the structure of the type.
     * @function getStructure
     * @memberof MatrixBaseType
     * @static
     * @returns {Type} Structure of the type.
     */
    static getStructure(): TypeStructure {
        const fieldOwners = this.generateFieldOwners();
        const schema = this.getSchema();
        // Update the fields to include 'required' and 'owner'.
        schema.fields = mapObject(
            this.getFields(),
            (fieldName, field: FieldStructure) => {
                // field.required = !Object.keys(field).includes('defaultValue');
                field.owner = fieldOwners.get(fieldName);
                return field;
            },
        );
        return schema;
    }

    /**
     * Generate field owners object.
     * @function generateFieldOwners
     * @memberof MatrixBaseType
     * @static
     * @private
     * @returns {Map<string, string>} A map of field name to type.
     */
    private static generateFieldOwners(): Map<string, string> {
        // Create a map of all the fields for each parent.
        const fieldOwners = new Map<string, string>();

        // eslint-disable-next-line @typescript-eslint/no-this-alias
        let type: typeof MatrixBaseType | null = this;
        while (type?.fields != null) {
            for (const fieldName of Object.keys(type.fields)) {
                fieldOwners.set(fieldName, type.getType());
            }
            type = type.getParent();
        }

        return fieldOwners;
    }

    /**
     * Get the type's source.
     * @returns {Driver} The type's source.
     */
    static getDriver(): Driver {
        return this.getMatrix().getDriver();
    }

    /**
     * Create an instance from serialized data.
     * @param   {string}                       $id             The ID of the instance.
     * @param   {SerializedMatrixBaseTypeData} serializedData The serialized data.
     * @returns {T}                                           The new instance.
     */
    static deserialize<T extends MatrixBaseType = MatrixBaseType>(
        $id: string,
        serializedData: SerializedMatrixBaseTypeData,
    ): T {
        const instance = new this({ $id, $skipDataPopulation: true });
        instance.fieldManager.setData(serializedData);
        return instance as T;
    }

    /**
     * Serialize the type.
     *
     * Used by Drivers.
     * @param {boolean} asRefrence If it should be serializeed as a reference.
     * @returns {IncludeMetaData | string} The serialized type, unless used as a ref.
     */
    serialize<T extends MatrixBaseTypeData = MatrixBaseTypeData>(
        asRefrence = false,
    ): SerializeData<T> | string {
        if (asRefrence && this.isInstance()) return this.getReference();
        return {
            id: this.getId() as string,
            type: this.getTypeClass().getType(),
            data: this.fieldManager.serialize(),
        } as SerializeData<T>;
    }

    /**
     * Get data for external applications.
     * @function getData
     * @memberof MatrixBaseType
     * @returns {InstanceData} The instance data.
     */
    public getData(): InstanceData {
        return {
            ...{
                createdAt: this.fieldManager.getCreatedAtTimestamp(),
                updatedAt: this.fieldManager.getUpdatedAtTimestamp(),
            },
            ...(this.serialize() as SerializeData),
        };
    }

    /**
     * Get the reference of an instance.
     * @function getReference
     * @memberof MatrixBaseType
     * @example
     * MyType.getReference() // "myCollection.MyType@00000420"
     * @returns {string} The instance reference string.
     */
    public getReference(): string {
        this.enforceInstance();
        return `${this.getTypeClass().getType()}@${this.getId()}`;
    }

    /**
     * Enforce it must be an instance.
     * @function enforceInstance
     * @memberof MatrixBaseType
     * @private
     */
    private enforceInstance() {
        if (!this.isInstance()) throw new Uninstantiated(this.getTypeClass());
    }

    /**
     * Get an instance of the type from the ID.
     * @param {string} id The ID of the instance.
     * @returns {T} The new instance of the type.
     */
    static async get<T extends MatrixBaseType = MatrixBaseType>(
        id: string,
    ): Promise<T> {
        const source = this.getDriver(),
            type = this.getType(),
            response = (await source.getInstance(type, id)).response,
            data = response.data;
        return this.deserialize<T>(id, data);
    }

    /**
     * Get all the instances of a type.
     * // TODO: Add type caching.
     * @param {boolean} includeChildren If instances of child types should be included.
     * @returns {T[]} All the new instances.
     */
    static async getAll<T extends MatrixBaseType = MatrixBaseType>(
        includeChildren = true,
    ): Promise<T[]> {
        const source = this.getDriver(),
            type = this.getType(),
            response = (await source.getInstances(type)).response;
        let instances: T[] = [];
        // Add all the child instances if requested.
        if (includeChildren) {
            for (const child of this.getDirectChildren()) {
                instances = instances.concat(await child.getAll());
            }
        }
        for (const [id, serializedData] of Object.entries(response)) {
            const instance = this.deserialize(id, serializedData.data);
            instances.push(instance as T);
        }
        return instances;
    }

    /**
     * Turn the type into an instance.
     * @function createInstance
     * @memberof MatrixBaseType
     * @async
     * @returns {Promise<MatrixBaseType>} The instance with the Id.
     */
    async createInstance(): Promise<this> {
        this.enforceType();
        const response = (
            await this.getTypeClass()
                .getDriver()
                .createInstance(
                    this.getTypeClass().getType(),
                    this.fieldManager.serialize(),
                )
        ).response;
        this.setId(response.id);
        return this;
    }

    /**
     * Enforce it must be an type.
     * @function enforceType
     * @memberof MatrixBaseType
     * @private
     */
    private enforceType() {
        if (this.isInstance()) throw new AlreadyInstantiated(this);
    }

    /**
     * Sync the local and remote data with each other.
     * @function sync
     * @memberof MatrixBaseType
     * @async
     */
    public async sync(): Promise<void> {
        this.enforceInstance();
        // Get the local data.
        const localData = this.getLocalData();

        // Get the remote data.
        const remoteData = await this.getRemoteData();

        // Get differences between the data.
        const remainingLocalData = removeDuplicateData(localData, remoteData);
        const remainingRemoteData = removeDuplicateData(remoteData, localData);

        // Update the local data with remaining remote data.
        if (remainingRemoteData) this.fieldManager.setData(remainingRemoteData);

        // Use the remaining local to update the remote data.
        if (remainingLocalData) await this.updateRemoteData(remainingLocalData);
    }

    /**
     * Get the local data.
     * @function getLocalData
     * @memberof MatrixBaseType
     * @private
     * @returns {SerializeFields} The serialized fields.
     */
    private getLocalData() {
        return this.fieldManager.serialize();
    }

    /**
     * Get the remote data.
     * @function getRemoteData
     * @memberof MatrixBaseType
     * @private
     * @async
     * @returns {SerializeFields} The remote fields.
     */
    private async getRemoteData() {
        const type = this.getTypeClass();
        const response = await type
            .getDriver()
            .getInstance(type.getType(), this.getId() as string);
        return response.response.data;
    }

    /**
     * Update the remote data.
     * @function updateRemoteData
     * @memberof MatrixBaseType
     * @private
     * @async
     * @param {Record<string, FieldData>} data The data to update.
     */
    private async updateRemoteData(data: Record<string, FieldData>) {
        const type = this.getTypeClass();
        await type
            .getDriver()
            .updateInstance(type.getType(), this.getId() as string, data);
    }

    // /**
    //  * Update the lastUpdated value to the current time.
    //  */
    // private resetLastUpdated(): void {
    //     this.updatedAt = Math.floor(new Date().getTime() / 1000);
    // }

    // /**
    //  * Get the last updated time.
    //  * @returns {Date} A date object.
    //  */
    // getUpdatedAt(): Date {
    //     return new Date(this.updatedAt * 1000);
    // }

    // END
}
