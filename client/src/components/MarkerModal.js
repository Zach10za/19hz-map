import React, { Component } from 'react';
import { connect } from 'react-redux';
import '../App.css';

class MarkerModal extends Component {

  constructor(props) {
    super(props);
    this.props = props;
    this.state = {
      modalGroupBy: 'events',
    }
  }

  sortByVenue(events) {
    // sort events venue
    let venues = [];
    for (let i=0; i < this.props.events.length; i++) {
      let event = this.props.events[i];
      let venue_exists = false;
      for (let j=0; j < venues.length; j++) {
        if (venues[j].place_id === event.venue.place_id) {
          venues[j].events.push(event);
          venue_exists = true;
          break;
        }
      }
      if (!venue_exists) {
        let venue = event.venue;
        venue.events = [event];
        venues.push(venue);
      }
    }
    return venues;
  }

  handleVenueClick(e) {
    try {
      let venueList = e.target.parentNode.getElementsByClassName('venue-events-list')[0];
      venueList.classList.toggle('collapsed');
    } catch(err) {
      console.error("EVENT ERR:", err);
    }
  }

  render() {
    let events = [];
    const handleVenueClick = this.handleVenueClick;
    if (this.state.modalGroupBy === 'events') {
      events = this.props.modalEvents.map((event, i) => {
        return (
          <a className="list-group-item list-group-item-action flex-column align-items-start" target="_blank" href={event.link} key={event.id}>
            <h5 className="mb-1">{event.title}</h5>
            <div className="d-flex w-100  justify-content-between">
              <p className="mb-0">{event.venue.name}</p>
              <p className="mb-0">{event.time} | {new Date(event.date).toDateString()}</p>
            </div>
            <div className="mt-2">
              {event.tags.map((tag, i) => {
                return (<div className="tag" style={{ backgroundColor: '#2364ce' }} key={i}>{tag}</div>);
              })}
              {event.organizers.map((organizer, i) => {
                return (<div className="tag" style={{ backgroundColor: '#00a9ff' }} key={i}>{organizer}</div>);})}
            </div>
          </a>)
      })
    } else if (this.state.modalGroupBy === 'venues') {
      events = this.sortByVenue(this.props.modalEvents).map((venue, i) => {
        let price = '';
        if (venue.price) for (let x=0; x < venue.price; x++) price += '$';
        return (
          <div className="list-group-item list-group-item-action flex-column align-items-start" onClick={(e) => handleVenueClick(e)} key={i}>
            <div className="d-flex w-100 justify-content-between">
              <h5 className="mb-1">{venue.name}<small className="text-muted">{ price ? ` (${price})` : ''}</small></h5>
              <p className="mb-1">{venue.rating}</p>
            </div>
            <div className="list-group venue-events-list collapsed">
              {venue.events.map((event, j) => {
                return (<a className="list-group-item list-group-item-action flex-column align-items-start" target="_blank" href={event.link} onClick={(e) => e.stopPropagation()} key={event.id}>
                  <h5 className="mb-1">{event.title}</h5>
                  <div className="d-flex w-100 justify-content-between">
                    <p className="mb-0">{event.venue.name}</p>
                    <p className="mb-0">{event.time} | {new Date(event.date).toDateString()}</p>
                  </div>
                  <div className="mt-2">
                    {event.tags.map((tag, i) => {
                      return (<div className="tag" style={{ backgroundColor: '#2364ce' }} key={i}>{tag}</div>);
                    })}
                    {event.organizers.map((organizer, i) => {
                      return (<div className="tag" style={{ backgroundColor: '#00a9ff' }} key={i}>{organizer}</div>);})}
                  </div>
                </a>)
              })}
            </div>
          </div>)
      })
    }
    return (
      <div className="modal fade" id="eventsModal" tabIndex="-1" role="dialog" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered" role="document">
          <div className="modal-content">

            <div className="modal-header">

              <div className="btn-group btn-group-toggle">
                <label className={this.state.modalGroupBy === 'events' ? "btn btn-info active" : "btn btn-info"}>
                  <input onChange={() => this.setState({ modalGroupBy: 'events' })} type="radio" name="options" id="group-by-event" autoComplete="off" checked={this.state.modalGroupBy === 'events' ? true : false}/> Event
                </label>
                <label className={this.state.modalGroupBy === 'venues' ? "btn btn-info active" : "btn btn-info"}>
                  <input onChange={() => this.setState({ modalGroupBy: 'venues' })} type="radio" name="options" id="group-by-venue" autoComplete="off" checked={this.state.modalGroupBy === 'venues' ? true : false}/> Venue
                </label>
              </div>

              <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">&times;</span>
              </button>
            </div>

            <div className="modal-body">
              <div className="list-group">
              {events}
              </div>
            </div>

          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    modalEvents: state.modalEvents,
  };
}

const mapDispatchToProps = (dispatch) => {
  return {};
}

export default connect(mapStateToProps, mapDispatchToProps)(MarkerModal);