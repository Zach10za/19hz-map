import React, { Component } from 'react';
import GoogleMapReact from 'google-map-react';
import Marker from './Marker.js';
import '../App.css';

class Map extends Component {

  constructor(props) {
    super(props);
    this.state = {
      // center: { lat: 34.0522, lng: -118.2437 },
      // zoom: 10,
      apiKey: 'AIzaSyDgTT27dxGtMUKso84YXTvAV48x9923pO8',
      markers: [],
      clusters: [],
      window: {
        center: { lat: 34.0522, lng: -118.2437 },
        zoom: 10,
        bounds: {},  
      }
    };
    this.calculateClusters = this.calculateClusters.bind(this);
  }

  componentDidMount() {
  }

  addMarker(marker) {
    if (marker.lat && marker.lng) {
      let markers = this.state.markers
      let new_marker = {
        events: [marker.event],
        lat: parseFloat(marker.lat),
        lng: parseFloat(marker.lng),
        text: marker.text,
      };
      markers.push(new_marker);
      this.setState({ markers });
    }
    this.calculateClusters(this.state.window.zoom);
  }

  calculateClusters(zoom) {
    let markers = this.state.markers;
    let clusters = [];

    let distance_map = [1,1,1,1,1,1,1,1,0.5,0.3,0.1,0.05,0.008,0.0001,0.00001,0.000005,0.000001,0,0,0,0,0,0,0];
    let distance = distance_map[zoom];

    for (let i=0; i < markers.length; i++) {
      let new_cluster = {};
      new_cluster.events = markers[i].events;
      new_cluster.lat = markers[i].lat;
      new_cluster.lng = markers[i].lng;

      for (let j=0; j < clusters.length; j++) {
        if (Math.abs(clusters[j].lat - new_cluster.lat) < distance + (clusters[j].events.length * 0.001) && Math.abs(clusters[j].lng - new_cluster.lng) < distance + (clusters[j].events.length * 0.001)) {
          new_cluster.events = [...new_cluster.events, ...clusters[j].events];
          let sum_lat = 0;
          let sum_lng = 0;
          for (let x=0; x < clusters[j].events.length; x++) {
            sum_lat += parseFloat(clusters[j].events[x].venue.location.lat);
            sum_lng += parseFloat(clusters[j].events[x].venue.location.lng);
          }
          new_cluster.lat = sum_lat / clusters[j].events.length;
          new_cluster.lng = sum_lng / clusters[j].events.length;

          clusters.splice(j, 1);
          break;
        }
      }
      clusters.push(new_cluster);

    }

    this.setState({ clusters: clusters });
  }

  setMarkers(markers) {
    for (let i=0; i < markers.length; i++) {
      this.addMarker(markers[i]);
    }
  }

  removeMarker(marker) {
    console.log('removing marker');
    let markers = this.state.markers;
    for (let i=0; i < markers.length; i++) {
      if (marker.lat === markers[i].lat && marker.lng === markers[i].lng) {
        markers.splice(i, 1);
        break;
      }
    }
    this.setState({ markers });
    this.calculateClusters(this.state.window.zoom);
  }

  showMarker(center) {
    if (this.state.window.zoom !== 13) {
      this.calculateClusters(13);
    }
    let w = {
      center: { lat:parseFloat(center.lat), lng: parseFloat(center.lng)},
      zoom: 13,
      bounds: this.state.window.bounds
    };
    this.setState({ window: w });
  }

  handleChange(change) {
    let w = {
      center: change.center,
      zoom: change.zoom,
      bounds: change.bounds
    };
    this.setState({ window: w });
  }

  handleZoomAnimationStart(e) {
    this.setState({ clusters: [] });
  }

  handleZoomAnimationEnd(e) {
      this.calculateClusters(this.state.window.zoom);
  }


  render() {
    let bounds = this.state.window.bounds;
    return (
      <GoogleMapReact
        bootstrapURLKeys={{key: this.state.apiKey}} 
        zoom={this.state.window.zoom}
        center={this.state.window.center}
        resetBoundsOnResize={true}
        onChange={this.handleChange.bind(this)}
        onZoomAnimationStart={this.handleZoomAnimationStart.bind(this)}
        onZoomAnimationEnd={this.handleZoomAnimationEnd.bind(this)}
        onChildClick={(i, marker) => this.showMarker({lat: marker.lat, lng: marker.lng})}>

        {this.state.clusters.map((cluster, i) => {
          if (cluster.lat > bounds.ne.lat || cluster.lat < bounds.se.lat || cluster.lng > bounds.ne.lng || cluster.lng < bounds.nw.lng) {
            return false;
          } else {
            return (<Marker lat={cluster.lat}  lng={cluster.lng} text={cluster.text} events={cluster.events} key={i} />);
          }
        })}

      </GoogleMapReact>
    );
  }
}

export default Map;
