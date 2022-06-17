import { JwtPayload } from 'jsonwebtoken';
export * from './middleware';
export * from './whitelist_middleware';

declare global {
    namespace Express {
        interface Request {
            locals?: {
                [key: string]: any;
                asapClaims?: string | JwtPayload | null
            }
        }
    }
}