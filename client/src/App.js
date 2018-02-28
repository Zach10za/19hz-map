import React, { Component } from 'react';
// import Event from './components/Event.js';
import Map from './components/Map.js';
import MarkerModal from './components/MarkerModal.js';

class App extends Component {

  constructor() {
    super();
    this.state = {
      all_events: [],
      events: [],
      modalEvents: [],
      newEventsCount: 0,
      settings: {
        dateRange: {
          min: '',
          max: '',
        },
        days: [0,1,2,3,4,5,6],
        radius: 50,
      },
      showSettings: false,
      pageCover: false,
      pageCoverInfo: {
        message: 'loading',
        eventsLoaded: null,
        eventsToLoad: null,
      },
      error: {
        isError: false,
        message: '',
      },
      loadingMessage: 'loading',
      shouldUpdate: true,
    };
    this.handleEventClick = this.handleEventClick.bind(this);
    this.filter = this.filter.bind(this);
    this.filterDays = this.filterDays.bind(this);
    this.filterRadius = this.filterRadius.bind(this);
    this.changeDayFilter = this.changeDayFilter.bind(this);
  }

  componentWillMount() {
    let cached_state = localStorage.getItem('state');
    if (cached_state) {
      cached_state = JSON.parse(cached_state);
      console.log("Found cached state", cached_state);
      this.setState(cached_state);
    } else {
      console.log("Could not find cached state");
    }

  }

  componentDidMount = async () => {
    function removeDuplicatesBy(keyFn, array) {
      console.log("removeDuplicatesBy");
      let mySet = new Set();
      return array.filter((x) => {
        let key = keyFn(x), isNew = !mySet.has(key);
        if (isNew) mySet.add(key);
        return isNew;
      });
    }

    try {
      let tzoffset = (new Date()).getTimezoneOffset() * 60000;
      let date = (new Date(Date.now() - tzoffset)).toISOString().substring(0,10);
      this.setState({ pageCover: true, settings: { ...this.state.settings, dateRange: { min: date, max: '' }}, shouldUpdate: true });
      let res = await this.getEvents();
      let events = [];


      for (let i=0; i < res.result.length; i++) {
        let pageCoverInfo = {
          message: `${i}/${res.result.length}`,
          eventsLoaded: i,
          eventsToLoad: res.result.length,
        }
        this.setState({ pageCoverInfo });

        let event = res.result[i];
        if(event.venue.lat && event.venue.lng) {
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
          events.push(ev);
        }
      }

      let deduped_events = removeDuplicatesBy(x => x.id, [...this.state.all_events, ...events]);

      let new_events_count = 0;
      for (let i=0; i < deduped_events.length; i++) {
        let pageCoverInfo = {
          message: `Getting new event info`,
          eventsLoaded: i,
          eventsToLoad: deduped_events.length,
        }
        this.setState({ pageCoverInfo });
        if (deduped_events[i].organizers.length < 1 && deduped_events[i].tags.length < 1) {
          new_events_count++;

          pageCoverInfo = {
            message: `Getting new event info`,
            eventsLoaded: i,
            eventsToLoad: deduped_events.length,
          }
          this.setState({ pageCoverInfo });

          let organizers_res = await this.getOrganizers(deduped_events[i].id);
          deduped_events[i].organizers = organizers_res.result;

          let tags_res = await this.getTags(deduped_events[i].id);
          deduped_events[i].tags = tags_res.result;
        }
      }
      this.setState({ newEventsCount: new_events_count });

      await this.setState({ all_events: deduped_events, events: deduped_events });
      await this.filter();
      let pageCoverInfo = {
        message: '',
        eventsLoaded: null,
        eventsToLoad: null,
      }
      await this.setState({ pageCover: false, pageCoverInfo });

    } catch(err) {
      console.log("APP_DID_MOUNT ERROR: ", err);
    }
    window.addEventListener('beforeunload', localStorage.setItem("state", JSON.stringify(this.state)));
  }

  getEvents = async () => {
    console.log('getting events');
    let pageCoverInfo = {
      message: `Fetching events from database`,
      eventsLoaded: null,
      eventsToLoad: null,
    }
    this.setState({ pageCoverInfo });
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
    if (prompt("Enter secret to continue.") === '19hz') {
      const response = await fetch(`/api/scrape`);
      const body = await response.json();
      return body;
    } else {
      alert("Access denied");
    }
  };


  handleEventClick(marker) {
    this.refs.map.showMarker(marker);
  }

  changeDayFilter(day_of_week) {
    let days_filter = this.state.settings.days;
    let value = parseInt(day_of_week, 10);

    if (days_filter.indexOf(value) > -1) {
      days_filter.splice(days_filter.indexOf(value), 1);
    } else {
      days_filter.push(value);
    }
    this.setState({ settings: { ...this.state.settings, days: days_filter }, shouldUpdate: false }, this.filter);
  }

  filter = async () => {
    try {
      console.log("filter");
      let events = await this.filterDateRange();
      events = await this.filterDays(events);
      events = await this.filterRadius(events);
      await this.refs.map.setMarkers(events);
      await this.setState({ events, shouldUpdate: true  });
    } catch(err) {
      console.log("FILTER ERROR: ", err);
    }
  }

  filterDateRange(all_events = null) {
    let date_range_filter = this.state.settings.dateRange;
    all_events = all_events || this.state.all_events;
    let events = [];

    for (let i=0; i < all_events.length; i++) {
      let event_date = new Date(all_events[i].date);
      let min_date = date_range_filter.min ? new Date(date_range_filter.min) : new Date();
      let max_date = date_range_filter.max ? new Date(date_range_filter.max) : null;
      if (event_date >= min_date && (event_date <= max_date || !max_date) ) {
        events.push(all_events[i]);
      }
    }
    console.log(events.length + " events in the date range");
    return events;
  }

  filterDays(all_events = null) {
    let days_filter = this.state.settings.days;
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
    return events;
  }

  filterRadius(all_events = null) {
    let location = this.refs.map.getCurrentLocation();
    let radius_filter = this.state.settings.radius;
    all_events = all_events || this.state.all_events;
    let events = [];
    for (let i=0; i < all_events.length; i++) {
      let distance = this.getDistanceBetweenPoints(location, all_events[i].venue.location);
      if (distance <= radius_filter) {
        events.push(all_events[i]);
      }
    }
    this.refs.map.updateCircleRadius(radius_filter);
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

  handleDateRangeChange(e) {
    let settings = this.state.settings;
    if (e.target.id === 'min-date') {
      settings.dateRange.min = e.target.value;
    } else if (e.target.id === 'max-date') {
      settings.dateRange.max = e.target.value;
    }
    this.setState({ settings }, this.filter);
  }

  openMarkerModal(events) {
    this.setState({ modalEvents: events });
  }

  shouldComponentUpdate(nextProps, nextState) {
    return nextState.shouldUpdate;
  }

  render() {
    let loading_bars = [];
    for (let i=0; i < 10; i++) {
      loading_bars.push(<div className="bar" key={i}></div>);
    }
    let settings = this.state.settings;
    let changeDayFilter = this.changeDayFilter;

    return (
      <div className="App row app-row">
        <div className="page-cover" style={{display: this.state.pageCover ? 'block' : 'none'}} >
          <div id="bars">{loading_bars}<h6>{this.state.pageCoverInfo.message}</h6></div>
          <div className="progress events-progress">
            <div className="progress-bar" role="progressbar" style={{ width: (this.state.pageCoverInfo.eventsLoaded / this.state.pageCoverInfo.eventsToLoad * 100) + "%"}} aria-valuenow={this.state.pageCoverInfo.eventsLoaded} aria-valuemin="0" aria-valuemax={this.state.pageCoverInfo.eventsToLoad}></div>
          </div>
        </div>

        <MarkerModal events={this.state.modalEvents} />

        <div className="events-counter">
          {this.state.events.length} Events
          <span className="ml-1 badge badge-info" style={{display: (this.state.newEventsCount > 0 && this.state.newEventsCount < this.state.all_events.length) ? 'inline' : 'none'}}>
            {this.state.newEventsCount}
          </span>
        </div>
        <button className="btn btn-danger btn-sm btn-scrape-events" onClick={this.scrapeEvents}>Scrape Events</button>

        <div id="settings" className={"settings-container" + (this.state.showSettings ? "" : " hide")}>
          <button className="btn btn-primary btn-settings"
            data-toggle="button"
            aria-pressed={this.state.showSettings}
            onClick={(e) => this.setState({ showSettings: !this.state.showSettings }) }>{ this.state.showSettings ? 'Hide' : 'Settings'}</button>

          <div className="row mb-5">
            <div className="col-md-12">
              <h1 className="display-4">Settings</h1>
            </div>
          </div>

          <div className="row mb-5">
            <div className="col-md-12">
              <h4>Date Range</h4>

              <div v="form-row">
                <div className="col">
                  <input type="date" className="form-control" id="min-date" value={this.state.settings.dateRange.min} onChange={this.handleDateRangeChange.bind(this)}/>
                </div>
                <div className="col">
                  <input type="date" className="form-control" id="max-date" value={this.state.settings.dateRange.max} onChange={this.handleDateRangeChange.bind(this)}/>
                </div>
              </div>

            </div>
          </div>

          <div className="row mb-5">
            <div className="col-md-12">
              <h4>Days of the Week</h4>
              <div className="days-btns">
                {['S','M','T','W','Th','F','S'].map((day, i) => {
                  return (
                    <button className={settings.days.indexOf(i) > -1 ? 'btn btn-secondary active' : 'btn btn-secondary'} data-toggle="buttons" key={i} value={i} onClick={(e) => changeDayFilter(e.target.value)} aria-pressed={settings.days.indexOf(i) > -1} autoComplete="off">
                      {day}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          <div className="row mb-5">
            <div className="col-md-12">
              <h4>Location Radius</h4>
              <small className="text-muted mb-1">({this.state.settings.radius} miles)</small>
              <div className="input-group radius-range">
                <input
                  type="range"
                  className="form-control"
                  min="5"
                  max="100"
                  step="1"
                  onChange={(e) => this.setState({ settings: { ...this.state.settings, radius: e.target.value} }, this.filter)}
                  disabled={false}
                  value={this.state.settings.radius}
                  aria-label="Radius"
                  aria-describedby="radius-input" />
              </div>
            </div>
          </div>

{/*          <div className="row mb-5">
            <div className="col-md-12">
              <h4>Location Radius</h4>
              <div className="input-group radius-input">
                <input type="text" className="form-control" onChange={(e) => this.setState({ settings: { ...this.state.settings, radius: e.target.value} }, this.filter)} disabled={false} value={this.state.settings.radius} aria-label="Radius" aria-describedby="radius-input" />
                <div className="input-group-append">
                  <span className="input-group-text" id="radius-input"> miles</span>
                </div>
              </div>
            </div>
          </div>*/}

          <div className="row mb-2 settings-btns">
            <div className="col-md-12">
              <button className="btn btn-primary btn-block btn-lg" onClick={() => alert('save')}>Save</button>
              <button className="btn btn-link btn-block" onClick={() => alert('reset')}>Reset</button>
            </div>
          </div>

        </div>

        <div className="map-container">
          <Map
            ref="map"
            getFilterRadius={() => this.state.settings.radius}
            settings={this.settings}
            pageCover={(pageCover) => this.setState({pageCover})}
            openMarkerModal={this.openMarkerModal.bind(this)} />
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
