import { FORMAT_EVENTS } from '../actions/action-types';

const initialState = {
	events: [],
};

const rootReducer = (state = initialState, action) => {
	switch(action.type) {
		case FORMAT_EVENTS:
      return {
        ...state,
        events: action.events
      };
    default:
      return state;
	}
};

export default rootReducer;