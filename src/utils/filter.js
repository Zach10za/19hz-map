
import Fuse from 'fuse-js-latest';

export default (filters, events) => {
  try {

    events = filterDateRange(filters.date_range, events);
    events = filterDays(filters.day_of_week, events);
    events = filterSearch(filters.search, events);


    // events.sort((a, b) => {
    //   a = new Date(a.date);
    //   b = new Date(b.date);
    //   return a > b ? -1 : a < b ? 1 : 0;
    // });

    return events;

  } catch(err) {
    console.error("FILTER ERROR: ", err);
  }
}



const filterSearch = (search, events) => {
  if (search.length < 2) return events;
  const options = {
    shouldSort: true,
    threshold: 0.4,
    location: 0,
    distance: 50,
    maxPatternLength: 32,
    minMatchCharLength: 2,
    keys: [
      "title",
      "venue.name",
      "tags",
      "organizers",
      "age",
      "price",
    ]
  };
  const fuse = new Fuse(events, options);
  const result = fuse.search(search);
  return result;
}

const filterDays = (days, events) => {
  return events.filter(event => days.indexOf(new Date(event.date).getDay()) > -1);
}

const filterDateRange = (range, events) => {

  const min_split = range.min.split('-');
  const max_split = range.max.split('-');

  const min_date = range.min ? new Date(parseInt(min_split[0], 10), parseInt(min_split[1], 10)-1, parseInt(min_split[2], 10)) : new Date(Date.now());
  const max_date = range.max ? new Date(parseInt(max_split[0], 10), parseInt(max_split[1], 10)-1, parseInt(max_split[2], 10)) : null;
  return events.filter(event => new Date(event.date) >= min_date && (new Date(event.date) <= max_date || !max_date));
}