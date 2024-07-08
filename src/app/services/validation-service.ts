import { Injectable } from '@angular/core';
import * as Yup from 'yup';

export interface ValidationErrorInfo {
  column: string;
  error: string;
}

@Injectable({
  providedIn: 'root'
})
export class ValidationService {
  private validationSchema: any;

  constructor() {
    this.loadValidationSchema();
  }

  private loadValidationSchema(): void {
    // Fetch or define your validation schema (JSON format)
    this.validationSchema = {
      columns: ["Student_Rollno", "Student_Name", "Marks"],
      Student_Rollno: {
        type: 'string',
        required: true,
        length: 10,
        error: 'Invalid roll number'
      },
      Student_Name: {
        type: 'string',
        required: true,
        error: 'Invalid name'
      },
      Marks: {
        type: 'numeric',
        required: true,
        min: 0,
        max: 100,
        error: 'Invalid marks'
      }
    };
  }

  private getSchemaPropertiesByColumn(validationValue: any) {
    let schemaProperties;

    switch (validationValue.type) {
      case 'string':
        schemaProperties = Yup.string();
        if (validationValue.length)
          schemaProperties = schemaProperties.length(validationValue.length, validationValue.error);
        if (validationValue.min)
          schemaProperties = schemaProperties.min(validationValue.min, validationValue.error);
        if (validationValue.max)
          schemaProperties = schemaProperties.max(validationValue.max, validationValue.error);
        if (validationValue.regex)
          schemaProperties = schemaProperties.matches(new RegExp(validationValue.regex), validationValue.error ?? "Value does not match regex");
        if (validationValue.email)
          schemaProperties = schemaProperties.email(validationValue.error ?? "Value is not a valid email");
        break;
      case 'numeric':
        schemaProperties = Yup.number();
        if (validationValue.min)
          schemaProperties = schemaProperties.min(validationValue.min, validationValue.error);
        if (validationValue.max)
          schemaProperties = schemaProperties.max(validationValue.max, validationValue.error);
        break;
      default:
        throw new Error(`Validation type ${validationValue.type} not found`);
    }

    if (validationValue.required)
      schemaProperties = schemaProperties.required("Value is required");

    return schemaProperties;
  }

  private getSchema() {
    const schema: Record<string, Yup.StringSchema<string | undefined> | Yup.NumberSchema<number | undefined>> = {};
    this.validationSchema.columns.forEach((column: string) => {
      schema[column] = this.getSchemaPropertiesByColumn(this.validationSchema[column]);
    });
    return Yup.object().shape(schema);
  }

  async validateData(data: any[]): Promise<ValidationErrorInfo[]> {
    const schema = this.getSchema();
    const errors: ValidationErrorInfo[] = [];

    for (let rowIndex = 0; rowIndex < data.length; rowIndex++) {
      const row = data[rowIndex];
      try {
        await schema.validate(row, { abortEarly: false });
      } catch (err) {
        if (err instanceof Yup.ValidationError) {
          err.inner.forEach((validationError) => {
            errors.push({
              column: validationError.path ?? '',
              error: validationError.message,
            });
          });
        } else if (err instanceof Error) {
            errors.push({ column: '', error: err.message });
          }
      }
    }

    return errors;
  }
}
