import { getEvents } from './events';
import ical from 'ical-generator';
import { Moment } from 'moment';

async function getCalendar() {
	const calendar = ical({
		name: 'RailsConf 2022',
		description:
			'Schedule for RailsConf 2022 in Portland, OR. May 17th - 19th.',
		timezone: 'America/Los_Angeles',
	});

	const events = await getEvents();

	// add events to calendar
	events.forEach((e) => {
		for (let session of e.events) {
			calendar.createEvent(
				format(
					e.start,
					e.end,
					session.title,
					session.labels,
					session.author,
					session.location,
					session.url,
					session.break
				)
			);
		}
	});

	return calendar;

	function format(
		start: Moment,
		end: Moment,
		title: string,
		labels: string[],
		author: string,
		location: string,
		url: string,
		isBreak: boolean
	) {
		const t = title + labels.reduce((acc, label) => acc + ` [${label}]`, '');

		const desLabels = labels ? 'Track: ' + labels.join(', ') + '\n' : '';
		const desAuthors = author ? author + '\n' : ''; // sometimes the `author` html element also contains an event description
		const desUrl = url ? '\n' + url : ''; // not all calendar support the URL field, so we add it to the description
		const des = desLabels + desAuthors + desUrl;

		return {
			start,
			end,
			summary: t,
			description: des,
			location,
			url,
		};
	}
}

export { getCalendar };
