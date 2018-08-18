const crypto = require('crypto');
const { google } = require('googleapis');
const moment = require('moment-timezone');
const validator = require('validator');
const { VError } = require('verror');

const api = google.calendar('v3');
const apiScope = 'https://www.googleapis.com/auth/calendar';

const calendar = (calendarId, credentials, owner, timeLimits) => {
  
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
        throw VError(err, msg);
      })
  );

  const assertTimeIsFree = (unixDateTime, events) => {
    const event = moment.unix(unixDateTime);
    const times = events.map(item => ({
      start: moment(item.start.dateTime),
      end: moment(item.end.dateTime)
    }));
    const isTaken = ({ start, end }) => event.isBetween(start, end, 'm', '[)');
    if (times.some(isTaken)) {
      throw VError('Time (%s) already taken', event.format());
    }
  };
  
  const validate = (name, company, email, dateTime, currentTime) => {
    if (!name || validator.isEmpty(name)) {
      const msg = 'Event name must not be empty';
      throw VError(msg);
    }
    if (!company || validator.isEmpty(company)) {
      const msg = 'Event company must not be empty';
      throw VError(msg);
    }
    if (!email || !validator.isEmail(email)) {
      const msg = 'Invalid email address';
      throw VError(msg);
    }
    const { minHour, maxHour, timezone } = timeLimits;
    const minTime = dateTime.clone().tz(timezone).hours(minHour).startOf('hour');
    const maxTime = dateTime.clone().tz(timezone).hours(maxHour).startOf('hour');

    const isTooSoon = dateTime.isBefore(currentTime.clone().add(3, 'h'), 'm');
    const inRange = dateTime.isSameOrAfter(minTime) && dateTime.isBefore(maxTime);
    const isWeekday = dateTime.day() !== 0 && dateTime.day() !== 6;
    if (isTooSoon || !inRange || !isWeekday) {
      const msg = 'Events should be at least 3 hours in the future and within limits';
      throw VError(msg);
    }
  };

  const eventHash = (name, company, email, dateTime) => {
    const hash = crypto.createHash('sha256');
    hash.update(name);
    hash.update(company);
    hash.update(email);
    hash.update(dateTime.format());
    return hash.digest('base64');
  };

  const buildEvent = (name, company, email, unixDateTime, currentTime = moment()) => {
    const dateTime = moment.unix(unixDateTime || 0); 
    validate(name, company, email, dateTime, currentTime);
    const roomId = eventHash(name, company, email, dateTime);
    // Converting to lowercase because appear.in does it anyway.
    // This way the user always sees a consistent url.
    const roomUrl = `https://appear.in/${roomId.toLowerCase()}`;
    return {
      start: { dateTime: dateTime.format() },
      end: { dateTime: dateTime.add(1, 'h').format() },
      summary: `${company} Interview`,
      description: `Interview with ${owner.name}\nConference room: ${roomUrl}`,
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
        throw VError(err, msg);
      });
  };

  return { comingEvents, assertTimeIsFree, buildEvent, register };
};

module.exports = calendar;
