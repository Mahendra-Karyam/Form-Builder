export type FieldType = 'text' | 'number' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'date';

export interface ValidationRule {
  type: 'required' | 'minLength' | 'maxLength' | 'email' | 'password';
  value?: number | string;
  message: string;
}

export interface SelectOption {
  label: string;
  value: string;
}

export interface DerivedFieldConfig {
  isDerived: boolean;
  parentFields: string[];
  formula: string; // Simple formula like "field1 + field2" or custom logic
}

export interface FormField {
  id: string;
  type: FieldType;
  label: string;
  required: boolean;
  defaultValue?: any;
  validationRules: ValidationRule[];
  options?: SelectOption[]; // For select and radio fields
  derivedConfig?: DerivedFieldConfig;
}

export interface FormSchema {
  id: string;
  name: string;
  fields: FormField[];
  createdAt: string;
}

export interface FormData {
  [fieldId: string]: any;
}

export interface ValidationError {
  fieldId: string;
  message: string;
}