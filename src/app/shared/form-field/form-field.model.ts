export interface FormFieldModel {
    name: string;
    label: string;
    type: 'text' | 'email' | 'password' | 'number' | 'date';
    min?: string;
}