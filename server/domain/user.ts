export interface CreateUserInput {
  email: string
  username?: string | null
  password: string
}

export interface UpdateUserInput {
  email?: string
  username?: string | null
}

export interface UpdateProfileInput {
  email?: string
  username?: string | null
  currentPassword?: string
  newPassword?: string
}

export interface LoginInput {
  email: string
  password: string
}
