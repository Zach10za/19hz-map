export default async (region = 2) => {
  try {
    if (parseInt(region, 10) < 1) region = '';
    const response = await fetch('https://api.19hz-map.info/events/'+region);
    const body = await response.json();
    
    let events = body.result.map((event, i) => {
      const date_parts = event.event_date.split('-');
      const date = new Date(date_parts[0], date_parts[1] - 1, date_parts[2].substring(0,2));

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
          name: event.venue.name ,
          address: event.venue.address,
          place_id: event.venue.place_id,
          price: event.venue.price_level,
          rating: event.venue.rating,
          location: {
            lat: parseFloat(event.venue.lat),
            lng: parseFloat(event.venue.lng),
          }
        },
        organizers: event.organizersList ? event.organizersList.split(',') : [],
        tags: event.tagsList ? event.tagsList.split(',') : [],
      };

    });
    
    return events;
  } catch(err) {
    console.error('FETCH_EVENTS_ERR:', err);
  }
};