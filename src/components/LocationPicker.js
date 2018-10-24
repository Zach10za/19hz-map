import React, { Component } from 'react';

class LocationPicker extends Component {
  render() {
    return (
      <div className="location-picker-container">
        <div className="location-picker">
          <button onClick={() => this.props.pickLocation(0)}>All</button>
          <button onClick={() => this.props.pickLocation(1)}>San Francisco</button>
          <button onClick={() => this.props.pickLocation(2)}>Los Angeles</button>
          <button onClick={() => this.props.pickLocation(3)}>Atlanta</button>
          <button onClick={() => this.props.pickLocation(4)}>Texas</button>
          <button onClick={() => this.props.pickLocation(5)}>Miami</button>
          <button onClick={() => this.props.pickLocation(6)}>Phoenix</button>
          <button onClick={() => this.props.pickLocation(7)}>Massachusetts</button>
        </div>
      </div>
    );
  }
}


export default LocationPicker;
