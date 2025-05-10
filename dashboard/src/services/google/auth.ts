import { google } from 'googleapis';
import { JWT } from 'google-auth-library';
import { calendar_v3, sheets_v4 } from 'googleapis';

/**
 * Autentica con Google usando credenciales de cuenta de servicio
 * @returns Cliente autenticado de Google
 */
export function authenticate(): JWT {
  try {
    const credentials = {
      client_email: "charlybot-service@charlybot1.iam.gserviceaccount.com",
      private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvwIBADANBgkqhkiG9w0BAQEFAASCBKkwggSlAgEAAoIBAQC6nngNAgqSdrCb\njrLpITqNGTumA7eUJiLwjEwx3A9pUn2HmjjFdwGlCL6AyMzH4St2bLprIwv6t0VN\nQKipeyyM/Y+B5ldA0lDTpZkWCWZlknTlDumSExWhOP83/4iQ0MJ9nIfH8KiTP/IM\nwTMDBvVrfSjMb11aC6te/g9BnIx7zJmZtqnhLAEywEYCuu/x3cfZ71FliZ4qY22l\n9scXrEOVyd6jZEpt7haiRQWumIlzuzScNAWDC30jWsn235UzAxnLUh+ml3JSCEcK\nibp643kcTHc7mubC0bQpVcp842/b/Oj2e82BigQIdryi4LWilVL0XDncuJyEFaCu\n1h6ROO7LAgMBAAECggEAWJ6fMMIq5hFx3XT+teF/LfjxD+2M9E/F4Mgm+LhhIyk2\njjnowrC4Obg0yvBP+o0NeB+6yNysOCNmyAAv98eTyOIyD0QkZBZbpp3pXAMbupk5\nZHrX5POmHlj0LZHttqND8KVv/zzjuIUxuufWAxZ/XctiH+60fGm1OBdahFREjBa0\nW5aKVyZ+rIvcZhRCBz/D1jv0dFBsXYI9NN/+P3Hsyx7JxZM18lFXmdwnThyUgOKi\nmavSeEdx1lr3Atpyrcg57+7SaEt0MoghRE/bSWTKlLnTDG0PjPq98MhlGNOb/7d5\nZiVzrn67f5hRwuFZiorWjRIvY7lNaCZXuzqCIzfzUQKBgQD09Bd1kEvzzTmT2LYI\ndoJUgMC+FhaLUxTHfHuc6B5X1IhENk9wAMw1byPuGqFrANLWh+eHxjreHPESXtLQ\n25USS9LgE5aQw9Am9mmVGePUlDUlJ9Ji4BlFssqQOePSLbzV9OJMzcAbK1aLdPyt\nG3oizZI7i2e6RjXx00fCmVR+uwKBgQDDCOzFNlX/8FUhtwy0ng8//H/JlhPTRsuK\nPRCuM9jKWGjDXf3HlKi/MlVYZTLFjG1awfV8RtH+c0uzxTsFP+aObuMR7Zyur+nk\nIiZLQ9ZgyJg80uSYHu5aOSS/RHHN3WexZtgjw2TQdYwz1aW2A/E7Q+5igkltDHve\nJKlAJY+3MQKBgQCpkqT+3PLHh2X5pMd3mlrlFvDXZsEamFxFMTb9y27eDKJ83kAl\n4Fd+Ej+EYOkoAzzyCMlOo/syskRtHDnDHo/XR6hnOQg9lWDu6Bz1fCPNkQAthaDO\nlCbKqlgyefDuGn2kfE+BLdp0tI7IIiedyuzFVRyLnhkjyeEkVMhTvgPRawKBgQCQ\ngZZc8Mt7nOiW2Hfzg4EtGbrc8/OwgS3iOSiYyhWAp0zIJGYacE0vjO2rVx/tOwTz\nT+7Bq/9/lpGqmyIF27jKI+Ler719uR2FSMAy2AqJH1edCW0SQSi9dMWDagUgUUG5\nMchHh0i1I8NDzLLBT9522PhRyNL6l1tX1rYIr0vyoQKBgQCfbiKYjNxZoztwGIro\nFI8YWcarl8FfIXpXWHklfxUig9g7DFIXwNTpaSgYNs/RQDWhRGhIEn0XKnJ+BdFn\n4Zfyl6LY776jX8GSA9dR9PVNfJuvULXnLuKGpbFGjFonifCLiX38bDomrGW4BvkE\nCwG+eP/JMQl9lflxiTh+pX1wzg==\n-----END PRIVATE KEY-----\n",
    };

    // Crear cliente JWT con los scopes necesarios
    const client = new JWT({
      email: credentials.client_email,
      key: credentials.private_key,
      scopes: [
        'https://www.googleapis.com/auth/calendar',
        'https://www.googleapis.com/auth/calendar.events',
        'https://www.googleapis.com/auth/spreadsheets'
      ],
    });

    console.log('Cliente de autenticación creado correctamente');
    return client;
  } catch (error) {
    console.error('Error al autenticar con Google:', error);
    throw new Error('No se pudo autenticar con Google. Verifica tus credenciales.');
  }
}

export type { calendar_v3, sheets_v4 };