export interface User {
    id: string
    name: string
    email: string
    phone: string
    is_staff?: boolean
    city?: string
    photo?: string
    password?: string
}
  
export interface AuthResponse {
    user: User
    token: string
}