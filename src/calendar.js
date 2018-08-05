const { google } = require('googleapis');
const { VError } = require('verror');

const api = google.calendar('v3');
const apiScope = 'https://www.googleapis.com/auth/calendar';

const getAuth = ({ client_email, private_key}) => (
  new google.auth.JWT(
    client_email,
    null,
    private_key,
    [apiScope],
  )
);

const event = (owner, name, company, email, dateTime) => ({
  start: { dateTime: dateTime.format() },
  end: { dateTime: dateTime.add(1, 'h').format() },
  summary: `${company} Interview`,
  description: `Interview with ${owner.name}`,
  attendees: [
    { email: owner.email, displayName: owner.name },
    { email, displayName: name },
  ],
});

const register = (calendarId, auth, event) => (
  auth.authorize()
    .then(() => api.events.insert({
      auth,
      calendarId,
      sendNotifications: true,
      resource: event,
    }))
    .catch(err => {
      const msg = 'Failed to register event in calendar';
      throw new VError(err, msg);
    })
);

module.exports = {
  getAuth,
  event,
  register
};