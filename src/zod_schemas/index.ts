import { z } from "zod";

export const passwordSchema = z
  .string()
  .min(8, { message: "A senha deve ter pelo menos 8 caracteres" })
  .max(50, { message: "A senha não pode ter mais de 50 caracteres" })
  .refine((password) => /\d/.test(password), {
    message: "A senha deve conter pelo menos um número",
  })
  .refine((password) => /[A-Z]/.test(password), {
    message: "A senha deve conter pelo menos uma letra maiúscula",
  })
  .refine((password) => /[a-z]/.test(password), {
    message: "A senha deve conter pelo menos uma letra minúscula",
  })
  .refine((password) => /[^a-zA-Z0-9]/.test(password), {
    message: "A senha deve conter pelo menos um caractere especial",
  });

  const isValidDateTime = (str: string): boolean => {
    const regex = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;
    return regex.test(str);
  };
  
  const _dateTimeSchema = z.string().refine(isValidDateTime, {
    message: "Formato da data inválido. Use YYYY-MM-DD HH:mm:ss",
  });

  export const dateTimeSchema = _dateTimeSchema
  _dateTimeSchema