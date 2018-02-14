import React, { Component } from 'react';
import '../App.css';

class Marker extends Component {

  constructor(props) {
    super(props);
    this.props = props;
    this.state = {
      events: props.events,
      infowindow: false,
    }
  }

  openInfoWindow(a,b,c) {
    this.setState({ infowindow: true });
  }

  closeInfoWindow(e) {
    e.stopPropagation();
    this.setState({ infowindow: false });
  }

  render() {
    let size_multiplier = this.props.$hover ? 16 : 8;
    return (
      <div 
        className="map-marker"
        onClick={this.openInfoWindow.bind(this)}
        style={{height: size_multiplier + (this.props.events.length / 2) + 'px', width: size_multiplier + (this.props.events.length / 2) + 'px', zIndex: this.props.events.length}}>
        
        <ul 
          className="infowindow list-group" 
          onClick={this.closeInfoWindow.bind(this)}
          style={{ display: this.state.infowindow ? 'block' : 'none' }}>
          <h4 className="list-group-item">{this.state.events[0].venue.name}</h4>
          {this.state.events.map((event, i) => {
            return (<li className="list-group-item" key={i}>{event.title}</li>);
          })}
        </ul>

      </div>
    );
  }
}

export default Marker;
