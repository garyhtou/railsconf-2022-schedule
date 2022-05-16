import express, { Router, Request, Response } from 'express';
import { ICalCalendar } from 'ical-generator';
import { getCalendar } from './helpers/calendar';
import { getEvents } from './helpers/events';

const router: Router = express.Router();

// Express body-parser
router.use(express.json());
router.use(express.urlencoded({ extended: true }));

// Ping Pong (test endpoint)
router.get('/ping', (req: Request, res: Response) => {
	res.send('pong! 🏓');
});

const REPO_URL = 'https://github.com/garyhtou/railsconf-2022-schedule';
router.get('/', (req: Request, res: Response) => {
	res.redirect(REPO_URL);
});

router.get('/calendar.ics', async (req: Request, res: Response) => {
	const calendar: ICalCalendar = await getCalendar();
	calendar.serve(res, 'RailsConf2022.ics');
});

router.get('/events', async (req: Request, res: Response) => {
	res.json(await getEvents());
});

export default router;
