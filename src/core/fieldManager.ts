import { InvalidFields, MissingFields } from './error';
import { Field } from './field';
import { MatrixBaseType } from './matrixBaseType';
import {
    FieldData,
    FieldDataPointEvent,
    MatrixBaseTypeData,
    schema,
    SerializeFields,
} from './type';
import { verifyValueType } from './util';

/**
 * The Field Manager.
 *
 * This manages all the fields for a Type.
 */
export class FieldManager {
    private fields = new Map<string, Field>();
    private cachedStaticFields: Record<string, unknown>;

    /**
     * Constructor for a Field Manager.
     * @function constructor
     * @memberof FieldManager
     * @param {MatrixBaseType} type The instance.
     */
    constructor(private type: MatrixBaseType) {
        this.initialize();
    }

    /**
     * Initialize the Field Manager.
     *
     * This will create the Field Objects.
     * @function initialize
     * @memberof FieldManager
     * @private
     */
    private initialize(): void {
        const fields = this.type.getTypeClass().getFields();
        this.cachedStaticFields = this.type
            .getTypeClass()
            .getStaticFieldValues();
        for (const [fieldName, field] of Object.entries(fields)) {
            this.createNewField(fieldName, field);
        }
    }

    /**
     * Create a new Field Object and add it to 'fields'.
     * @function createNewField
     * @memberof FieldManager
     * @private
     * @param {string} fieldName The name of the field.
     * @param {Field}  field     The field schema.
     */
    private createNewField(fieldName: string, field: schema.Field): void {
        // TODO: TURN INTO ERROR.
        if (this.fields.has(fieldName)) throw new Error('field already exists');
        const staticValue = this.cachedStaticFields[fieldName];
        const owner = this.type.getTypeClass().getType();
        // Set the field.
        this.fields.set(
            fieldName,
            new Field(fieldName, {
                ...{
                    staticValue,
                    owner,
                },
                ...field,
            }),
        );
    }

    /**
     * Populate the fields with a standard key value object.
     * @function populate
     * @memberof FieldManager
     * @param {MatrixBaseTypeData} data The data to populate with.
     */
    public populate(data: MatrixBaseTypeData): void {
        this.verifyFieldData(data);
        for (const [fieldName, value] of Object.entries(data)) {
            this.populateField(fieldName, value);
        }
    }

    /**
     * Verify the field data provided.
     *
     * This method checks these things:
     * - Actual field on the type.
     * - Missing fields on the type.
     * - Correct field type.
     * @function verifyFieldData
     * @memberof FieldManager
     * @param {MatrixBaseTypeData} data The data to verify.
     * @private
     */
    private verifyFieldData(data: MatrixBaseTypeData) {
        const providedFieldNames = Object.keys(data);
        this.checkMissingFields(providedFieldNames);
        this.checkInvalidFields(providedFieldNames);
        this.verifyFieldTypes(data);
    }

    /**
     * Check for missing fields.
     * @function checkMissingFields
     * @memberof FieldManager
     * @param {string[]} fieldNames The field names.
     * @private
     */
    private checkMissingFields(fieldNames: string[]) {
        const requiredFieldNames = this.getAllRequiredFieldNames();
        const missingFieldNames: string[] = [];
        for (const requiredFieldName of requiredFieldNames) {
            if (!fieldNames.includes(requiredFieldName))
                missingFieldNames.push(requiredFieldName);
        }
        // Throw an error is missing.
        if (missingFieldNames.length)
            throw new MissingFields(
                this.type.getTypeClass(),
                missingFieldNames,
            );
    }

    /**
     * Return all the required field names.
     * @function getAllRequiredFieldNames
     * @memberof FieldManager
     * @private
     * @returns {string[]} The names of all the required fields.
     */
    private getAllRequiredFieldNames() {
        return [...this.fields]
            .filter(([_, field]) => field.isRequired())
            .map(([fieldName, _]) => fieldName);
    }

    /**
     * Check for invalid fields.
     * @function checkInvalidFields
     * @memberof FieldManager
     * @param {string[]} fieldNames The field names.
     * @private
     */
    private checkInvalidFields(fieldNames: string[]) {
        const allFieldNames = this.getAllFieldNames();
        const invalidFields: string[] = [];
        for (const fieldName of fieldNames) {
            if (!allFieldNames.includes(fieldName))
                invalidFields.push(fieldName);
        }
        if (invalidFields.length)
            throw new InvalidFields(this.type.getTypeClass(), invalidFields);
    }

    /**
     * Get all the field names.
     * @function getAllFieldNames
     * @memberof FieldManager
     * @private
     * @returns {string[]} All the field names.
     */
    private getAllFieldNames() {
        return [...this.fields.keys()];
    }

    /**
     * Verify all the provided feild data have the proper types.
     * @function verifyFieldTypes
     * @memberof FieldManager
     * @param {MatrixBaseTypeData} data The data provided.
     */
    private verifyFieldTypes(data: MatrixBaseTypeData) {
        for (const [fieldName, value] of Object.entries(data)) {
            this.verifyFieldType(fieldName, value);
        }
    }

    /**
     * Verify a field type.
     * @function verifyFieldType
     * @memberof FieldManager
     * @param {string}  fieldName The field name.
     * @param {unknown} value The value type to check.
     */
    private verifyFieldType(fieldName: string, value: unknown) {
        const fieldType = this.getField(fieldName).getType();
        verifyValueType(fieldType, value);
    }

    /**
     * Get a field from it's name.
     * @function getField
     * @memberof FieldManager
     * @private
     * @param {string} fieldName The field's name to get.
     * @returns {Field} The field to return.
     */
    private getField(fieldName: string): Field {
        const field = this.fields.get(fieldName);
        if (!field) throw new Error('FIELD NOT FOUND');
        return field;
    }

    /**
     * Populate a field.
     *
     * The `value`'s type is not checked in this method.
     * @function populateField
     * @memberof FieldManager
     * @private
     * @param {string}  fieldName The field's name.
     * @param {unknown} value     The value to set.
     */
    private populateField(fieldName: string, value: unknown) {
        const field = this.getField(fieldName);
        field.setValue(value, 'INTERNAL');
    }

    /**
     * Get a field value.
     * @function getFieldValue
     * @memberof FieldManager
     * @param   {string} fieldName The field's name.
     * @param   {number} timestamp The timestamp to get the value from.
     * @returns {unknown}          The field's value.
     */
    public getFieldValue(fieldName: string, timestamp?: number): unknown {
        const field = this.getField(fieldName);
        return field.getDataPoint(timestamp).value;
    }

    /**
     * Set the current field value.
     * @function setFieldValue
     * @memberof FieldManager
     * @param {string}  fieldName The field's name.
     * @param {unknown} value     The value to set the field to.
     * @param {FieldDataPointEvent} event (Optional) The event.
     */
    public setFieldValue(
        fieldName: string,
        value: unknown,
        event?: FieldDataPointEvent,
    ): void {
        const field = this.getField(fieldName);
        field.setValue(value, event);
    }

    /**
     * Set a field value at a time.
     * @function setFieldValueAt
     * @memberof FieldManager
     * @private
     * @param {string}  fieldName The field's name.
     * @param {unknown} fieldData The value to set the field to.
     */
    private setFieldData(fieldName: string, fieldData: FieldData): void {
        const field = this.getField(fieldName);
        field.setData(fieldData);
    }

    /**
     * Set the data for all fields.
     * @function setData
     * @memberof FieldManager
     * @param {SerializeFields<MatrixBaseTypeData>} data The data to set.
     */
    public setData(data: SerializeFields<MatrixBaseTypeData>): void {
        for (const [fieldName, dataPoint] of Object.entries(data)) {
            this.setFieldData(fieldName, dataPoint);
        }
    }

    /**
     * Serialize all the fields.
     * @function serialize
     * @memberof FieldManager
     * @returns {SerializeFields<MatrixBaseTypeData>} The serialized fields.
     */
    public serialize(): SerializeFields<MatrixBaseTypeData> {
        const serializedData: SerializeFields<MatrixBaseTypeData> = {};
        for (const [fieldName, field] of [...this.fields]) {
            const serializedField = field.serialize();
            if (!serializedField) continue;
            serializedData[fieldName] = serializedField;
        }
        return serializedData;
    }
}
