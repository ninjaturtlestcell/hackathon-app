import { z } from "zod";

/** Ortak auth formlari — web ve mobile ayni validation kurallarini paylasir. */
export const signInSchema = z.object({
  email: z.string().email("Geçerli bir e-posta gir"),
  password: z.string().min(8, "Şifre en az 8 karakter olmalı"),
});

export const signUpSchema = signInSchema
  .extend({
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Şifreler eşleşmiyor",
    path: ["confirmPassword"],
  });

export type SignInInput = z.infer<typeof signInSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;

export { z };
