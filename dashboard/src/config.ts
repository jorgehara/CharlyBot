export default {
  google: {
    calendar: {
      calendarId: process.env.VITE_GOOGLE_CALENDAR_ID || 'dd85c50990779ead504036ff6c94e6c9f1d895528f0900bbf0a9300dc3db37c9@group.calendar.google.com'
    },
    auth: {
      clientEmail: process.env.VITE_GOOGLE_CLIENT_EMAIL,
      privateKey: process.env.VITE_GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }
  }
};
