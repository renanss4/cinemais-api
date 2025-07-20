export interface User {
    id: string;
    email: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateUserRequest {
    email: string;
}

export interface UserResponse {
    id: string;
    email: string;
    createdAt: Date;
    updatedAt: Date;
}
