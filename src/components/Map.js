import React, { Component } from 'react';
import GoogleMapReact from 'google-map-react';
import Marker from './Marker';


class Map extends Component {

  apiKey = 'AIzaSyCigiwmfCiD-kZ6kMlBw5naF17Z8yVn9Js&v=3.34';

  constructor(props) {
    super(props);
    this.state = {
      map: null,
      bounds: {}
    }
  }

  handleChange = (change) => {
    const bounds = change.bounds;
    this.setState({ bounds });
  }

  customMapsAPICode = (e) => {
    this.setState({ map: e.map });
  }

  openCluster = (marker) => {
    this.props.onMarkerClick(marker.events);
  }

  render() {
    const OPTIONS = {
      minZoom: 5,
      maxZoom: 16,
      disableDefaultUI: true,
      styles: customStyles,
    }
    // console.log('BOUNDS:',this.state.bounds);
    return (
      <GoogleMapReact
        bootstrapURLKeys={{key: this.apiKey}} 
        zoom={this.props.zoom}
        center={this.props.center}
        options={OPTIONS}
        resetBoundsOnResize={true}
        gestureHandling='greedy'
        onChange={this.handleChange}
        onZoomAnimationEnd={() => this.props.onZoom(this.state.map.zoom)}
        onChildClick={(i, marker) => {this.openCluster(marker)}}
        onClick={this.props.onClick}
        onGoogleApiLoaded={this.customMapsAPICode}
        yesIWantToUseGoogleMapApiInternals={true}>

        {this.props.clusters.reduce((result, cluster) => {
          // console.log('CLUSTER:',cluster);
          // if (cluster.lat > this.state.bounds.ne.lat || cluster.lat < this.state.bounds.se.lat || cluster.lng > this.state.bounds.ne.lng || cluster.lng < this.state.bounds.nw.lng) {
          //   return result;
          // }
          result.push(<Marker lat={cluster.lat}  lng={cluster.lng} events={cluster.events} key={cluster.lat + cluster.lng} />);
          return result;
        }, [])}
        {/* {this.props.currentLocation && (<Marker lat={this.props.currentLocation.lat}  lng={this.props.currentLocation.lng} text="Current_Position" size="5px" events={[]} />)} */}


      </GoogleMapReact>
    );
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



export default Map;
