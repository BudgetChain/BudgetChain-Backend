declare module 'passport-jwt' {
  import { Strategy as PassportStrategy } from 'passport-strategy';

  export interface StrategyOptions {
    secretOrKey?: string;
    jwtFromRequest: (req: any) => string | null;
    issuer?: string;
    audience?: string;
    algorithms?: string[];
    ignoreExpiration?: boolean;
    passReqToCallback?: boolean;
    jsonWebTokenOptions?: any;
  }

  export class Strategy extends PassportStrategy {
    constructor(options: StrategyOptions, verify: (...args: any[]) => any);
    authenticate(req: any, options?: any): any;
  }

  export namespace ExtractJwt {
    export function fromAuthHeaderAsBearerToken(): (req: any) => string | null;
    export function fromAuthHeaderWithScheme(
      scheme: string,
    ): (req: any) => string | null;
    export function fromHeader(
      header_name: string,
    ): (req: any) => string | null;
    export function fromBodyField(
      field_name: string,
    ): (req: any) => string | null;
    export function fromUrlQueryParameter(
      param_name: string,
    ): (req: any) => string | null;
    export function fromExtractors(
      extractors: Array<(req: any) => string | null>,
    ): (req: any) => string | null;
  }
}
