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
    this.apiKey = 'AIzaSyDgTT27dxGtMUKso84YXTvAV48x9923pO8';
    this.handleChange = this.handleChange.bind(this);
    this.handleZoomAnimationStart = this.handleZoomAnimationStart.bind(this);
    this.handleZoomAnimationEnd = this.handleZoomAnimationEnd.bind(this);
    this.customMapsAPICode = this.customMapsAPICode.bind(this);
  }

  componentDidMount() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        let currentLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        }
        this.props.setCurrentLocation(currentLocation);
        this.props.updateCircleCenter(currentLocation);
      });
    }
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
    let map = e.map;
    let maps = e.maps;
    this.props.setMap(map);
    let circle = new maps.Circle({
      center: this.props.currentLocation || this.props.window.center,
      map: map,
      radius: 1609.3 * this.props.settings.radius,    // 10 miles in metres
      fillColor: 'rgba(0,100,200,0.2)',
      strokeColor: 'rgba(0,100,200,0.5)',
      strokeWeight: 1
    });
    this.props.setCircle(circle);
  }

  render() {
    let bounds = this.props.window.bounds;
    return (
      <GoogleMapReact
        bootstrapURLKeys={{key: this.apiKey}} 
        zoom={this.props.window.zoom || 10}
        center={this.props.window.center}
        resetBoundsOnResize={true}
        onChange={this.handleChange}
        onZoomAnimationStart={this.handleZoomAnimationStart}
        onZoomAnimationEnd={this.handleZoomAnimationEnd}
        onChildClick={(i, marker) => this.props.setWindowCenter({lat: marker.lat, lng: marker.lng})}
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
    // window: {
    //   center: { lat: 34.0522, lng: -118.2437 },
    //   zoom: 10,
    //   bounds: {},
    // }
  }
}

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
    calculateClusters: (events, zoom) => dispatch(actions.calculateClusters(events, zoom)),
  };
}


export default connect(mapStateToProps, mapDispatchToProps)(Map);
