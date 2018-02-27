import React, { Component } from 'react';
import '../App.css';

class Marker extends Component {

  constructor(props) {
    super(props);
    this.props = props;
    this.state = {
      events: props.events,
      opacity: 0
    }
  }

  componentDidMount() {
    // setTimeout(() => {
    this.setState({opacity: 1});
    // }, 100);
  }

  componentWillUnmount() {
    this.setState({opacity: 0});
  }

  render() {
    let num_events = this.props.events.length;
    let styles = {
      height: this.props.size ? this.props.size : (num_events > 1 ? '30px' : '20px'), 
      width: this.props.size ? this.props.size : (num_events > 1 ? '30px' : '20px'), 
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
        onClick={() => this.props.onMarkerClick(this.props.events)}
        style={this.props.$hover ? hoverStyles : styles}
        data-toggle="modal" data-target="#eventsModal">

        {num_events > 1 ? num_events : ''}


      </div>
    );
  }
}

export default Marker;
