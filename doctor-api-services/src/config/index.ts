export default {
    port: process.env.PORT || 3001,
    mongodb: {
        uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/doctor-appointments'
    },
    google: {
        calendarId: process.env.GOOGLE_CALENDAR_ID,
        timezone: process.env.TIMEZONE || 'America/Argentina/Buenos_Aires'
    }
};