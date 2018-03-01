import React, { Component } from 'react';
// import Event from './components/Event.js';
import Map from './components/Map.js';
import MarkerModal from './components/MarkerModal.js';
import LoadingScreen from './components/LoadingScreen.js';

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
      loading: true,
      loadingTimeout: 10
    };
    this.updateLoadingScreen = this.updateLoadingScreen.bind(this);
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

      let tzoffset = (new Date()).getTimezoneOffset() * 60000;
      let cur_date = (new Date(Date.now() - tzoffset)).toISOString().substring(0,10);

      this.setState(cached_state, () => {
        let all_events = this.state.all_events;
        all_events = all_events.filter((event, i) => {
          return event.date >= cur_date;
        });
        this.setState({ all_events, events: all_events });
      });
    }
    this.setState({loading: true});

  }

  componentDidMount = async () => {
    const removeDuplicatesBy = async (keyFn, array) => {
      try {
        let mySet = new Set();
        return array.filter((x) => {
          let key = keyFn(x), isNew = !mySet.has(key);
          if (isNew) mySet.add(key);
          return isNew;
        });
      } catch (err) {
        return err;
      }
    }

    try {
      setTimeout(() => {
        this.setState({ pageCoverInfo: {
          message: 'Fetching events',
          eventsLoaded: 0,
          eventsToLoad: 0,
        }})
      }, this.state.loadingTimeout);

      let tzoffset = (new Date()).getTimezoneOffset() * 60000;
      let date = (new Date(Date.now() - tzoffset)).toISOString().substring(0,10);

      this.setState({ settings: { ...this.state.settings, dateRange: { min: date, max: '' }} });

      let res = await this.getEvents();
      let events = [];

      for (let i=0; i < res.result.length; i++) {

        let event = res.result[i];
        if(event.venue.lat && event.venue.lng) {
      
          setTimeout(() => {
            this.setState({ pageCoverInfo: {
              message: 'Getting stored events',
              eventsLoaded: i,
              eventsToLoad: res.result.length,
            }})
          }, this.state.loadingTimeout);

          let date_parts = event.event_date.split('-');
          let date = new Date(date_parts[0], date_parts[1] - 1, date_parts[2].substring(0,2));

          let ev = {
            id: event.id,
            title: event.title,
            date: date,
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

      const deduped_events = await removeDuplicatesBy(x => x.id, [...this.state.all_events, ...events]);

      let new_events_count = 0;
      for (let i=0; i < deduped_events.length; i++) {

        if ((!deduped_events[i].organizers || !deduped_events[i].tags) || (deduped_events[i].organizers.length < 1 && deduped_events[i].tags.length < 1)) {
          new_events_count++;

          setTimeout(() => {
            this.setState({ pageCoverInfo: {
              message: 'Processing events',
              eventsLoaded: i,
              eventsToLoad: deduped_events.length,
            }})
          }, this.state.loadingTimeout);

          // const organizers_res = await this.getOrganizers(deduped_events[i].id);
          // deduped_events[i].organizers = organizers_res.result;

          // const tags_res = await this.getTags(deduped_events[i].id);
          // deduped_events[i].tags = tags_res.result;
        }
      }

      setTimeout(() => {
        this.setState({ pageCoverInfo: {
          message: 'Finished',
          eventsLoaded: deduped_events.length,
          eventsToLoad: deduped_events.length,
        }})
      }, this.state.loadingTimeout);

      this.setState({ newEventsCount: new_events_count, all_events: deduped_events, events: deduped_events }, this.filter);
      this.setState({ loading: false });

    } catch(err) {
      console.log("APP_DID_MOUNT ERROR: ", err);
    }
    
    window.addEventListener('beforeunload', localStorage.setItem("state", JSON.stringify(this.state)));
  }

  getEvents = async () => {
    try {
      const response = await fetch('/api/events/');
      const body = await response.json();
      console.log(body.result.length + ' events found');
      return body;
    } catch(err) {
      console.error('FETCH_EVENTS_ERR:', err);
      return err;
    }
  };

  getTags = async (id) => {
    try {
      const response = await fetch(`/api/events/${id}/tags`);
      const body = await response.json();
      return body;
    } catch(err) {
      return err;
    }
  };

  getOrganizers = async (id) => {
    try {
      const response = await fetch(`/api/events/${id}/organizers`);
      const body = await response.json();
      return body;
    } catch(err) {
      return err;
    }
  };

  scrapeEvents = async () => {
    try {
      if (prompt("Enter secret to continue.") === '19hz') {
        const response = await fetch(`/api/scrape`);
        const body = await response.json();
        return body;
      } else {
        alert("Access denied");
      }
    } catch(err) {
      return err;
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
    this.setState({ settings: { ...this.state.settings, days: days_filter }}, this.filter);
  }

  filter = async () => {
    try {
      let events = await this.filterDateRange();
      events = await this.filterDays(events);
      events = await this.filterRadius(events);
      await this.refs.map.setMarkers(events);
      await this.setState({ events });
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
    return events;
  }

  filterDays(all_events = null) {
    let days_filter = this.state.settings.days;
    all_events = all_events || this.state.all_events;
    let events = [];

    for (let i=0; i < all_events.length; i++) {
      // let date_parts = all_events[i].date.split('-');
      // let date = new Date(date_parts[0], date_parts[1] - 1, date_parts[2].substring(0,2));
      let day = new Date(all_events[i].date).getDay();

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
    if (radius_filter > 0) {
      let events = [];
      for (let i=0; i < all_events.length; i++) {
        let distance = this.getDistanceBetweenPoints(location, all_events[i].venue.location);
        if (distance <= radius_filter) {
          events.push(all_events[i]);
        }
      }
      this.refs.map.updateCircleRadius(radius_filter);
      return events;
    } else {
      return all_events;
    }
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

  render() {
    let settings = this.state.settings;
    let changeDayFilter = this.changeDayFilter;
    let loading;
    if (this.state.loading) {
      loading = (<LoadingScreen ref='loadingScreen'
        message={this.state.pageCoverInfo.message}
        eventsLoaded={this.state.pageCoverInfo.eventsLoaded}
        eventsToLoad={this.state.pageCoverInfo.eventsToLoad}
        />);
    }
    return (
      <div className="App row app-row">
        {loading}
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
}

export default App;
