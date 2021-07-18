import { Field } from './field';
import { MatrixBaseType } from './matrixBaseType';
import { MatrixBaseTypeData, schema } from './type';

/**
 * The Field Manager.
 *
 * This manages all the fields for a Type.
 */
export class FieldManager {
    private fields = new Map<string, Field>();

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
        for (const [fieldName, field] of Object.entries(
            this.type.getTypeClass().getFields(),
        )) {
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
        // Set the field.
        this.fields.set(fieldName, new Field(fieldName, field));
    }

    /**
     * Populate the fields with a standard key value object.
     * @function populate
     * @memberof FieldManager
     * @param {MatrixBaseTypeData} data The data to populate with.
     */
    public populate(data: MatrixBaseTypeData): void {
        this.verifyFieldData(data);
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
    private verifyFieldData(_: MatrixBaseTypeData) {
        return;
    }
}
