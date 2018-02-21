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
    }, 250);
  }

  componentWillUnmount() {
    this.setState({opacity: 0});
  }

  openInfoWindow(a,b,c) {
    // this.setState({ infowindow: true });
  }

  closeInfoWindow(e) {
    e.stopPropagation();
    // this.setState({ infowindow: false });
  }

  render() {
    let num_events = this.props.events.length;
    let styles = {
      height: num_events > 1 ? '30px' : '20px', 
      width: num_events > 1 ? '30px' : '20px', 
      lineHeight: num_events > 1 ? '30px' : '20px',
      backgroundColor: num_events > 1 ? '#2D7FE8' : '#00A6FF',
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
        className="map-marker"
        onClick={this.openInfoWindow.bind(this)}
        style={this.props.$hover ? hoverStyles : styles}>
          {num_events > 1 ? num_events : ''}
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
