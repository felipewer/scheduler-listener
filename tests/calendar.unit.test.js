const moment = require('moment');

const credentials = {
  client_email: 'john@doe.com',
  private_key: `-----BEGIN PRIVATE KEY-----
                FAKEFAKEFAKEFAKEFAKEFAKEFA=
                -----END PRIVATE KEY-----\n`
};
const owner = { name: 'John Doe', email: 'john@doe.com' }
const calendar = require('../src/calendar')('123', credentials, owner);

describe('calendar', () => {

  test('It should return an event object', () => {
    const inFourHours = moment().add(4, 'h');
    const inFiveHours = inFourHours.clone().add(1, 'h');
    const date = inFourHours.clone().unix();
    const event = calendar.buildEvent(
      'Jane Doe',
      'Doe Inc.',
      'jane@doe.com',
      date
    );
    expect(event).toEqual({
      start: { dateTime: inFourHours.format()},
      end: { dateTime: inFiveHours.format()},
      summary: 'Doe Inc. Interview',
      description: 'Interview with John Doe',
      attendees: [
        { email: 'john@doe.com', displayName: 'John Doe' },
        { email: 'jane@doe.com', displayName: 'Jane Doe' }
      ]
    });
  });

  test('It should fail to build event with current time', () => {
    const date = moment().unix();
    try {
      calendar.buildEvent(
        'Jane Doe',
        'Doe Inc.',
        'jane@doe.com',
        date
      );
      throw new Error('buildEvent should have thrown');
    } catch (err) {
      expect(err.message).toBe('Events should be at least 3 hours in the future');
    }
  });

});
