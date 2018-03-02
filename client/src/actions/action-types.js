
export const IS_LOADING = 'IS_LOADING';
export const UPDATE_LOADING_MESSAGE = 'UPDATE_LOADING_MESSAGE';

export const FETCH_CACHED_EVENTS = 'FETCH_CACHED_EVENTS';
export const FETCH_DB_EVENTS = 'FETCH_DB_EVENTS';

export const DEDUPE_EVENTS = 'DEDUPE_EVENTS';

export const SET_EVENTS = 'SET_EVENTS';
export const SET_ALL_EVENTS = 'SET_ALL_EVENTS';

export const FILTER_BY_DATERANGE = 'FILTER_BY_DATERANGE';
export const FILTER_BY_DAYS = 'FILTER_BY_DAYS';
export const FILTER_BY_RADIUS = 'FILTER_BY_RADIUS';


/*

//Component Will Mount
FETCH_CACHED_EVENTS
	Store allEvents in state but check if event date >= current date

//Component Did Mount
FETCH_DB_EVENTS
	Format all events (that have lat/lng)

DEDUPE_EVENTS
	Dedupe cached allEvents with fetched allEvents by combining (count new events)
	Fetch Tags/Organizers of new events


//Filter
FILTER_BY_DATERANGE
	(accept events or get allEvents from state)

FILTER_BY_DAYS
	(accept events or get allEvents from state)

FILTER_BY_RADIUS
	(accept events or get allEvents from state)


//Map


allEvents: [],
currentEvents: [],
modalEvents: [],
settings: {
	dateRange: {
	  min: '',
	  max: '',
	},
	days: [0,1,2,3,4,5,6],
	radius: 50,
},
showSettings: false,
loadingMessage: {
  message: 'loading',
  eventsLoaded: 0,
  eventsToLoad: 0,
},
isLoading: true,
loadingTimeout: 10

*/