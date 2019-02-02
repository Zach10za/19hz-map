import {
  SET_CENTER,
  SET_FILTERED_EVENTS,
  SET_ZOOM,
  SET_DRAWER,
  FETCH_EVENTS_BEGIN,
  SET_EVENTS,
  FETCH_EVENTS_SUCCESS,
  FETCH_EVENTS_FAILURE
} from "../constants/action-types";
import { getCenter } from "../utils";

export const setCenter = center => ({
  type: SET_CENTER,
  payload: { center }
});

export const setEvents = events => ({
  type: SET_EVENTS,
  payload: { events }
});

export const setFilteredEvents = filteredEvents => ({
  type: SET_FILTERED_EVENTS,
  payload: { filteredEvents }
});

export const setZoom = zoom => ({
  type: SET_ZOOM,
  payload: { zoom }
});

export const setDrawer = drawer => ({
  type: SET_DRAWER,
  payload: { drawer }
});

export const fetchEventsBegin = () => ({
  type: FETCH_EVENTS_BEGIN
});

export const fetchEventsSuccess = (events, zoom, center) => ({
  type: FETCH_EVENTS_SUCCESS,
  payload: {
    events,
    zoom,
    center
  }
});

export const fetchEventsFailure = error => ({
  type: FETCH_EVENTS_FAILURE,
  payload: { error }
});

export const fetchEvents = location => {
  return async dispatch => {
    try {
      dispatch(fetchEventsBegin());
      if (parseInt(location, 10) < 1) location = "";
      const response = await fetch(
        "https://api.19hz-map.info/events/" + location
      );
      const body = await response.json();
      let rawEvents = body.result.filter(e => e.venue);
      let events = rawEvents.map((event, i) => {
        const date_parts = event.event_date.split("-");
        const date = new Date(
          date_parts[0],
          date_parts[1] - 1,
          date_parts[2].substring(0, 2)
        );

        return {
          id: event.id,
          title: event.title,
          date: date,
          time: event.time,
          price: event.price,
          age: event.age,
          link: event.link,
          facebook: event.facebook,
          region: event.region,
          venue: {
            name: event.venue.name,
            address: event.venue.address,
            place_id: event.venue.place_id,
            price: event.venue.price_level,
            rating: event.venue.rating,
            location: {
              lat: parseFloat(event.venue.lat),
              lng: parseFloat(event.venue.lng)
            }
          },
          organizers: event.organizersList
            ? event.organizersList.split(",")
            : [],
          tags: event.tagsList ? event.tagsList.split(",") : []
        };
      });
      const center = getCenter(parseInt(location, 10));
      const zoom = location === "0" ? 5 : 10;
      localStorage.setItem("events", JSON.stringify(events));
      dispatch(fetchEventsSuccess(events, zoom, center));
    } catch (error) {
      console.error(error);
      const evs = localStorage.getItem("events");
      if (evs) {
        dispatch(
          fetchEventsSuccess(evs, 10, getCenter(parseInt(location, 10)))
        );
      } else {
        dispatch(fetchEventsFailure(error));
      }
    }
  };
};
