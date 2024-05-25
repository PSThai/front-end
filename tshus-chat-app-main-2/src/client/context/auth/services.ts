import { GenderEnum } from '@/common/enum/user/gender.enum';
import { User } from '@/common/interface/User';
import { Response } from '@/common/types/response/response.type';
import { setCookie } from '@/common/utils/cookie';
import { fetcher } from '@/common/utils/fetcher';

type TokenType = {
  accessToken: string;
  expiration: string;
};

export type AuthDto = {
  token: TokenType;
  user: User;
};

type LoginType = {
  email: string;
  password: string;
};

type RegisterType = {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  confirm: string;
  gender: GenderEnum;
  avatar?: string;
};

class AuthServices {
  // LOGIN
  async login(payload: LoginType): Promise<AuthDto | any> {
    // Response
    const res: Response = await fetcher({
      method: 'POST',
      url: '/auth/login',
      payload: payload,
    });

    if (res?.status === 200) {
      // Token
      const token: TokenType = res?.data?.token;

      // Save token
      setCookie('token', token.accessToken, token.expiration);

      // Save user
      setCookie('user', res?.data?.user, token.expiration);

      // Return data
      return Promise.resolve(res?.data);
    }

    // Return error
    return Promise.resolve(false);
  }

  // LOGIN
  async register(payload: RegisterType): Promise<boolean> {
    // Response
    const res: Response = await fetcher({
      method: 'POST',
      url: '/auth/register',
      payload: payload,
    });

    if (res?.status === 200) {
      // Return data
      return Promise.resolve(res?.status === 200);
    }

    // Return error
    return Promise.reject(res?.message);
  }
}

// eslint-disable-next-line import/no-anonymous-default-export
export default new AuthServices();
