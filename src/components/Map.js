import React, { Component } from 'react';
import { connect } from 'react-redux';
import GoogleMapReact from 'google-map-react';
// import {latLng2Tile} from 'google-map-react/utils';
import Marker from './Marker.js';

import '../App.css';
const actions = require('../actions/index');


class Map extends Component {


  constructor(props) {
    super(props);
    this.apiKey = 'AIzaSyCigiwmfCiD-kZ6kMlBw5naF17Z8yVn9Js&v=3.31';
    this.handleChange = this.handleChange.bind(this);
    this.handleZoomAnimationStart = this.handleZoomAnimationStart.bind(this);
    this.handleZoomAnimationEnd = this.handleZoomAnimationEnd.bind(this);
    this.customMapsAPICode = this.customMapsAPICode.bind(this);
  }

  handleChange(change) {
    this.props.setWindowCenter(change.center);
    if (this.props.window.zoom !== change.zoom) {
      this.props.setWindowZoom(change.zoom);
    }
    this.props.setWindowBounds(change.bounds);

  }

  handleZoomAnimationStart(e) {
    this.props.setClusters([]);
  }

  handleZoomAnimationEnd(e) {
    this.props.calculateClusters(this.props.currentEvents, this.props.window.zoom);
  }

  customMapsAPICode(e) {
    this.props.setMap(e.map);
    this.props.setMaps(e.maps);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        let currentLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        }
        this.props.setCurrentLocation(currentLocation);
        let circle = new this.props.maps.Circle({
          center: currentLocation,
          map: this.props.map,
          radius: 1609.3 * this.props.settings.radius,
          fillColor: 'rgba(0,100,200,0.2)',
          strokeColor: 'rgba(0,100,200,0.5)',
          strokeWeight: 1
        });
        this.props.setCircle(circle);
      });
    }
  }

  render() {
    let bounds = this.props.window.bounds;
    let OPTIONS = {
      minZoom: 5,
      maxZoom: 16,
      disableDefaultUI: true,
      styles: customStyles,
    }
    return (
      <GoogleMapReact
        bootstrapURLKeys={{key: this.apiKey}} 
        zoom={this.props.window.zoom || 10}
        center={this.props.window.center}
        options={OPTIONS}
        resetBoundsOnResize={true}
        gestureHandling='greedy'
        onChange={this.handleChange}
        onZoomAnimationStart={this.handleZoomAnimationStart}
        onZoomAnimationEnd={this.handleZoomAnimationEnd}
        onChildClick={(i, marker) => this.props.setWindowCenter({lat: parseFloat(marker.lat,10), lng: parseFloat(marker.lng,10)})}
        onGoogleApiLoaded={this.customMapsAPICode}
        yesIWantToUseGoogleMapApiInternals={true}>

        {this.props.clusters.map((cluster, i) => {
          if (cluster.lat > bounds.ne.lat || cluster.lat < bounds.se.lat || cluster.lng > bounds.ne.lng || cluster.lng < bounds.nw.lng) {
            return false;
          } else {
            return (<Marker lat={cluster.lat}  lng={cluster.lng} text={cluster.text} events={cluster.events} key={i} />);
          }
        })}
        {this.props.currentLocation && (<Marker lat={this.props.currentLocation.lat}  lng={this.props.currentLocation.lng} text="Current_Position" size="5px" events={[]} />)}


      </GoogleMapReact>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    settings: state.settings,
    currentEvents: state.currentEvents,
    clusters: state.clusters,
    circle: state.circle,
    currentLocation: state.currentLocation,
    window: state.window,
    map: state.map,
    maps: state.maps,
    // window: {
    //   center: { lat: 34.0522, lng: -118.2437 },
    //   zoom: 10,
    //   bounds: {},
    // }
  }
}

const customStyles = [
  {
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#242f3e"
      }
    ]
  },
  {
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#746855"
      }
    ]
  },
  {
    "elementType": "labels.text.stroke",
    "stylers": [
      {
        "color": "#242f3e"
      }
    ]
  },
  {
    "featureType": "administrative.locality",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#d59563"
      }
    ]
  },
  {
    "featureType": "poi",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#d59563"
      }
    ]
  },
  {
    "featureType": "poi.attraction",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "poi.business",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "poi.government",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "poi.medical",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "poi.park",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "poi.park",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#263c3f"
      }
    ]
  },
  {
    "featureType": "poi.park",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#6b9a76"
      }
    ]
  },
  {
    "featureType": "poi.place_of_worship",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "poi.school",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "poi.sports_complex",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "road",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#38414e"
      }
    ]
  },
  {
    "featureType": "road",
    "elementType": "geometry.stroke",
    "stylers": [
      {
        "color": "#212a37"
      }
    ]
  },
  {
    "featureType": "road",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#9ca5b3"
      }
    ]
  },
  {
    "featureType": "road.highway",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#746855"
      }
    ]
  },
  {
    "featureType": "road.highway",
    "elementType": "geometry.stroke",
    "stylers": [
      {
        "color": "#1f2835"
      }
    ]
  },
  {
    "featureType": "road.highway",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#f3d19c"
      }
    ]
  },
  {
    "featureType": "transit",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#2f3948"
      }
    ]
  },
  {
    "featureType": "transit.station",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#d59563"
      }
    ]
  },
  {
    "featureType": "water",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#17263c"
      }
    ]
  },
  {
    "featureType": "water",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#515c6d"
      }
    ]
  },
  {
    "featureType": "water",
    "elementType": "labels.text.stroke",
    "stylers": [
      {
        "color": "#17263c"
      }
    ]
  }
]

const mapDispatchToProps = (dispatch) => {
  return {
    setModalEvents: (modalEvents) => dispatch(actions.setModalEvents(modalEvents)),
    setSettingsRadius: (radius) => dispatch(actions.setSettingsRadius(radius)),
    setClusters: (cluster) => dispatch(actions.setClusters(cluster)),
    addCluster: (cluster) => dispatch(actions.addCluster(cluster)),
    updateCircleRadius: (radius) => dispatch(actions.updateCircleRadius(radius)),
    updateCircleCenter: (center) => dispatch(actions.updateCircleCenter(center)),
    setCircle: (circle) => dispatch(actions.setCircle(circle)),
    setSettingsShowCircle: (bool) => dispatch(actions.setSettingsShowCircle(bool)),
    setCurrentLocation: (currentLocation) => dispatch(actions.setCurrentLocation(currentLocation)),
    setWindowCenter: (center) => dispatch(actions.setWindowCenter(center)),
    setWindowZoom: (zoom) => dispatch(actions.setWindowZoom(zoom)),
    setWindowBounds: (bounds) => dispatch(actions.setWindowBounds(bounds)),
    setMap: (map) => dispatch(actions.setMap(map)),
    setMaps: (maps) => dispatch(actions.setMaps(maps)),
    calculateClusters: (events, zoom) => dispatch(actions.calculateClusters(events, zoom)),
  };
}


export default connect(mapStateToProps, mapDispatchToProps)(Map);
