import React, { Component } from 'react';

class Marker extends Component {
  render() {
    let num_events = this.props.events.length;
    let styles = {
      height: this.props.size ? this.props.size : (num_events > 1 ? '30px' : '20px'), 
      width: this.props.size ? this.props.size : (num_events > 1 ? '30px' : '20px'), 
      lineHeight: num_events > 1 ? '30px' : '20px',
      backgroundColor: num_events > 1 ? 'rgba(226, 120, 0, 1)' : num_events < 1 ? 'purple' : 'rgba(226, 120, 0, 1)',
      zIndex: num_events
    }
    let hoverStyles = {
      height: num_events > 1 ? '40px' : '30px', 
      width: num_events > 1 ? '40px' : '30px', 
      lineHeight: num_events > 1 ? '40px' : '30px',
      backgroundColor: '#E85829',
      zIndex: 999
    }
    return (
      <div 
        className={this.props.text === "Current_Position" ? "user-marker map-marker" : "map-marker"}
        style={this.props.$hover ? hoverStyles : styles}
        data-toggle="modal" data-target="#eventsModal">

        {num_events > 1 ? num_events : ''}

      </div>
    );
  }
}


export default Marker;
