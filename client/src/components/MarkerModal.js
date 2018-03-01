import React, { Component } from 'react';
import '../App.css';

class MarkerModal extends Component {

  constructor(props) {
    super(props);
    this.props = props;
    this.state = {
      events: props.events,
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
    let venueList = e.target.parentNode.getElementsByClassName('venue-events-list')[0];
    venueList.classList.toggle('collapsed');
  }

  render() {
    // console.log(this.props.events);
    let events = [];
    const handleVenueClick = this.handleVenueClick;
    const getTagColor = this.getTagColor;
    if (this.state.modalGroupBy === 'events') {
      events = this.props.events.map((event, i) => {
        return (
          <a className="list-group-item list-group-item-action flex-column align-items-start" href="#/" key={event.id}>
            <h5 className="mb-1">{event.title}</h5>
            <div className="d-flex w-100  justify-content-between">
              <p className="mb-0">{event.venue.name}</p>
              <p className="mb-0">{event.time} | {new Date(event.date).toDateString()}</p>
            </div>
{/*            <div className="mt-2">
              {event.tags.map((tag) => {
                let color = getTagColor(tag.id);
                return (<div className="tag" style={{ backgroundColor: `rgba(${color[0]},${color[1]},${color[2]}, ${color[3]})` }} key={tag.id}>{tag.tag}</div>);
              })}
            </div>*/}
          </a>)
      })
    } else if (this.state.modalGroupBy === 'venues') {
      events = this.sortByVenue(this.props.events).map((venue, i) => {
        return (
          <div className="list-group-item list-group-item-action flex-column align-items-start" onClick={(e) => handleVenueClick(e)} key={i}>
            <h5 className="mb-1">{venue.name}</h5>
            <div className="list-group venue-events-list collapsed">
              {venue.events.map((event, j) => {
                return (<a className="list-group-item list-group-item-action flex-column align-items-start" href="#/" key={event.id}>
                  <h5 className="mb-1">{event.title}</h5>
                  <div className="d-flex w-100  justify-content-between">
                    <p className="mb-0">{event.venue.name}</p>
                    <p className="mb-0">{event.time} | {new Date(event.date).toDateString()}</p>
                  </div>
      {/*            <div className="mt-2">
                    {event.tags.map((tag) => {
                      let color = getTagColor(tag.id);
                      return (<div className="tag" style={{ backgroundColor: `rgba(${color[0]},${color[1]},${color[2]}, ${color[3]})` }} key={tag.id}>{tag.tag}</div>);
                    })}
                  </div>*/}
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


  getTagColor(id) {
    const COLORS = [
      [181,137,0],
      [203,75,22],
      [220,50,47],
      [211,54,130],
      [108,113,196],
      [38,139,210],
      [42,161,152],
      [133,153,0],
    ];
    let opacity = (20 - Math.ceil(id / COLORS.length)) / 20;
    return [...COLORS[id % COLORS.length], opacity];
  }
}

export default MarkerModal;
