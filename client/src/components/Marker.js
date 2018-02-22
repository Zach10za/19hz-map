import React, { Component } from 'react';
import '../App.css';

class Marker extends Component {

  constructor(props) {
    super(props);
    this.props = props;
    this.state = {
      events: props.events,
      infowindow: false,
      opacity: 0
    }
  }

  componentDidMount() {
    setTimeout(() => {
      this.setState({opacity: 1});
    }, 100);
  }

  componentWillUnmount() {
    this.setState({opacity: 0});
  }

  openInfoWindow(a,b,c) {
    this.setState({ infowindow: true });
  }

  closeInfoWindow(e) {
    e.stopPropagation();
    this.setState({ infowindow: false });
  }

  render() {
    let num_events = this.props.events.length;
    let styles = {
      height: num_events > 1 ? '30px' : '20px', 
      width: num_events > 1 ? '30px' : '20px', 
      lineHeight: num_events > 1 ? '30px' : '20px',
      backgroundColor: num_events > 1 ? '#2D7FE8' : num_events < 1 ? 'purple' : '#00A6FF',
      opacity: this.state.opacity,
      zIndex: num_events
    }
    let hoverStyles = {
      height: num_events > 1 ? '40px' : '30px', 
      width: num_events > 1 ? '40px' : '30px', 
      lineHeight: num_events > 1 ? '40px' : '30px',
      backgroundColor: '#E85829',
      opacity: this.state.opacity,
      zIndex: 999
    }
    return (
      <div 
        className={this.props.text === "Current_Position" ? "user-marker map-marker" : "map-marker"}
        onClick={this.openInfoWindow.bind(this)}
        style={this.props.$hover ? hoverStyles : styles}>
          {num_events > 1 ? num_events : ''}
{/*        <ul 
          className="infowindow list-group" 
          onClick={this.closeInfoWindow.bind(this)}
          style={{ display: this.state.infowindow ? 'block' : 'none' }}>
          {this.state.events.map((event, i) => {
            return (<li className="list-group-item" key={i}>{event.title}</li>);
          })}
        </ul>*/}

        <div className="infowindow list-group" onClick={this.closeInfoWindow.bind(this)} style={{ display: this.state.infowindow ? 'block' : 'none' }} >
          {this.state.events.map((event, i) => {
            return (
              <a className="list-group-item list-group-item-action flex-column align-items-start" href="#/" key={event.id}>
                <h5 className="mb-1">{event.title}</h5>
                <p className="mb-1">{event.venue.name}</p>
                <div className="d-flex w-100 justify-content-between">
                  <small>{event.time}</small>
                  <small>{event.date}</small>
                </div>
              </a>)
          })}
        </div>

      </div>
    );
  }
}

export default Marker;
