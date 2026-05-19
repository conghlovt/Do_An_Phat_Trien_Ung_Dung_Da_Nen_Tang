export declare class AuthService {
    /**
     * Register a new user
     */
    register(data: {
        email: string;
        password: string;
        username: string;
        role: string;
    }): Promise<{
        user: {
            id: string;
            email: string;
            username: string;
            phone: string | null;
            role: import(".prisma/client").$Enums.Role;
            code: string | null;
            avatar: string | null;
            refreshToken: string | null;
            status: import(".prisma/client").$Enums.UserStatus;
            emailVerified: boolean;
            lastLoginAt: Date | null;
            createdAt: Date;
            updatedAt: Date;
        };
        accessToken: string;
        refreshToken: string;
    }>;
    /**
     * Login user
     */
    login(email: string, password: string): Promise<{
        user: {
            id: string;
            email: string;
            username: string;
            phone: string | null;
            role: import(".prisma/client").$Enums.Role;
            code: string | null;
            avatar: string | null;
            refreshToken: string | null;
            status: import(".prisma/client").$Enums.UserStatus;
            emailVerified: boolean;
            lastLoginAt: Date | null;
            createdAt: Date;
            updatedAt: Date;
        };
        accessToken: string;
        refreshToken: string;
    }>;
    /**
     * Refresh access token using refresh token
     */
    refreshToken(token: string): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    /**
     * Forgot password — generate reset code
     */
    forgotPassword(email: string): Promise<{
        code: string;
    }>;
    /**
     * Reset password using code
     */
    resetPassword(email: string, code: string, newPassword: string): Promise<boolean>;
}
export declare const authService: AuthService;
//# sourceMappingURL=auth.service.d.ts.map