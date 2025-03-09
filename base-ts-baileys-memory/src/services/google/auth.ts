import { google } from 'googleapis';
import { join } from 'path';

const CREDENTIALS_PATH = join(process.cwd(), 'credentials.json');

export const getGoogleClient = async () => {
    const auth = new google.auth.GoogleAuth({
        keyFile: CREDENTIALS_PATH,
        scopes: [
            'https://www.googleapis.com/auth/spreadsheets',
            'https://www.googleapis.com/auth/calendar'
        ],
    });

    return auth.getClient();
};