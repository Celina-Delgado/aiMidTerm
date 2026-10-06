declare const Deno: {
  env: {
    get(name: string): string | undefined;
  };
  serve: (handler: any) => void;
};

declare module "npm:hono" {
  export class Hono {
    use(...args: any[]): this;
    get(path: string, handler: (c: any) => any): this;
    fetch: any;
  }
}

declare module "npm:hono/cors" {
  export function cors(options: any): any;
}

declare module "npm:hono/logger" {
  export function logger(...args: any[]): any;
}

declare module "jsr:@supabase/supabase-js@2.49.8" {
  export function createClient(url: string | undefined, key: string | undefined): any;
}
