const moment = require('moment-timezone');

const credentials = {
  client_email: 'john@doe.com',
  private_key: `-----BEGIN PRIVATE KEY-----
                FAKEFAKEFAKEFAKEFAKEFAKEFA=
                -----END PRIVATE KEY-----\n`
};
const owner = { name: 'John Doe', email: 'john@doe.com' };
const timeLimits = { minHour: 7, maxHour: 21, timezone: 'America/Sao_Paulo' };
const calendar = require('../src/calendar')('123', credentials, owner, timeLimits);

describe('calendar', () => {

  describe('Event time validation', () => {
    
    beforeAll(() => {
      this.commonArgs = [ 'Jane Doe', 'Doe Inc.', 'jane@doe.com' ];
      this.errorMsg = 'Events should be at least 3 hours in the future and within limits';
    });

    test('Event must not be less than 3 hours in the future', () => {
      const currentTime = moment('2018-08-14T07:00:00-03:00');
      const in2Hours = currentTime.clone().add(2, 'h').unix();
      try {
        calendar.buildEvent(...this.commonArgs, in2Hours, currentTime);
      } catch(e) {
        expect(e.message).toBe(this.errorMsg);
      }
    });

    test('Event must not be before minimum time', () => {
      const currentTime = moment('2018-08-14T00:00:00-03:00');
      const in5Hours = currentTime.clone().add(5, 'h').unix();
      try {
        calendar.buildEvent(...this.commonArgs, in5Hours, currentTime);
      } catch(e) {
        expect(e.message).toBe(this.errorMsg);
      }
    });

    test('Event must not be after maximum time', () => {
      const currentTime = moment('2018-08-14T20:00:00-03:00');
      const in3Hours = currentTime.clone().add(3, 'h').unix();
      try {
        calendar.buildEvent(...this.commonArgs, in3Hours, currentTime);
      } catch(e) {
        expect(e.message).toBe(this.errorMsg);
      }
    });
  });

  describe('Event text fields validation', () => {

    beforeAll(() => {
      this.currentTime = moment('2018-08-14T07:00:00-03:00');
      this.in4Hours = this.currentTime.clone().add(4, 'h').unix();
    });

    test('Event must not contain empty name', () => {
      try {
        calendar.buildEvent(
          '',
          'Doe Inc.',
          'jane@doe.com',
          this.in4Hours,
          this.currentTime
        );
      } catch(e) {
        expect(e.message).toBe('Event name must not be empty');
      }
    });

    test('Event must not contain empty company', () => {
      try {
        calendar.buildEvent(
          'Jane Doe',
          '',
          'jane@doe.com',
          this.in4Hours,
          this.currentTime
        );
      } catch(e) {
        expect(e.message).toBe('Event company must not be empty');
      }
    });
  
    test('Event must contain valid email address', () => {
      try {
        calendar.buildEvent(
          'Jane Dow',
          'Doe Inc.',
          '',
          this.in4Hours,
          this.currentTime
        );
      } catch(e) {
        expect(e.message).toBe('Invalid email address');
      }
    });
  });

  test('It should return a calendar event object', () => {
    const now = moment('2018-08-14T07:00:00-03:00');
    const in4Hours = now.clone().add(4, 'h');
    const in5Hours = in4Hours.clone().add(1, 'h');
    const date = in4Hours.clone().unix();
    const roomUrl = 'https://appear.in/hbjleeyr0fwfq2evbh2my27iln8q8pzqhc0rp4wxz3u=';
    const event = calendar.buildEvent(
      'Jane Doe',
      'Doe Inc.',
      'jane@doe.com',
      date,
      now
    );
    expect(event).toEqual({
      start: { dateTime: in4Hours.format()},
      end: { dateTime: in5Hours.format()},
      summary: 'Doe Inc. Interview',
      description: `Interview with John Doe\nConference room: ${roomUrl}`,
      attendees: [
        { email: 'john@doe.com', displayName: 'John Doe' },
        { email: 'jane@doe.com', displayName: 'Jane Doe' }
      ]
    });
  });

});
