export interface ApiResponse<T> {
    data: T;
    message?: string;
    statusCode?: number;
}
export interface PaginatedData<T> {
    items: T[];
    total?: number;
    page?: number;
    limit?: number;
}