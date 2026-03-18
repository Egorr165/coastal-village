export interface User {
    id: string
    name: string
    email: string
    phone: string
    city?: string
    photo?: string
    password?: string
}
  
export interface AuthResponse {
    user: User
    token: string
}