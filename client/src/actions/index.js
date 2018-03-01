import { FORMAT_EVENTS } from './action-types';

export const formatEvents = (events) => {
	return {
		type: FORMAT_EVENTS,
		events,
	};
}
