import React, { Component } from 'react';
import { connect } from 'react-redux';
import Fuse from 'fuse-js-latest';
import Map from './components/Map.js';
import MarkerModal from './components/MarkerModal.js';
import LoadingScreen from './components/LoadingScreen.js';
const actions = require('./actions/index');

class App extends Component {

  constructor() {
    super();
    this.state = {
      search: ''
    }
    this.filter = this.filter.bind(this);
    this.filterDays = this.filterDays.bind(this);
    this.filterRadius = this.filterRadius.bind(this);
    this.filterRating = this.filterRating.bind(this);
    this.filterSearch = this.filterSearch.bind(this);
    this.changeDayFilter = this.changeDayFilter.bind(this);
  }

  componentWillMount() {
    // Get Cached events and settings
    // let cached_allEvents = localStorage.getItem("allEvents");
    // let cached_settings = localStorage.getItem("settings");
    // let cached_window = localStorage.getItem("window");

    // if (cached_allEvents) {
    //   let tzoffset = (new Date()).getTimezoneOffset() * 60000;
    //   let cur_date = (new Date(Date.now() - tzoffset)).toISOString().substring(0,10);
    //   let all_events = JSON.parse(cached_allEvents);
    //   all_events = all_events.filter((event, i) => {
    //     return event.date >= cur_date;
    //   });
    //   this.props.setAllEvents(all_events);
    // }
    // if (cached_settings) this.props.setSettings(JSON.parse(cached_settings));
    // if (cached_window) this.props.setWindow(JSON.parse(cached_window));
    this.props.setLoading(true);
  }

  componentDidMount = async () => {
    const loadingTimeout = 10;

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
        this.props.setLoadingMessage({
          message: 'Fetching events',
          eventsLoaded: 0,
          eventsToLoad: 0,
        })
      }, loadingTimeout);

      let tzoffset = (new Date()).getTimezoneOffset() * 60000;
      let date = (new Date(Date.now() - tzoffset)).toISOString().substring(0,10);
      this.props.setSettingsDateRange({ min: date, max: '' });

      let res = await this.getEvents();
      let events = [];

      for (let i=0; i < res.result.length; i++) {

        let event = res.result[i];
        if(event.venue.lat && event.venue.lng) {
          setTimeout(() => {
            this.props.setLoadingMessage({
              message: 'Getting stored events',
              eventsLoaded: i,
              eventsToLoad: res.result.length,
            })
          }, loadingTimeout);

          let date_parts = event.event_date.split('-');
          let date = new Date(date_parts[0], date_parts[1] - 1, date_parts[2].substring(0,2));

          let ev = {
            id: event.id,
            title: event.title,
            date: date,
            time: event.time,
            price: event.price,
            age: event.age,
            link: event.link,
            facebook: event.facebook,
            venue: {
              name: event.venue.name,
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
          events.push(ev);
        }
      }
      const deduped_events = await removeDuplicatesBy(x => x.id, [...this.props.allEvents, ...events]);


      for (let i=0; i < deduped_events.length; i++) {

        if ((!deduped_events[i].organizers || !deduped_events[i].tags) || (deduped_events[i].organizers.length < 1 && deduped_events[i].tags.length < 1)) {
          setTimeout(() => {
            this.props.setLoadingMessage({
              message: 'Processing events',
              eventsLoaded: i,
              eventsToLoad: deduped_events.length,
            })
          }, loadingTimeout);
        }
      }

      setTimeout(() => {
        this.props.setLoadingMessage({
          message: 'Finished',
          eventsLoaded: deduped_events.length,
          eventsToLoad: deduped_events.length,
        })
      }, loadingTimeout);

      this.props.setAllEvents(deduped_events);
      this.props.setCurrentEvents(deduped_events);
      this.props.setLoading(false);


      await this.filter();

    } catch(err) {
      console.log("APP_DID_MOUNT ERROR: ", err);
    }

    // window.addEventListener('beforeunload', () => {
    //   localStorage.setItem("allEvents", JSON.stringify(this.props.allEvents));
    //   localStorage.setItem("settings", JSON.stringify(this.props.settings));
    //   localStorage.setItem("window", JSON.stringify(this.props.window));
    // });
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

  changeDayFilter(day_of_week) {
    let days_filter = this.props.settings.days;
    let value = parseInt(day_of_week, 10);

    if (days_filter.indexOf(value) > -1) {
      days_filter.splice(days_filter.indexOf(value), 1);
    } else {
      days_filter.push(value);
    }
    this.props.setSettingsDays(days_filter)
    this.filter();
  }

  filter = async (events = null) => {
    try {
      events = await this.filterDateRange(events);
      events = await this.filterDays(events);
      events = await this.filterRadius(events);
      events = await this.filterRating(events);
      events = await this.filterSearch(events);
      events.sort(function(a, b) {
        a = new Date(a.date);
        b = new Date(b.date);
        return a>b ? -1 : a < b ? 1 : 0;
      });

      this.props.setCurrentEvents(events);
      this.props.calculateClusters(this.props.currentEvents, this.props.window.zoom);
    } catch(err) {
      console.log("FILTER ERROR: ", err);
    }
  }

  filterDateRange(all_events = null) {
    let date_range_filter = this.props.settings.dateRange;
    all_events = all_events || this.props.allEvents;
    let events = [];

    let min_split = date_range_filter.min.split('-');
    let max_split = date_range_filter.max.split('-');

    let min_date = date_range_filter.min ? new Date(parseInt(min_split[0], 10), parseInt(min_split[1], 10)-1, parseInt(min_split[2], 10)) : new Date(Date.now());
    let max_date = date_range_filter.max ? new Date(parseInt(max_split[0], 10), parseInt(max_split[1], 10)-1, parseInt(max_split[2], 10)) : null;

    console.log(date_range_filter.min, min_date);
    console.log(date_range_filter.max, max_date);


    for (let i=0; i < all_events.length; i++) {
      let event_date = new Date(all_events[i].date);

      if (event_date >= min_date && (event_date <= max_date || !max_date) ) {
        events.push(all_events[i]);
      }
    }
    return events;
  }

  filterDays(all_events = null) {
    let days_filter = this.props.settings.days;
    all_events = all_events || this.props.allEvents;
    let events = [];

    for (let i=0; i < all_events.length; i++) {
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
    let location = this.props.currentLocation || this.props.window.center;
    let radius_filter = this.props.settings.radius;
    all_events = all_events || this.props.allEvents;
    if (radius_filter > 0 && this.props.circle) {
      console.log(radius_filter);
      let events = [];
      for (let i=0; i < all_events.length; i++) {
        let distance = this.getDistanceBetweenPoints(location, all_events[i].venue.location);
        if (distance <= radius_filter) {
          events.push(all_events[i]);
        }
      }
      this.props.updateCircleRadius(radius_filter);
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

  filterRating(all_events = null) {
    let rating = this.props.settings.rating;
    all_events = all_events || this.props.allEvents;
    if (rating > 0) {
      console.log(rating);
      let events = [];
      for (let i=0; i < all_events.length; i++) {
        if (all_events[i].venue.rating >= rating) {
          events.push(all_events[i]);
        }
      }
      return events;
    } else {
      return all_events;
    }
  }

  filterSearch(all_events = null) {
    all_events = all_events || this.props.allEvents;
    if (this.state.search) {
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
      const fuse = new Fuse(all_events, options);
      let result = fuse.search(this.state.search || " ");
      return result;
    } else {
      return all_events;
    }
  }

  handleDateRangeChange(e) {
    let dateRange = this.props.settings.dateRange;
    if (e.target.id === 'min-date') {
      dateRange.min = e.target.value;
    } else if (e.target.id === 'max-date') {
      dateRange.max = e.target.value;
    }
    this.props.setSettingsDateRange(dateRange);
    this.filter();
  }

  liveSearch(e) {
    try {
      this.setState({ search: e.target.value });
      this.filter();
    } catch(err) {
      console.log("SEARCH ERROR: ", err);
    }
  }

  render() {
    let settings = this.props.settings;
    let changeDayFilter = this.changeDayFilter;
    let loading;
    if (this.props.isLoading) {
      loading = (<LoadingScreen />);
    }
    return (
      <div className="App row app-row">
      <div className="overlay">
        {loading}
        <MarkerModal events={this.props.modalEvents} />
        <div className="events-counter">
          {this.props.currentEvents.length} Events
        </div>
        <button className="btn btn-danger btn-sm btn-scrape-events" onClick={this.scrapeEvents}>Scrape Events</button>

        <div className="search-bar">
          <input type="search"
            className="form-control" 
            id="live-search" 
            placeholder="Search for events, venues, artists..."
            value={this.state.search} 
            onChange={this.liveSearch.bind(this)}/>
        </div>

        <div id="settings" className={"settings-container" + (this.props.showSettings ? "" : " hide")}>
          <button className="btn btn-primary btn-settings"
            data-toggle="button"
            aria-pressed={this.props.showSettings}
            onClick={() => this.props.setShowSettings(!this.props.showSettings)}>{ this.props.showSettings ? 'Hide' : 'Settings'}</button>

          <div className="row mb-5">
            <div className="col-md-12">
              <h1 className="display-4">Settings</h1>
            </div>
          </div>

          <div className="row mb-5">
            <div className="col-md-12">
              <h4>Date Range</h4>

              <div className="form-row">
                <div className="col-md-6">
                  <input type="date" className="form-control" id="min-date" value={settings.dateRange.min} onChange={this.handleDateRangeChange.bind(this)}/>
                </div>
                <div className="col-md-6">
                  <input type="date" className="form-control" id="max-date" value={settings.dateRange.max} onChange={this.handleDateRangeChange.bind(this)}/>
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
              <div className="d-flex w-100  justify-content-between">
                <h4 style={{ opacity: this.props.settings.radius > 0 ? '1' : '0.5' }}>Location Radius</h4>
                <button className="btn btn-primary btn-circle" data-toggle="button" aria-pressed={this.props.settings.radius > 0}
                  onClick={() => {this.props.setSettingsRadius(this.props.settings.radius > 0 ? -1 : 50); this.filter()}} >
                  { this.props.settings.radius > 0 ? 'Disable' : 'Enable'}
                </button>
              </div>
              <small className="text-muted mb-1" style={{ opacity: this.props.settings.radius > 0 ? '1' : '0' }}>({settings.radius} miles)</small>
              <div className="input-group radius-range" style={{ opacity: this.props.settings.radius > 0 ? '1' : '0.5' }}>
                <input
                  type="range"
                  className="form-control"
                  min="5"
                  max="100"
                  step="1"
                  onChange={(e) => {this.props.setSettingsRadius(e.target.value); this.filter()}}
                  disabled={this.props.settings.radius < 0}
                  value={settings.radius}
                  aria-label="Radius"
                  aria-describedby="radius-input" />
              </div>
            </div>
          </div>

          <div className="row mb-5">
            <div className="col-md-12">
              <div className="d-flex w-100  justify-content-between">
                <h4 style={{ opacity: this.props.settings.rating > 0 ? '1' : '0.5' }}>Venue Rating</h4>
                <button className="btn btn-primary btn-circle" data-toggle="button" aria-pressed={this.props.settings.radius > 0}
                  onClick={() => {this.props.setSettingsRating(this.props.settings.rating > 0 ? -1 : 2.5); this.filter()}} >
                  { this.props.settings.rating > 0 ? 'Disable' : 'Enable'}
                </button>
              </div>
              <small className="text-muted mb-1" style={{ opacity: this.props.settings.rating > 0 ? '1' : '0' }}>({settings.rating})</small>
              <div className="input-group rating-range" style={{ opacity: this.props.settings.rating > 0 ? '1' : '0.5' }}>
                <input
                  type="range"
                  className="form-control"
                  min="0.1"
                  max="5"
                  step="0.1"
                  onChange={(e) => {this.props.setSettingsRating(e.target.value); this.filter()}}
                  disabled={this.props.settings.rating < 0}
                  value={settings.rating}
                  aria-label="Rating"
                  aria-describedby="rating-input" />
              </div>
            </div>
          </div>


        </div>

        </div>
        <div className="map-container">
          <Map ref="gmap" />
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return state;
}

const mapDispatchToProps = (dispatch) => {
  return {
    setLoading: (bool) => dispatch(actions.setLoading(bool)),
    setLoadingMessage: (loadingMessage) => dispatch(actions.setLoadingMessage(loadingMessage)),
    setAllEvents: (allEvents) => dispatch(actions.setAllEvents(allEvents)),
    addAllEvent: (event) => dispatch(actions.addAllEvent(event)),
    setCurrentEvents: (currentEvents) => dispatch(actions.setCurrentEvents(currentEvents)),
    addCurrentEvents: (event) => dispatch(actions.addCurrentEvents(event)),
    setModalEvents: (modalEvents) => dispatch(actions.setModalEvents(modalEvents)),
    setShowSettings: (bool) => dispatch(actions.setShowSettings(bool)),
    setSettings: (settings) => dispatch(actions.setSettings(settings)),
    setSettingsDateRange: (dateRange) => dispatch(actions.setSettingsDateRange(dateRange)),
    setSettingsDays: (days) => dispatch(actions.setSettingsDays(days)),
    setSettingsRadius: (radius) => dispatch(actions.setSettingsRadius(radius)),
    setSettingsRating: (rating) => dispatch(actions.setSettingsRating(rating)),
    updateCircleRadius: (radius) => dispatch(actions.updateCircleRadius(radius)),
    updateCircleCenter: (center) => dispatch(actions.updateCircleCenter(center)),
    calculateClusters: (events, zoom) => dispatch(actions.calculateClusters(events, zoom)),
    setCurrentLocation: (currentLocation) => dispatch(actions.setCurrentLocation(currentLocation)),
    setWindow: (window) => dispatch(actions.setWindow(window)),
    setSettingsShowCircle: (bool) => dispatch(actions.setSettingsShowCircle(bool)),
  };
}


export default connect(mapStateToProps, mapDispatchToProps)(App);
