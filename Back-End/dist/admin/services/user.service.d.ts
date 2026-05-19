export declare const userService: {
    getAllUsers: (options: {
        q?: string;
        role?: string;
        requesterRole: string;
        page?: number;
        limit?: number;
    }) => Promise<{
        users: {
            id: string;
            email: string;
            username: string;
            role: import(".prisma/client").$Enums.Role;
            status: import(".prisma/client").$Enums.UserStatus;
            createdAt: Date;
        }[];
        total: number;
        page: number;
        limit: number;
    }>;
    createUser: (data: any, requesterRole: string) => Promise<{
        id: string;
        email: string;
        username: string;
        role: import(".prisma/client").$Enums.Role;
        createdAt: Date;
    }>;
    updateUser: (id: string, data: any, requesterRole: string) => Promise<{
        id: string;
        email: string;
        username: string;
        role: import(".prisma/client").$Enums.Role;
        createdAt: Date;
        updatedAt: Date;
    }>;
    deleteUser: (id: string, requesterRole: string) => Promise<void>;
    updateUserStatus: (id: string, status: string, requesterRole: string) => Promise<{
        id: string;
        username: string;
        role: import(".prisma/client").$Enums.Role;
        status: import(".prisma/client").$Enums.UserStatus;
    }>;
};
//# sourceMappingURL=user.service.d.ts.map