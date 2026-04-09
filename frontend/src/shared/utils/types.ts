export interface LoginResponse {
  data: {
    token: string;
    user: User;
    message: string;
    requiresPasswordChange: boolean;
  };
  message: string;
  statusCode: number;
}

export interface ChangePasswordPayload {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ChangePasswordResponse {
  data: {
    message: string;
    token: string;
  };
  message: string;
  statusCode: number;
}

export interface User {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  signature: null;
  roleId: string;
  companyId: null;
  department: null;
  status: string;
  isVerifyEmail: boolean;
  newLogin: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: null;
  role: Role;
  company: null;
}

export interface Role {
  roleId: string;
  roleName: string;
  permissions: any[];
  level: number;
}

export interface LoginPayload {
  email: string;
  password: string;
}
