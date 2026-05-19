export declare const permissionService: {
    getRolePermissions: () => Promise<{
        id: string;
        role: import(".prisma/client").$Enums.Role;
        createdAt: Date;
        updatedAt: Date;
        permissions: import("@prisma/client/runtime/client").JsonValue;
    }[]>;
    updateRolePermissions: (role: string, permissions: any) => Promise<{
        id: string;
        role: import(".prisma/client").$Enums.Role;
        createdAt: Date;
        updatedAt: Date;
        permissions: import("@prisma/client/runtime/client").JsonValue;
    }>;
};
//# sourceMappingURL=permission.service.d.ts.map