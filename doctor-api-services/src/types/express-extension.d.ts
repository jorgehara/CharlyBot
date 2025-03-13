import { RequestHandler } from 'express';

declare module 'express' {
  interface Router {
    get(path: string, handler: RequestHandler): Router;
    post(path: string, handler: RequestHandler): Router;
    put(path: string, handler: RequestHandler): Router;
    delete(path: string, handler: RequestHandler): Router;
  }
} 