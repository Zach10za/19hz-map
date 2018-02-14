import React, { Component } from 'react';
import GoogleMapReact from 'google-map-react';
import Marker from './Marker.js';
import '../App.css';

class Map extends Component {

  constructor(props) {
    super(props);
    this.state = {
      center: { lat: 34.0522, lng: -118.2437 },
      zoom: 10,
      apiKey: 'AIzaSyDgTT27dxGtMUKso84YXTvAV48x9923pO8',
      markers: [],
    };
  }

  componentDidMount() {

  }

  addMarker(marker) {
    let markers = this.state.markers;
    let new_marker = {
      events: [marker.event],
      lat: marker.lat,
      lng: marker.lng,
      text: marker.text,
    };
    for (let i=0; i < markers.length; i++) {
      if (marker.lat === markers[i].lat && marker.lng === markers[i].lng) {
        new_marker.events.push(...markers[i].events);
        markers.splice(i, 1);
        break;
      }
    } 
    markers.push(new_marker);
    this.setState({ markers });
  }

  setMarkers(markers) {
    for (let i=0; i < markers.length; i++) {
      this.addMarker(markers[i]);
    }
  }

  removeMarker(marker) {
    let markers = this.state.markers;
    for (let i=0; i < markers.length; i++) {
      if (marker.lat === markers[i].lat && marker.lng === markers[i].lng) {
        if (markers[i].events.length > 1) {
          for (let j=0; j < markers[i].events.length; j++) {
            if (markers[i].events[j].id === marker.event.id) {
              markers[i].events.splice(j, 1);
              break;
            }
          }
        } else {
          markers.splice(i, 1);
        }
        break;
      }
    } 
    this.setState({ markers });
  }

  showMarker(center) {
    this.setState({
      zoom: 13,
      center: {
        lat: parseFloat(center.lat),
        lng: parseFloat(center.lng),
      },
    });
  }


  render() {
    return (
      <GoogleMapReact
        bootstrapURLKeys={{key: this.state.apiKey}} 
        zoom={this.state.zoom}
        center={this.state.center}
        onChildClick={(i, marker) => this.showMarker({lat: marker.lat, lng: marker.lng})}>

        {this.state.markers.map((marker, i) => {
          return (
            <Marker
              lat={marker.lat} 
              lng={marker.lng} 
              text={marker.text}
              events={marker.events}
              key={i} />
              );
        })}
      </GoogleMapReact>
    );
  }
}

export default Map;
