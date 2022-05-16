import axios from 'axios';
import cheerio from 'cheerio';
import moment, { Moment } from 'moment';

var lastScraped;
var cache;

const SCHEDULE_URL = 'https://railsconf.org/schedule';
const BASE_URL = 'https://railsconf.org';
const DAYS = [
	{ id: 'tuesday', date: moment('2022-05-16') },
	{ id: 'wednesday', date: moment('2022-05-17') },
	{ id: 'thursday', date: moment('2022-05-18') },
];

async function getEvents() {
	// TODO: cache events (expire every 10 minutes)

	const html = await getHtml();
	const $ = cheerio.load(html);

	const events = [];
	for (const day of DAYS) {
		const dayId = day.id;
		const date = day.date;

		const div = $(`#${dayId}`);
		const dayEvents = await parseDay($, date, div);
		events.push(...dayEvents);
	}

	return events;
}

async function parseDay(
	$: cheerio.Root,
	date: Moment,
	dayHtml: cheerio.Cheerio
) {
	let slots = [];
	const elements = dayHtml.children();

	for (let i = 0; i < elements.length; i += 2) {
		try {
			slots.push(await parseSlot($, date, $(elements[i]), $(elements[i + 1])));
		} catch (e) {
			console.log(e);
		}
	}

	return slots;
}

async function parseSlot(
	$: cheerio.Root,
	date: Moment,
	timeslotHtml: cheerio.Cheerio,
	sessionHtml: cheerio.Cheerio
) {
	const validations = [
		timeslotHtml.hasClass('timeslot'),
		sessionHtml.hasClass('session') || sessionHtml.hasClass('session-group'),
	];
	if (!validations.every((v) => v)) {
		throw new Error('Invalid timeslot or session');
	}

	const times = timeslotHtml
		.text()
		.split('-')
		.map((s) => s.trim());
	console.log(times);

	const start = moment(
		`${date.format('YYYY-MM-DD')} ${times[0]} -07:00`,
		'YYYY-MM-DD h:mma Z'
	);
	const end =
		times.length == 2
			? moment(
					`${date.format('YYYY-MM-DD')} ${times[1]} -07:00`,
					'YYYY-MM-DD h:mma Z'
			  )
			: start;

	const events: event[] = [];
	if (sessionHtml.hasClass('session')) {
		events.push(parseSession($, sessionHtml));
	} else {
		// Session group
		// TODO: break group session into their own events. There should only be one session per event
		const sessions = sessionHtml.find('.session');
		for (let sess of sessions) {
			events.push(parseSession($, $(sess)));
		}
	}

	console.log(events);

	return {
		start,
		end,
		events,
	};
}

function parseSession($: cheerio.Root, sessionHtml: cheerio.Cheerio): event {
	const isBreak = sessionHtml.hasClass('break');

	const title = sessionHtml.find('.session-title').text().trim();
	const url =
		BASE_URL + sessionHtml.find('.session-title a').attr('href').toString();
	const author = sessionHtml.find('.session-author').text().trim(); // TODO: handle "RSVP to join!" link
	const location = sessionHtml.find('.session-location').text().trim();
	const labels = sessionHtml
		.find('.session-labels')
		.children()
		.map((i, el) => $(el).text().trim())
		.get();

	return {
		title,
		url,
		author,
		location,
		labels,
		break: isBreak,
	};
}

type event = {
	title: string;
	url?: string;
	author?: string;
	location: string;
	labels: string[];
	break: boolean;
};

async function getHtml() {
	const res = await axios.get(SCHEDULE_URL);
	return await res.data;
}

export { getEvents };
