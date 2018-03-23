import React, { Component } from 'react';
import { connect } from 'react-redux';
import axios from 'axios';
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
    this.getEvents = this.getEvents.bind(this);
    this.handleRegionChange = this.handleRegionChange.bind(this);
    this.filter = this.filter.bind(this);
    this.filterRegion = this.filterRegion.bind(this);
    this.filterDays = this.filterDays.bind(this);
    this.filterRadius = this.filterRadius.bind(this);
    this.filterRating = this.filterRating.bind(this);
    this.filterSearch = this.filterSearch.bind(this);
    this.changeDayFilter = this.changeDayFilter.bind(this);
  }

  componentDidMount = async () => {
    try {

      let tzoffset = (new Date()).getTimezoneOffset() * 60000;
      let date = (new Date(Date.now() - tzoffset)).toISOString().substring(0,10);
      this.props.setSettingsDateRange({ min: date, max: '' });
      await this.getEvents(2);

    } catch(err) {
      console.log("APP_DID_MOUNT ERROR: ", err);
    }
  }

  getEvents = async (region = 0) => {
    try {
    this.props.setLoading(true);
      // const response = await fetch('/api/venues/fetch/1');
      // const response = await fetch('/api/scrape/1');
      if (parseInt(region, 10) < 1) region = '';
      const response = await fetch('/api/events/'+region);
      const body = await response.json();
      console.log(body.result.length + ' events found');

      let events = [];
      let tba_events = [];

      for (let i=0; i < body.result.length; i++) {
        let event = body.result[i];
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

        events.push(ev);
        if (event.venue.name === 'TBA') tba_events.push(ev);
      }

      this.props.setAllEvents(events);
      this.props.setCurrentEvents(events);
      this.props.setTBAEvents(tba_events);
      this.props.setLoading(false);


      await this.filter();


    } catch(err) {
      console.error('FETCH_EVENTS_ERR:', err);
      return err;
    }
  };

  scrapeEvents = async () => {
    try {
      if (prompt("Enter secret to continue.") === '19hz') {
        let r = parseInt(prompt("Enter region (1-7)"),10);
        if (r===1 || r===2 || r===3 || r===4 || r===5 || r===6 || r===7) {
          await axios.get(`/api/venues/fetch/${r}`);
          await axios.get(`/api/scrape/${r}`);
          this.getEvents(this.props.settings.region);
        } else if (r === 0) {
          for (let i = 1; i < 8; i++) {
            await axios.get(`/api/venues/fetch/${i}`);
            await axios.get(`/api/scrape/${i}`);
          }
          this.getEvents(this.props.settings.region);
        } else {
          alert("Must enter a number 1-7");
        }
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

      events = await this.filterRegion(events);
      events = await this.filterDateRange(events);
      events = await this.filterDays(events);
      events = await this.filterRadius(events);
      // events = await this.filterRating(events);
      events = await this.filterSearch(events);
      events.sort(function(a, b) {
        a = new Date(a.date);
        b = new Date(b.date);
        return a>b ? -1 : a < b ? 1 : 0;
      });

      this.props.setCurrentEvents(events);
      this.props.calculateClusters(events, this.props.window.zoom);
      this.props.setTBAEvents(events.filter(obj => obj.venue.name === 'TBA'));
    } catch(err) {
      console.log("FILTER ERROR: ", err);
    }
  }

  filterRegion = async (all_events = null) => {
    let region = parseInt(this.props.settings.region, 10);
    all_events = all_events || this.props.allEvents;
    if (region > 0) {
      let events = [];
      for (let i=0; i < all_events.length; i++) {
        if (all_events[i].region === region) {
          events.push(all_events[i]);
        }
      }
      return events;
      }
    return all_events;
  }

  filterDateRange = async (all_events = null) => {
    let date_range_filter = this.props.settings.dateRange;
    all_events = all_events || this.props.allEvents;
    let events = [];

    let min_split = date_range_filter.min.split('-');
    let max_split = date_range_filter.max.split('-');

    let min_date = date_range_filter.min ? new Date(parseInt(min_split[0], 10), parseInt(min_split[1], 10)-1, parseInt(min_split[2], 10)) : new Date(Date.now());
    let max_date = date_range_filter.max ? new Date(parseInt(max_split[0], 10), parseInt(max_split[1], 10)-1, parseInt(max_split[2], 10)) : null;

    for (let i=0; i < all_events.length; i++) {
      let event_date = new Date(all_events[i].date);

      if (event_date >= min_date && (event_date <= max_date || !max_date) ) {
        events.push(all_events[i]);
      }
    }
    return events;
  }

  filterDays = async (all_events = null) => {
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

  filterRadius = async (all_events = null) => {
    let location = this.props.currentLocation || this.props.window.center;
    let radius_filter = this.props.settings.radius;
    all_events = all_events || this.props.allEvents;
    if (radius_filter > 0 && this.props.circle) {
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

  filterRating = async (all_events = null) => {
    let rating = this.props.settings.rating;
    all_events = all_events || this.props.allEvents;
    if (rating > 0) {
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

  filterSearch = async (all_events = null) => {
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
      let result = await fuse.search(this.state.search || all_events);
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
  handleRegionChange = async (e) => {
    let value = parseInt(e.target.value, 10);
    let center = this.props.window.center;
    let zoom = 10;
    switch (value) {
      case 0:
        zoom = 5;
        center = {
          lat: 37.0902,
          lng: -95.7129
        };
        break;
      case 1:
        center = {
          lat: 37.7749,
          lng: -122.4194
        };
        break;
      case 2:
        zoom = 9;
        center = {
          lat: 34.0522,
          lng: -118.2437
        };
        break;
      case 3:
        zoom = 11;
        center = {
          lat: 33.7490,
          lng: -84.3880
        };
        break;
      case 4:
        zoom = 7;
        center = {
          lat: 31.9686,
          lng: -99.9018
        };
        break;
      case 5:
        center = {
          lat: 25.7617,
          lng: -80.1918
        };
        break;
      case 6:
        center = {
          lat: 33.4484,
          lng: -112.0740
        };
        break;
      case 7:
        center = {
          lat: 42.3601,
          lng: -71.0589
        };
        break;
      default:
        zoom = 5;
        center = {
          lat: 37.0902,
          lng: -95.7129
        };
        break;
    }
    this.props.setWindowCenter(center);
    this.props.setWindowZoom(zoom);
    await this.props.setSettingsRegion(value);
    await this.getEvents(value);
    this.filter();
  }

  liveSearch = async (e) => {
    try {
      await this.setState({ search: e.target.value });
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
          <div className="tba-events-counter" style={{display: this.props.tbaEvents.length > 0 ? "block" : "none"}} onClick={() => this.props.setModalEvents(this.props.tbaEvents)} data-toggle="modal" data-target="#eventsModal">
            {this.props.tbaEvents.length} TBA
          </div>
        </div>
        {/*<button className="btn btn-danger btn-sm btn-scrape-events" onClick={this.scrapeEvents}>Scrape Events</button>*/}

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
            onClick={() => this.props.setShowSettings(!this.props.showSettings)}>
            <i className="fas fa-bars"></i>
            </button>

          <div className="row mb-5">
            <div className="col-md-12">
              <h1 className="display-4">Settings</h1>
            </div>
          </div>

          <div className="row mb-5">
            <div className="col-md-12">
              <h4>Region</h4>
                <select className="form-control" id="region-select" value={this.props.settings.region} onChange={this.handleRegionChange}>
                  <option value="0">All (experimental)</option>
                  <option value="1">SF Bay Area</option>
                  <option value="2">Los Angeles</option>
                  <option value="3">Atlanta</option>
                  <option value="4">Texas</option>
                  <option value="5">Miami</option>
                  <option value="6">Phoenix</option>
                  <option value="7">Massachusetts</option>
                </select>
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

{/*          <div className="row mb-5">
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
          </div>*/}


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
    setTBAEvents: (events) => dispatch(actions.setTBAEvents(events)),
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
    setWindowCenter: (center) => dispatch(actions.setWindowCenter(center)),
    setWindowZoom: (zoom) => dispatch(actions.setWindowZoom(zoom)),
    setSettingsShowCircle: (bool) => dispatch(actions.setSettingsShowCircle(bool)),
    setSettingsRegion: (region) => dispatch(actions.setSettingsRegion(region)),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(App);
