import { getEvents } from './events';
import ical from 'ical-generator';

const calendar = ical({
	name: 'RailsConf 2022',
	description: 'Schedule for RailsConf 2022 in Portland, OR. May 16th - 19th.',
	timezone: 'America/Los_Angeles',
});

async function getCalendar() {
	const events = await getEvents();

	// add events to calendar
	events.forEach((e) => {
		calendar.createEvent({
			start: e.start,
			end: e.end,
			summary: e.events[0].title,
			description: e.events[0].author,
			location: e.events[0].location,
		});
	});

	return calendar;
}

export { getCalendar };
