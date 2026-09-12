export interface PasswordValidation {
  isValid: boolean;
  hasMinLength: boolean;
  hasLetter: boolean;
  hasNumber: boolean;
  hasSpecialChar: boolean;
  errorMessage?: string;
}

export function validatePassword(password: string): PasswordValidation {
  const hasMinLength = password.length >= 8;
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`§]/.test(password);

  const isValid = hasMinLength && hasLetter && hasNumber && hasSpecialChar;

  let errorMessage: string | undefined;
  if (!isValid) {
    const missing: string[] = [];
    if (!hasMinLength) missing.push('no mínimo 8 caracteres');
    if (!hasLetter) missing.push('letras (maiúscula ou minúscula)');
    if (!hasNumber) missing.push('números');
    if (!hasSpecialChar) missing.push('caractere especial (!@#$...)');
    errorMessage = `A senha deve conter: ${missing.join(', ')}.`;
  }

  return {
    isValid,
    hasMinLength,
    hasLetter,
    hasNumber,
    hasSpecialChar,
    errorMessage,
  };
}
