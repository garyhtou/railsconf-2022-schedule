import { getEvents } from './events';
import ical from 'ical-generator';

const calendar = ical({
	name: 'RailsConf 2022',
	description: 'Schedule for RailsConf 2022 in Portland, OR. May 16th - 19th.',
	timezone: 'America/Los_Angeles',
});

async function getCalendar() {
	const events = await getEvents();

	// TODO: add events to calendar

	return calendar;
}

export { getCalendar };
