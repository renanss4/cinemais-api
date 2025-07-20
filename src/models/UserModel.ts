export interface User {
    id: string;
    username: string;
    email: string;
    passwordHash: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateUserRequest {
    username: string;
    email: string;
    password: string;
}

export interface UserResponse {
    id: string;
    username: string;
    email: string;
    createdAt: Date;
    updatedAt: Date;
}
