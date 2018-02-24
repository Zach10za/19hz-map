import React, { Component } from 'react';
import GoogleMapReact from 'google-map-react';
// import {latLng2Tile} from 'google-map-react/utils';
import Marker from './Marker.js';
import '../App.css';

class Map extends Component {

  constructor(props) {
    super(props);
    this.state = {
      // center: { lat: 34.0522, lng: -118.2437 },
      // zoom: 10,
      events: [],
      apiKey: 'AIzaSyDgTT27dxGtMUKso84YXTvAV48x9923pO8',
      markers: [],
      clusters: [],
      currentLocation: null,
      window: {
        center: { lat: 34.0522, lng: -118.2437 },
        zoom: 10,
        bounds: {},  
      },
      shouldUpdate: true,
    };
    this.calculateClusters = this.calculateClusters.bind(this);
    this.updateCircleRadius = this.updateCircleRadius.bind(this);
    this.updateCircleCenter = this.updateCircleCenter.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleZoomAnimationStart = this.handleZoomAnimationStart.bind(this);
    this.handleZoomAnimationEnd =this.handleZoomAnimationEnd.bind(this);
    this.customMapsAPICode =this.customMapsAPICode.bind(this);
  }

  componentDidMount() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        let currentLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        }
        this.setState({currentLocation});
        if (this.state.circle) {
          this.updateCircleCenter(currentLocation);
        }
      });
    }
    // this.calculateClusters(this.state.window.zoom);
  }

  getCurrentLocation() {
    return this.state.currentLocation || this.state.window.center;
  }

  calculateClusters(zoom = this.state.window.zoom) {
    let events = this.state.events;
    let clusters = [];

    let distance_map = [1,1,1,1,1,1,1,1,0.5,0.3,0.15,0.05,0.02,0.008,0.004,0.001,0.0000001,0.00000001,0.00000001,0.00000001,0.00000001,0.00000001,0.00000001,0.00000001];
    let distance = distance_map[zoom];

    // console.log(zoom, distance);

    for (let i=0; i < events.length; i++) {

      if (!events[i].venue.location.lat || !events[i].venue.location.lng) break;

      let new_cluster = {};
      new_cluster.events = [events[i]];
      new_cluster.lat = events[i].venue.location.lat;
      new_cluster.lng = events[i].venue.location.lng;

      let closest = {index: -1, distance: 999};

      for (let j=0; j < clusters.length; j++) {
        let lat_distance = Math.abs(clusters[j].lat - new_cluster.lat);
        let lng_distance = Math.abs(clusters[j].lng - new_cluster.lng);

        if (lat_distance < distance && lng_distance < distance) {
          if (lat_distance + lng_distance < closest.distance ) {
            closest.index = j;
            closest.distance = lat_distance + lng_distance;
          }
        }
      }
      if (closest.index > -1) {
        new_cluster.events = [...new_cluster.events, ...clusters[closest.index].events];
        let sum_lat = 0;
        let sum_lng = 0;
        for (let x=0; x < clusters[closest.index].events.length; x++) {
          sum_lat += parseFloat(clusters[closest.index].events[x].venue.location.lat);
          sum_lng += parseFloat(clusters[closest.index].events[x].venue.location.lng);
        }
        new_cluster.lat = sum_lat / clusters[closest.index].events.length;
        new_cluster.lng = sum_lng / clusters[closest.index].events.length;

        clusters.splice(closest.index, 1);
      }

      clusters.push(new_cluster);

    }

    this.setState({ clusters: clusters, shouldUpdate: true });
  }

  setMarkers(events) {
    this.setState({ events, shouldUpdate: false }, this.calculateClusters);
  }

  showMarker(center) {
    let window = {
      center: { lat:parseFloat(center.lat), lng: parseFloat(center.lng)},
      zoom: this.state.window.zoom,
      bounds: this.state.window.bounds
    };
    this.setState({ window });
  }

  handleChange(change) {
    let window = {
      center: change.center,
      zoom: change.zoom,
      bounds: change.bounds
    };
    this.setState({ window, shouldUpdate: this.state.window.zoom === change.zoom });

  }

  handleZoomAnimationStart(e) {
    this.setState({ clusters: [] });
  }

  handleZoomAnimationEnd(e) {
      this.calculateClusters(this.state.window.zoom);
  }

  shouldComponentUpdate(nextProps, nextState) {
    return nextState.shouldUpdate;
  }

  updateCircleRadius(radius) {
    let circle = this.state.circle;
    circle.setRadius(1609.3 * radius);
    this.setState({ circle });
  }

  updateCircleCenter(center) {
    let circle = this.state.circle;
    circle.setCenter(center);
    this.setState({ circle });
  }

  customMapsAPICode(e) {
    let map = e.map;
    let maps = e.maps;
    console.log('drawing circle');
    let circle = new maps.Circle({
      center: this.state.currentLocation || this.state.window.center,
      map: map,
      radius: 1609.3 * this.props.getFilterRadius(),    // 10 miles in metres
      fillColor: 'rgba(0,100,200,0.3)',
      strokeColor: 'rgba(0,100,200,0.5)',
      strokeWeight: 1
    });
    this.setState({ circle });
  }

  render() {
    let bounds = this.state.window.bounds;
    return (
      <GoogleMapReact
        bootstrapURLKeys={{key: this.state.apiKey}} 
        zoom={this.state.window.zoom || 10}
        center={this.state.window.center}
        resetBoundsOnResize={true}
        onChange={this.handleChange}
        onZoomAnimationStart={this.handleZoomAnimationStart}
        onZoomAnimationEnd={this.handleZoomAnimationEnd}
        onChildClick={(i, marker) => this.showMarker({lat: marker.lat, lng: marker.lng})}
        onGoogleApiLoaded={this.customMapsAPICode}
        yesIWantToUseGoogleMapApiInternals={true} >
        {this.state.clusters.map((cluster, i) => {
          if (cluster.lat > bounds.ne.lat || cluster.lat < bounds.se.lat || cluster.lng > bounds.ne.lng || cluster.lng < bounds.nw.lng) {
            return false;
          } else {
            return (<Marker lat={cluster.lat}  lng={cluster.lng} text={cluster.text} events={cluster.events} key={i} />);
          }
        })}
        {this.state.currentLocation && (<Marker lat={this.state.currentLocation.lat}  lng={this.state.currentLocation.lng} text="Current_Position" size="5px" events={[]} />)}

      </GoogleMapReact>
    );
  }
}

export default Map;
