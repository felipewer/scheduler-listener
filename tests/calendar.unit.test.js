const moment = require('moment');
const calendar = require('../src/calendar');

describe('calendar', () => {

  test('it should return an auth object', () => {
    const credentials = {
      client_email: 'john@doe.com',
      private_key: `-----BEGIN PRIVATE KEY-----
                    FAKEFAKEFAKEFAKEFAKEFAKEFA=
                    -----END PRIVATE KEY-----\n`
    };
    const auth = calendar.getAuth(credentials);
    expect(auth.email).toBe(credentials.client_email);
    expect(auth.key).toBe(credentials.private_key);
    expect(auth.scopes).toEqual([
      'https://www.googleapis.com/auth/calendar'
    ]);
    expect(auth.authorize).toBeDefined();
  });

  test('It should return an event object', () => {
    const date = moment('2018-08-03T18:00:00-03:00');
    const event = calendar.event(
      { name: 'John Doe', email: 'john@doe.com' },
      'Jane Doe',
      'Doe Inc.',
      'jane@doe.com',
      date
    );
    expect(event.start).toEqual({ dateTime: '2018-08-03T18:00:00-03:00'});
    expect(event.end).toEqual({ dateTime: '2018-08-03T19:00:00-03:00'});
    expect(event.summary).toBe('Doe Inc. Interview');
    expect(event.description).toBe('Interview with John Doe');
    expect(event.attendees).toEqual([
      { email: 'john@doe.com', displayName: 'John Doe' },
      { email: 'jane@doe.com', displayName: 'Jane Doe' }
    ]);
  });

});
