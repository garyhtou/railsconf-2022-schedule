import { getEvents, PT_TZ } from './events';
import ical, { ICalEvent, ICalEventData } from 'ical-generator';
import { Moment } from 'moment-timezone';

async function getCalendar() {
	const calendar = ical({
		name: 'RailsConf 2022',
		description:
			'Schedule for RailsConf 2022 in Portland, OR. May 17th - 19th.',
		timezone: PT_TZ,
	});

	const events = await getEvents();

	// add events to calendar
	events.forEach((e) => {
		for (let session of e.events) {
			// console.log({ title: session.title, start: e.start.format() });
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
	): ICalEvent | ICalEventData {
		const t = title + labels.reduce((acc, label) => acc + ` [${label}]`, '');

		const desLabels = labels.length ? 'Track: ' + labels.join(', ') + '\n' : '';
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
			timezone: PT_TZ,
		};
	}
}

export { getCalendar };
