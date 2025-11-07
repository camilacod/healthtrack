export interface CreateUserInput {
  email: string
  username?: string | null
  password: string
}

export interface UpdateUserInput {
  email?: string
  username?: string | null
}

export interface LoginInput {
  email: string
  password: string
}
