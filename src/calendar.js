const { google } = require('googleapis');
const moment = require('moment');
const { VError } = require('verror');

const api = google.calendar('v3');
const apiScope = 'https://www.googleapis.com/auth/calendar';

const calendar = (calendarId, credentials, owner) => {
  
  const { client_email, private_key } = credentials;
  const auth = new google.auth.JWT(
    client_email,
    null,
    private_key,
    [apiScope],
  );

  const comingEvents = (timeMin = moment().format()) => (
    api.events.list({ auth, calendarId, timeMin })
      .then(({ data: { items } }) => items)
      .catch(err => {
        const msg = 'Failed to list coming events in calendar';
        throw new VError(err, msg);
      })
  );

  const assertTimeIsFree = (unixDateTime) => {
    const event = moment.unix(unixDateTime);
    return comingEvents()
      .then(items => (
        items.map(item => ({
          start: moment(item.start.dateTime),
          end: moment(item.end.dateTime)
        })))
      )
      .then(times => (
        !times.some(({ start, end }) => event.isBetween(start, end, 'm', '[)'))
      ))
      .then(free => { 
        if (!free) {
          throw VError('Time (%s) already taken', event.format());
        }
      });
  };

  const buildEvent = (name, company, email, unixDateTime ) => {
    const dateTime = moment.unix(unixDateTime);
    if (dateTime.isBefore(moment().add(3, 'h'), 'm')) {
      const msg = 'Events should be at least 3 hours in the future';
      throw new VError(msg);
    }
    return {
      start: { dateTime: dateTime.format() },
      end: { dateTime: dateTime.add(1, 'h').format() },
      summary: `${company} Interview`,
      description: `Interview with ${owner.name}`,
      attendees: [
        { email: owner.email, displayName: owner.name },
        { email, displayName: name },
      ],
    }; 
  };

  const register = (event) => {
    const params = {
      auth,
      calendarId,
      sendNotifications: true,
      resource: event,
    };
    return api.events.insert(params)
      .then(() => event)
      .catch(err => {
        const msg = 'Failed to register event in calendar';
        throw new VError(err, msg);
      });
  };

  return { comingEvents, assertTimeIsFree, buildEvent, register };
};

module.exports = calendar;
