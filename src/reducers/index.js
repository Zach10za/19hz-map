import {
  SET_CENTER,
  SET_CLUSTERS,
  SET_FILTERED_EVENTS,
  SET_EVENTS,
  SET_ZOOM,
  SET_DRAWER,
  FETCH_EVENTS_BEGIN,
  FETCH_EVENTS_SUCCESS,
  FETCH_EVENTS_FAILURE
} from '../constants/action-types';

const initialState = {
  events: [],
  filteredEvents: [],
  drawer: [],
  zoom: 10,
  center: { lat: 34.0522, lng: -118.2437 },
  locationPicker: true,
  loading: false,
  error: null,
};

const rootReducer = (state = initialState, action) => {
  switch(action.type) {
    case SET_ZOOM:
      return {
        ...state,
        zoom: action.payload.zoom
      }
    case SET_CENTER:
      return {
        ...state,
        center: action.payload.center
      }
    case SET_CLUSTERS:
      return {
        ...state,
        clusters: action.payload.clusters
      }
    case SET_DRAWER:
      return {
        ...state,
        drawer: action.payload.drawer
      }
    case SET_EVENTS:
      return {
        ...state,
        events: action.payload.events
      }
    case SET_FILTERED_EVENTS:
      return {
        ...state,
        filteredEvents: action.payload.filteredEvents
      }
    case FETCH_EVENTS_BEGIN:
      return {
        ...state,
        loading: true,
        error: null
      }
    case FETCH_EVENTS_SUCCESS:
      return {
        ...state,
        events: action.payload.events,
        filteredEvents: action.payload.events,
        zoom: action.payload.zoom,
        center: action.payload.center,
        locationPicker: false,
        loading: false,
        error: null
      }
    case FETCH_EVENTS_FAILURE:
      return {
        ...state,
        events: [],
        filteredEvents: [],
        loading: false,
        error: action.payload.error
      }
    default:
      return state;
  }
};

export default rootReducer;  