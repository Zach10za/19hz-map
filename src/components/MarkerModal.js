import React, { Component } from 'react';
import { connect } from 'react-redux';
import '../App.css';
const actions = require('../actions/index');

class MarkerModal extends Component {

  constructor(props) {
    super(props);
    this.props = props;
    this.state = {
      modalGroupBy: 'events',
    }
    this.zoomOnMarker = this.zoomOnMarker.bind(this);
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

  zoomOnMarker(event) {
    this.props.setWindowCenter(event.venue.location);
    this.props.setWindowZoom(16);
  }

  render() {
    return (
      <div className="modal fade" id="eventsModal" tabIndex="-1" role="dialog" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered" role="document">
          <div className="modal-content">

            <div className="modal-header">
              <h5 className="mb-0">Events</h5>
              <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">&times;</span>
              </button>
            </div>

            <div className="modal-body">
              <div id="events_list" className="list-group">
              {this.props.modalEvents.map((event, i) => {
                return (
                  <div className="list-group-item" key={event.id}>

                    <div className="d-flex mb-2">
                      {(event.age) ? <div className="event-age">{event.age}</div> : ''}
                      {(event.price) ? <div className="event-price">{event.price}</div> : ''}
                      <div className="ml-auto event-date">
                        <span className="event-time">{event.time}</span>
                        {new Date(event.date).toLocaleDateString("en-US")}
                      </div>

                    </div>

                    <div className="d-flex mb-1">
                      <h5 className="mb-0">
                        {event.title}
                      </h5>
                    </div>

                    <div className="d-flex align-items-center">
                      <p className="mb-0">
                        {event.venue.name}
                      </p>
                      <div className="ml-auto">
                        <p className="card-text">
                          <a className="btn btn-outline-secondary btn-sm mr-1" target="_blank" title="event link" href={event.link}><i className="fas fa-external-link-alt"></i></a>
                          {(event.facebook) ? <a className="btn btn-outline-secondary btn-sm mr-1" target="_blank" title="facebook" href={event.facebook}><i className="fab fa-facebook-square"></i></a> : ''}
                          {(event.venue.location.lat !== 0 && event.venue.location.lat !== 0) ? (<button className="btn btn-outline-secondary btn-sm mr-1" title="view on map" data-dismiss="modal" aria-label="Close" onClick={() => {this.zoomOnMarker(event)}}><i className="fas fa-map-marker-alt"></i></button>) : ''}
                          {(event.venue.place_id) ? <a className="btn btn-outline-secondary btn-sm mr-1" target="_blank" title="view on google maps" href={"https://www.google.com/maps/place/?q=place_id:" + event.venue.place_id}><i className="fas fa-compass"></i></a> : ''}
                        </p>
                      </div>
                    </div>

                    <div className="mt-0">
                      {event.organizers.map((organizer, i) => {
                        return (<small className="text-muted tag" key={i}>{organizer}, </small>);
                      })}
                      {event.tags.map((tag, i) => {
                        return (<small className="text-muted tag" key={i}>{tag}, </small>);
                      })}
                    </div>
                  </div>)
              })}
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
  return {
    setWindowCenter: (center) => dispatch(actions.setWindowCenter(center)),
    setWindowZoom: (zoom) => dispatch(actions.setWindowZoom(zoom)),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(MarkerModal);