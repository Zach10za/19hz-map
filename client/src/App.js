import React, { Component } from 'react';
// import Event from './components/Event.js';
import Map from './components/Map.js';

class App extends Component {

  constructor() {
    super();
    this.state = {
      all_events: [],
      events: [],
      filter: {
        days: [0,1,2,3,4,5,6],
        radius: 50,
      },
      showEvents: false,
      showFilters: false,
      pageCover: false,
      error: {
        isError: false,
        message: '',
      },
      loadingMessages: [],
      shouldUpdate: true,
    };
    this.handleEventClick = this.handleEventClick.bind(this);
    this.filter = this.filter.bind(this);
    this.filterDays = this.filterDays.bind(this);
    this.filterRadius = this.filterRadius.bind(this);
    this.changeDayFilter = this.changeDayFilter.bind(this);
  }

  componentDidMount() {
    this.setState({ pageCover: true });
    this.getEvents()
      .then(res => {
        let events = [];
        for (let i=0; i < res.result.length; i++) {
          let event = res.result[i];
          if (event.venue.lat && event.venue.lng) {
            let ev = {
              id: event.id,
              title: event.title,
              date: event.event_date,
              time: event.time,
              price: event.price,
              age: event.age,
              venue: {
                name: event.venue.name,
                address: event.venue.address,
                place_id: event.venue.place_id,
                image: event.venue.image,
                location: {
                  lat: event.venue.lat,
                  lng: event.venue.lng,
                }
              },
              organizers: [],
              tags: []
            };

            this.getOrganizers(ev.id)
              .then(res => ev.organizers = res.result )
              .catch(err => console.log(err));

            this.getTags(ev.id)
              .then(res => ev.tags= res.result )
              .catch(err => console.log(err));

            events.push(ev);
          }
        }
        this.setState({ all_events: events, events: events }, this.filter)
      })
      .then(() => this.setState({ pageCover: false }))
      .catch(err => this.setState({error: {isError: true, message: err}}));
  }

  getEvents = async () => {
    let t0 = performance.now();
    const response = await fetch('/api/events/');
    const body = await response.json();
    let t1 = performance.now();
    console.log(body.result.length + ' events found in ' + ((t1 - t0) / 1000) + ' seconds');
    return body;
  };

  getTags = async (id) => {
    const response = await fetch(`/api/events/${id}/tags`);
    const body = await response.json();
    return body;
  };

  getOrganizers = async (id) => {
    const response = await fetch(`/api/events/${id}/organizers`);
    const body = await response.json();
    return body;
  };

  scrapeEvents = async () => {
    const response = await fetch(`/api/scrape`);
    const body = await response.json();
    return body;
  };


  handleEventClick(marker) {
    this.refs.map.showMarker(marker);
  }

  changeDayFilter(day_of_week) {
    let days_filter = this.state.filter.days;
    let value = parseInt(day_of_week, 10);

    if (days_filter.indexOf(value) > -1) {
      days_filter.splice(days_filter.indexOf(value), 1);
    } else {
      days_filter.push(value);
    }
    this.setState({ filter: {days: days_filter, radius: this.state.filter.radius}, shouldUpdate: false }, this.filter);
  }

  filter() {
    let events = this.filterDays();
    events = this.filterRadius(events);
    this.refs.map.setMarkers(events);
    this.setState({ events, shouldUpdate: true });
  }

  filterDays(all_events = null) {
    let days_filter = this.state.filter.days;
    all_events = all_events || this.state.all_events;
    let events = [];

    for (let i=0; i < all_events.length; i++) {
      let date_parts = all_events[i].date.split('-');
      let date = new Date(date_parts[0], date_parts[1] - 1, date_parts[2].substring(0,2));
      let day = date.getDay();

      for (let j=0; j < days_filter.length; j++) {
        if (day === days_filter[j]) {
          events.push(all_events[i]);
          break;
        }
      }
    }
    console.log("found " + events.length + " events based on the selected days");
    return events;
  }

  filterRadius(all_events = null) {
    let currentLocation = this.refs.map.getCurrentLocation();
    let radius_filter = this.state.filter.radius;
    console.log(radius_filter);
    all_events = all_events || this.state.all_events;
    let events = [];
    if (currentLocation) {
      for (let i=0; i < all_events.length; i++) {
        let distance = this.getDistanceBetweenPoints(currentLocation, all_events[i].venue.location);
        if (distance <= radius_filter) {
          events.push(all_events[i]);
        }
      }
      console.log("found " + events.length + " events within " + radius_filter + " miles of your position");
    }
    return events;
  }

  getDistanceBetweenPoints(p1, p2) {
    p1 = {lat: parseFloat(p1.lat), lng: parseFloat(p1.lng)};
    p2 = {lat: parseFloat(p2.lat), lng: parseFloat(p2.lng)};


    function toRad(x) {
      return x * Math.PI / 180;
    }

    const R = 3959; // mean radius of earth in miles

    // Haversine Formula
    let lat_diff = toRad(p2.lat - p1.lat);
    let lng_diff = toRad(p2.lng - p1.lng);
    let A = Math.sin(lat_diff / 2) * Math.sin(lat_diff / 2) + Math.cos(toRad(p1.lat)) * Math.cos(toRad(p2.lat)) * Math.sin(lng_diff / 2) * Math.sin(lng_diff / 2);
    let C = 2 * Math.atan2(Math.sqrt(A), Math.sqrt(1 - A));
    return R * C;
  }

  shouldComponentUpdate(nextProps, nextState) {
    return nextState.shouldUpdate;
  }

  render() {
    let showEvents = this.state.showEvents;
    let showFilters = this.state.showFilters;
    let loading_bars = [];
    for (let i=0; i < 10; i++) {
      loading_bars.push(<div className="bar" key={i}></div>);
    }
    let filter = this.state.filter;
    let changeDayFilter = this.changeDayFilter;
    return (
      <div className="App row app-row">
        <div className="page-cover" style={{display: this.state.pageCover ? 'block' : 'none'}} >
          <div id="bars">{loading_bars}<h6>&nbsp;</h6></div>
        </div>
        <div className="control-btns">
          <button className="btn btn-primary btn-block" data-toggle="button" aria-pressed={this.state.showEvents} onClick={() => this.setState({ showEvents: !this.state.showEvents }) }>Toggle Events</button>
          <button className="btn btn-success btn-block" data-toggle="button" aria-pressed={this.state.showFilters} onClick={() => this.setState({ showFilters: !this.state.showFilters }) }>Toggle Filters</button>
          <button className="btn btn-danger btn-block" disabled onClick={this.scrapeEvents}>Scrape Events</button>
        </div>
        <div className="cards-container list-group" style={{ right: showEvents ? 0 : '-400px' }}>
          {this.state.events.map((event, i) => {
            return (
              <a className="list-group-item list-group-item-action flex-column align-items-start" href="#/" key={event.id}>
                <h5 className="mb-1">{event.title}</h5>
                <p className="mb-1">{event.venue.name}</p>
                <div className="d-flex w-100 justify-content-between">
                  <small>{event.time}</small>
                  <small>{event.date}</small>
                </div>
                <div className="tags">
                  {event.tags.map((tag, j) => {
                    return (<div className="tag" key={j} style={{background: this.getTagColor(tag.id)}}>{tag.tag}</div>)
                  })}
                </div>
              </a>)
          })}
        </div>
        <div id="filters" className="filter-container" style={{ bottom: showFilters ? 0 : '-100px', width: showEvents ? 'calc(100% - 400px)' : '100%' }}>
          <div className="row">

            <div className="col-md-4">
              <div className="filter-days-btns">
                {['S','M','T','W','Th','F','S'].map((day, i) => {
                  return (
                    <button className={filter.days.indexOf(i) > -1 ? 'btn btn-secondary active' : 'btn btn-secondary'} data-toggle="buttons" key={i} value={i} onClick={(e) => changeDayFilter(e.target.value)} aria-pressed={filter.days.indexOf(i) > -1} autoComplete="off">
                      {day}
                    </button>
                  )
                })}
              </div>
            </div>
            
            <div className="col-md-1">
              <div className="input-group mb-3">
                <input type="text" className="form-control" onChange={(e) => this.setState({ filter: {days: this.state.filter.days, radius: e.target.value} }, this.filter)} disabled={false} value={this.state.filter.radius} aria-label="Radius" aria-describedby="radius-input" />
                <div className="input-group-append">
                  <span className="input-group-text" id="radius-input"> miles</span>
                </div>
              </div>
            </div>


          </div>
        </div>
        <div className="map-container">
          <Map 
            ref="map"
            getFilterRadius={() => this.state.filter.radius}
            pageCover={(pageCover) => this.setState({pageCover})} />
        </div>
      </div>
    );
  }
    getTagColor(id) {
    const COLORS = [
      '#f44336',
      '#E91E63',
      '#9C27B0',
      '#673AB7',
      '#3F51B5',
      '#2196F3',
      '#03A9F4',
      '#00BCD4',
      '#009688',
      '#4CAF50',
      '#8BC34A',
      '#CDDC39',
      '#FFEB3B',
      '#FFC107',
      '#FF9800',
      '#FF5722',
      '#795548',
      '#9E9E9E',
      '#607D8B',
      '#d50000',
      '#C51162',
      '#AA00FF',
      '#6200EA',
      '#304FFE',
      '#2962FF',
      '#0091EA',
      '#00B8D4',
      '#00BFA5',
      '#00C853',
      '#64DD17',
      '#AEEA00',
      '#FFD600',
      '#FFAB00',
      '#FF6D00',
      '#DD2C00',
    ];
    return COLORS[id % COLORS.length];
  }
}

export default App;
