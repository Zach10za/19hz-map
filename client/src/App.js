import React, { Component } from 'react';
import './App.css';
import Event from './components/Event.js';
import Map from './components/Map.js';

class App extends Component {

  constructor() {
    super();
    this.state = {
      all_events: [],
      events: [],
      filter: {
        days: [],
      }
    };
    this.addEventMarker = this.addEventMarker.bind(this);
    this.handleEventClick = this.handleEventClick.bind(this);
  }

  componentDidMount() {
    this.getEvents()
      .then(res => this.setState({ all_events: res.result, events: res.result }))
      .catch(err => console.log(err));
  }

  getEvents = async () => {
    const response = await fetch('/api/events/');
    const body = await response.json();
    return body;
  };

  addEventMarker(marker) {
    this.refs.map.addMarker(marker);
  }

  removeEventMarker(marker) {
    this.refs.map.removeMarker(marker);
  }

  handleEventClick(marker) {
    this.refs.map.showMarker(marker);
  }

  filter(e) {
    let days_filter = this.state.filter.days;
    if (days_filter.indexOf(e.target.value) > -1) {
      days_filter.splice(days_filter.indexOf(e.target.value), 1);
    } else {
      days_filter.push(e.target.value);
    }

    this.setState({ filter: {days: days_filter} });
  }

  render() {
    return (
      <div className="App row">
        <div className="col-lg-8">
          <div className="map-container">
            <Map 
              ref="map" />
          </div>
        </div>
        <div className="col-lg-1">
          <div className="form-check" onClick={this.filter.bind(this)}>
            <input className="form-check-input" type="checkbox" value="1" id="filter-mon" />
            <label className="form-check-label" htmlFor="filter-mon">Monday</label>
          </div>
          <div className="form-check" onClick={this.filter.bind(this)}>
            <input className="form-check-input" type="checkbox" value="2" id="filter-tue" />
            <label className="form-check-label" htmlFor="filter-tue">Tuesday</label>
          </div>
          <div className="form-check" onClick={this.filter.bind(this)}>
            <input className="form-check-input" type="checkbox" value="3" id="filter-wed" />
            <label className="form-check-label" htmlFor="filter-wed">Wednesday</label>
          </div>
          <div className="form-check" onClick={this.filter.bind(this)}>
            <input className="form-check-input" type="checkbox" value="4" id="filter-thur" />
            <label className="form-check-label" htmlFor="filter-thur">thursday</label>
          </div>
          <div className="form-check" onClick={this.filter.bind(this)}>
            <input className="form-check-input" type="checkbox" value="5" id="filter-fri" />
            <label className="form-check-label" htmlFor="filter-fri">Friday</label>
          </div>
          <div className="form-check" onClick={this.filter.bind(this)}>
            <input className="form-check-input" type="checkbox" value="6" id="filter-sat" />
            <label className="form-check-label" htmlFor="filter-sat">Saturday</label>
          </div>
          <div className="form-check" onClick={this.filter.bind(this)}>
            <input className="form-check-input" type="checkbox" value="0" id="filter-sun" />
            <label className="form-check-label" htmlFor="filter-sun">Sunday</label>
          </div>
        </div>
        <div className="col-lg-3">
          <div className="cards-container">
            {this.state.events.map(event => {
              let date_parts = event.event_date.split("-");
              let date = new Date(date_parts[0], date_parts[1] - 1, date_parts[2].substr(0,2));
              if (this.state.filter.days.indexOf(""+date.getDay()) > -1) {
                return (<Event 
                  event={event} 
                  onClick={this.handleEventClick} 
                  addEventToMap={this.addEventMarker}
                  removeEventFromMap={this.removeEventMarker}
                  key={event.id}/>)
              } else {
                return false;
              }
            })}
          </div>
        </div>
      </div>
    );
  }
}

export default App;
