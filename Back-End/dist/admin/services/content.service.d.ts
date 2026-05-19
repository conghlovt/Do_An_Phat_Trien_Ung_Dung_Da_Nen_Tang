export declare const contentService: {
    getAllContent: (options: {
        q?: string;
    }) => Promise<any[]>;
    createContent: (data: any, requesterId?: string) => Promise<any>;
    updateContent: (id: string, data: any) => Promise<any>;
    deleteContent: (id: string) => Promise<void>;
};
//# sourceMappingURL=content.service.d.ts.map