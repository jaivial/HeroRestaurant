export interface LoginRequest {
  email: string;
  password: string;
  deviceInfo?: string;
}

export interface LoginResponse {
  user: {
    id: string;
    email: string;
    name: string;
    memberFlags: string; // BigInt as string for JSON
  };
  session: {
    id: string;
    expiresAt: string;
  };
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface RegisterResponse {
  user: {
    id: string;
    email: string;
    name: string;
  };
  session: {
    id: string;
    expiresAt: string;
  };
}

export interface MeResponse {
  user: {
    id: string;
    email: string;
    name: string;
    memberFlags: string;
    avatarUrl: string | null;
  };
  session: {
    expiresAt: string;
    createdAt: string;
  };
}

export interface SessionInfo {
  id: string;
  deviceInfo: string | null;
  lastActivity: string;
  createdAt: string;
  current: boolean;
}
