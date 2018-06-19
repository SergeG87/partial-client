import BaseService from './baseService';

export interface AuthResponse {
  status: string;
  user_id?: number;
  token?: string;
  error: string;
}

interface AuthParams {
  username: string;
  password: string;
}

export default class AuthService extends BaseService {
  static loginRoute = SERVICES.LOGIN;
  static signupRoute = SERVICES.SIGNUP;

  private static createAuthParams(username: string, password: string): AuthParams {
    return {
      username: username.trim(),
      password: password.trim()
    };
  }

  private static storeAuthToken(token: string): void {
    localStorage.setItem(SERVICES.__JWT_SECRET__, token);
  }

  public static async signup(username: string, password: string): Promise<AuthResponse> {
    try {
      const signupResponse = await this.postFormRequest<AuthResponse>(
        this.signupRoute,
        this.createAuthParams(username, password)
      );

      if (signupResponse.status === 'success') {
        this.storeAuthToken(signupResponse.token);
      }

      return signupResponse;
    } catch (e) {
      console.error(e);

      return {
        status: 'error',
        error: 'An error occured while signing up.'
      };
    }
  }

  public static async login(username: string, password: string): Promise<AuthResponse> {
    try {
      const loginResponse = await this.postFormRequest<AuthResponse>(
        this.loginRoute,
        this.createAuthParams(username, password)
      );

      if (loginResponse.status === 'success') {
        this.storeAuthToken(loginResponse.token);
      }

      return loginResponse;
    } catch (e) {
      console.error(e);

      return {
        status: 'error',
        error: 'An error occured while logging in.'
      };
    }
  }

  public static logout(): boolean {
    localStorage.removeItem(SERVICES.__JWT_SECRET__);

    return true;
  }

  public static isAuthed(): boolean {
    const jwt = localStorage.getItem(SERVICES.__JWT_SECRET__);

    return Boolean(jwt);
  }
}
