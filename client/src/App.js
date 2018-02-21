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
        days: [0,1,2,3,4,5,6],
      },
      showEvents: false,
      showFilters: false,
      pageCover: false,
      error: {
        isError: false,
        message: '',
      },
      loadingMessages: []
    };
    this.addEventMarker = this.addEventMarker.bind(this);
    this.removeEventMarker = this.removeEventMarker.bind(this);
    this.handleEventClick = this.handleEventClick.bind(this);
  }

  componentDidMount() {
    this.setState({ pageCover: true });
    this.getEvents()
      .then(res => this.setState({ all_events: res.result, events: res.result }))
      .then(() => this.setState({ pageCover: false }))
      .catch(err => this.setState({error: {isError: true, message: err}}));
  }

  getEvents = async () => {
    let t0 = performance.now();
    console.log('gettings events');
    const response = await fetch('/api/events/');
    const body = await response.json();
    let t1 = performance.now();
    console.log(body.result.length + ' events found in ' + ((t1 - t0) / 1000) + ' seconds');
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
    console.log(days_filter);
    let value = parseInt(e.target.value, 10);
    if (days_filter.indexOf(value) > -1) {
      days_filter.splice(days_filter.indexOf(value), 1);
    } else {
      days_filter.push(value);
    }
    console.log(days_filter);

    let all_events = this.state.all_events;
    let events = [];
    for (let i=0; i < all_events.length; i++) {
      let date_parts = all_events[i].event_date.split('-');
      let date = new Date(date_parts[0], date_parts[1] - 1, date_parts[2].substring(0,2));
      let day = date.getDay();
      for (let j=0; j < days_filter.length; j++) {
        if (day === days_filter[i]) {
          events.push(all_events[i]);
          break;
        }
      }
    }

    this.setState({ filter: {days: days_filter}, events });
  }

  render() {
    let showEvents = this.state.showEvents;
    let showFilters = this.state.showFilters;
    let loading_bars = [];
    for (let i=0; i < 10; i++) {
      loading_bars.push(<div className="bar" key={i}></div>);
    }
    let error = '';
    if (this.state.error.isError) {
      error = <div className="alert alert-danger" role="alert">{this.state.error.message}</div>
    }
    let filter = this.state.filter;
    let filter_function = this.filter.bind(this);
    return (
      <div className="App row app-row">
        {error}
        <div className="page-cover" style={{display: this.state.pageCover ? 'block' : 'none'}} >
          <div id="bars">{loading_bars}<h6>&nbsp;</h6></div>
        </div>
        <div className="control-btns">
          <button className="btn btn-primary btn-block" data-toggle="button" aria-pressed={this.state.showEvents} onClick={() => this.setState({ showEvents: !this.state.showEvents }) }>Toggle Events</button>
          <button className="btn btn-success btn-block" data-toggle="button" aria-pressed={this.state.showFilters} onClick={() => this.setState({ showFilters: !this.state.showFilters }) }>Toggle Filters</button>
        </div>
        <div className="cards-container" style={{ right: showEvents ? 0 : '-400px' }}>
          {this.state.events.map((event, i) => {
            return (<Event 
              event={event} 
              onClick={this.handleEventClick} 
              addEventToMap={this.addEventMarker}
              removeEventFromMap={this.removeEventMarker}
              key={event.id}/>)
          })}
        </div>
        <div className="filter-container" style={{ bottom: showFilters ? 0 : '-100px', width: showEvents ? 'calc(100% - 400px)' : '100%' }}>
          
          <div className="row filter-days-btns">
            {['S','M','T','W','Th','F','S'].map((day, i) => {
              return (
                <button className={filter.days.indexOf(1) > -1 ? 'btn btn-secondary active' : 'btn btn-secondary'} data-toggle="buttons" key={i} value={i} onClick={filter_function} aria-pressed={filter.days.indexOf(1) > -1} autoComplete="off">
                  {day}
                </button>
              )
            })}
            

          </div>

        </div>
        <div className="map-container">
          <Map 
            ref="map"
            pageCover={(pageCover) => this.setState({pageCover})} />
        </div>
      </div>
    );
  }
}

export default App;
