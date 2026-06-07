import { z } from "zod";

/** Ortak auth formlari — web ve mobile ayni validation kurallarini paylasir. */
export const signInSchema = z.object({
  email: z.string().email("Gecerli bir e-posta gir"),
  password: z.string().min(8, "Sifre en az 8 karakter olmali"),
});

export const signUpSchema = signInSchema
  .extend({
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Sifreler eslesmiyor",
    path: ["confirmPassword"],
  });

export type SignInInput = z.infer<typeof signInSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;

export { z };
