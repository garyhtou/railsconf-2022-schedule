import axios from 'axios';
import cheerio from 'cheerio';
import moment, { Moment } from 'moment-timezone';

var lastScraped = 0;
var cache: timeslot[] = null;

const SCHEDULE_URL = 'https://railsconf.org/schedule';
const BASE_URL = 'https://railsconf.org/';
export const PT_TZ = 'America/Los_Angeles';
const DAYS = [
	{ id: 'tuesday', date: moment.tz('2022-05-17', PT_TZ) },
	{ id: 'wednesday', date: moment.tz('2022-05-18', PT_TZ) },
	{ id: 'thursday', date: moment.tz('2022-05-19', PT_TZ) },
];

export async function getEvents(force: boolean = false) {
	if (!force && cache && lastScraped > moment().subtract(4, 'minutes').unix()) {
		console.log('Using cached events');
		return cache;
	}
	console.log('Scrapping events');

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

	if (events.length == 0) {
		// fail safe
		return cache;
	}

	// Assume successful scrape. Update cache.
	cache = events;
	lastScraped = moment().unix();

	return events;
}

function parseDay($: cheerio.Root, date: Moment, dayHtml: cheerio.Cheerio) {
	let slots = [];
	const elements = dayHtml.children();

	for (let i = 0; i < elements.length; i += 2) {
		try {
			const slot = parseSlot($, date, $(elements[i]), $(elements[i + 1]));
			if (slot) slots.push(slot);
		} catch (e) {
			console.log(e);
		}
	}

	return slots;
}

function parseSlot(
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

	const start = moment.tz(
		`${date.format('YYYY-MM-DD')} ${times[0]}`,
		'YYYY-MM-DD h:mma',
		PT_TZ
	);
	const end =
		times.length == 2
			? moment.tz(
					`${date.format('YYYY-MM-DD')} ${times[1]}`,
					'YYYY-MM-DD h:mma',
					PT_TZ
			  )
			: start;

	const events: event[] = [];
	if (sessionHtml.hasClass('session')) {
		const sess = parseSession($, sessionHtml);
		if (sess.title !== 'Registration' && sess) events.push(sess);
	} else {
		// Session group
		const sessions = sessionHtml.find('.session');
		for (let sess of sessions) {
			const parsedSess = parseSession($, $(sess));
			if (parsedSess) events.push(parsedSess);
		}
	}

	if (!events.length) return null;

	return {
		start,
		end,
		events,
	};
}

function parseSession($: cheerio.Root, sessionHtml: cheerio.Cheerio): event {
	const isBreak = sessionHtml.hasClass('break');

	const title = sessionHtml.find('.session-title').text().trim();
	const relUrl =
		sessionHtml.find('.session-title a').attr('href')?.toString()?.trim() ||
		undefined;
	const absUrl = relUrl ? BASE_URL + relUrl : undefined;
	const author = sessionHtml.find('.session-author').text().trim();
	const location = sessionHtml.find('.session-location').text().trim();
	const labels = sessionHtml
		.find('.session-labels')
		.children()
		.map((i, el) => $(el).text().trim())
		.get();

	if (!title) return null;

	return {
		title,
		url: absUrl,
		author,
		location,
		labels,
		break: isBreak,
	};
}

export type event = {
	title: string;
	url?: string;
	author?: string;
	location: string;
	labels: string[];
	break: boolean;
};

export type timeslot = {
	start: Moment;
	end: Moment;
	events: event[];
};

async function getHtml() {
	const res = await axios.get(SCHEDULE_URL);
	return await res.data;
}
