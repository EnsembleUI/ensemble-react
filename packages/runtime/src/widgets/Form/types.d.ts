export interface FormInputProps<T> {
  label: string;
  required: boolean;
  enabled: boolean;
  value?: T;
  hintText?: string;
}
