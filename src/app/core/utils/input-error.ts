function getMessages(validatorName: string, validatorValue?: any) {
  let messages: any = {
    required: 'Campo requerido',
    invalidEmailAddress: 'Direccion email invalido',
    minlength: `Campo mínimo de ${validatorValue.requiredLength} caracteres`,
    maxlength: `Campo máximo de ${validatorValue.requiredLength} caracteres`,
    invalidNumber: `Campo debe ser numérico`,
  };
  return messages[validatorName];
}

function isInvalid(isSubmitted: any, control: any) {
  return control.invalid && (control.dirty || control.touched || isSubmitted);
}

export default {
  getMessages,
  isInvalid,
};
