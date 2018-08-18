# Scheduler Listener

NodeJS + Web3 process that listens for events on the [Scheduler](https://github.com/felipewer/scheduler) smart contract and registers the corresponding events on Goggle Calendar.

Only valid events are registered on the calendar. The rules are:

- Name, Company and well formed email address are required.
- The event must be at least 3 hours in the future.
- The event must be within the daily minimum and maximum hour range.
- The event must be on a weekday.

## Setup

1 - Clone the repository

```
git clone https://github.com/felipewer/scheduler-listener.git
```

2 - Create a [Google Service Account](https://developers.google.com/identity/protocols/OAuth2ServiceAccount) and download the respective private key file (JSON) into the project folder. Make sure it is named `credentials.json`. It is needed to authorize requests to the calendar API.

3 - Copy `.env.sample` to `.env` and fill the environment variables accordingly.

4 - Start listening for events

```
docker-compose up -d