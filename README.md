# RailsConf 2022 Schedule 🗓️

Have you wished to have the RailsConf schedule in your own calendar app? Well, now you can! Subscribe to the
[`https://railsconf.garytou.com/calendar.ics`](https://railsconf.garytou.com/calendar.ics) ICS link in your favorite
calendar app such as Google Calendar, Apple Calendar, Outlook, etc.

This `node.js` app (really should be Rails 🙄) web scrapes the RailsConf schedule from their website and formats it as
an iCal (ics) file!

## 📎 How to use

| [`/calendar.ics`](https://railsconf.garytou.com/calendar.ics) | iCal (ics) file of events (for subscription in calendar apps) |
| ------------------------------------------------------------- | ------------------------------------------------------------- |
| [`/events`](https://railsconf.garytou.com/events)             | JSON endpoint of events                                       |

## 🏗️ Development

```sh
git clone https://github.com/garyhtou/railsconf-2022-schedule

# enter the directory
cd railsconf-2022-schedule

# install dependencies
yarn

# run the server
yarn dev

# Open https://localhost:3000 in your browser

# the server will refresh on any saved changes
```
