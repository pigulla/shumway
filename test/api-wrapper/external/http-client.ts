export interface HttpClient {
    request<T = unknown>(url: string, params?: Record<string, string>): Promise<T>
}
