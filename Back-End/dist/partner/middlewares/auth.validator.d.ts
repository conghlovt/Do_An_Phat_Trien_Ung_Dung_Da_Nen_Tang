import { z } from 'zod';
export declare const registerSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
    username: z.ZodString;
    role: z.ZodEnum<{
        partner: "partner";
        customer: "customer";
    }>;
}, z.core.$strip>;
export declare const loginSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, z.core.$strip>;
export declare const refreshTokenSchema: z.ZodObject<{
    refreshToken: z.ZodString;
}, z.core.$strip>;
export declare const forgotPasswordSchema: z.ZodObject<{
    email: z.ZodString;
}, z.core.$strip>;
export declare const resetPasswordSchema: z.ZodObject<{
    email: z.ZodString;
    code: z.ZodString;
    newPassword: z.ZodString;
}, z.core.$strip>;
//# sourceMappingURL=auth.validator.d.ts.map