declare global {
    namespace NodeJS {
        interface ProcessEnv {
            CALENDAR_ID: string;
            SPREADSHEET_ID: string;
            SHEET_RANGE: string;
            TIMEZONE: string;
            GOOGLE_APPLICATION_CREDENTIALS: string;
        }
    }
}

export {};