export interface ValidatorError {
  errors: Array<{
    path: string;
    message: string;
  }>;
}
