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
      },
      showEvents: false,
    };
    this.addEventMarker = this.addEventMarker.bind(this);
    this.handleEventClick = this.handleEventClick.bind(this);
  }

  componentDidMount() {
    this.getEvents()
      .then(res => this.setState({ all_events: res.result, events: res.result }))
      .catch(err => console.error(err));
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
    let showEvents = this.state.showEvents;
    return (
      <div className="App row">
        <button className="btn btn-primary btn-events" onClick={() => this.setState({ showEvents: !this.state.showEvents }) }>Toggle Events</button>
        <div className={ showEvents ? "col-lg-9" : "col-lg-12" }>
          <div className="map-container" style={{width: showEvents ? '75%' : '100%'}}>
            <Map 
              ref="map" />
          </div>
        </div>
{/*        <div className="col-lg-1">
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
        </div>*/}
        <div className="col-lg-3" style={{display: showEvents ? "block" : "none" }}>
          <div className=" cards-container">
            {this.state.events.map((event, i) => {
              if (i > 100) return false;
              return (<Event 
                event={event} 
                onClick={this.handleEventClick} 
                addEventToMap={this.addEventMarker}
                removeEventFromMap={this.removeEventMarker}
                key={event.id}/>)
            })}
          </div>
        </div>
      </div>
    );
  }
}

export default App;
