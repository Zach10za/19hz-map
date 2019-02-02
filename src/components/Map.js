import React, { Component } from "react";
import { connect } from "react-redux";
import styled from "styled-components";
import { setZoom, setDrawer } from "../actions";
import GoogleMapReact from "google-map-react";
import Marker from "./Marker";
import { calculateClusters } from "../utils";

const MapContainer = styled.div`
  width: 100%;
  height: ${props => (props.drawer.length > 0 ? "50vh" : "100vh")};
  position: absolute;
  top: 0;
  left: 0;
  z-index: 0;
  transition: 0.5s;
`;

class Map extends Component {
  apiKey = "AIzaSyCigiwmfCiD-kZ6kMlBw5naF17Z8yVn9Js&v=3.34";

  state = {
    map: null,
    bounds: {},
    clusters: []
  };

  handleChange = change => {
    this.setState({ bounds: change.bounds });
  };

  customMapsAPICode = e => {
    this.setState({ map: e.map });
  };

  openCluster = marker => {
    this.props.setDrawer(marker.events);
  };

  render() {
    const OPTIONS = {
      minZoom: 5,
      maxZoom: 16,
      disableDefaultUI: true,
      styles: customStyles
    };
    const {
      drawer,
      zoom,
      center,
      filteredEvents,
      setDrawer,
      setZoom
    } = this.props;
    const clusters = calculateClusters(filteredEvents, zoom);
    return (
      <MapContainer drawer={drawer}>
        <GoogleMapReact
          bootstrapURLKeys={{ key: this.apiKey }}
          zoom={zoom}
          center={center}
          options={OPTIONS}
          resetBoundsOnResize={true}
          gestureHandling="greedy"
          onChange={this.handleChange}
          onZoomAnimationEnd={() => setZoom(this.state.map.zoom)}
          onChildClick={(i, marker) => this.openCluster(marker)}
          onClick={() => setDrawer([])}
          onGoogleApiLoaded={this.customMapsAPICode}
          yesIWantToUseGoogleMapApiInternals={true}
        >
          {clusters.reduce((result, cluster, i) => {
            // console.log('CLUSTER:',cluster);
            // if (cluster.lat > this.state.bounds.ne.lat || cluster.lat < this.state.bounds.se.lat || cluster.lng > this.state.bounds.ne.lng || cluster.lng < this.state.bounds.nw.lng) {
            //   return result;
            // }
            result.push(
              <Marker
                lat={cluster.lat}
                lng={cluster.lng}
                events={cluster.events}
                key={i}
              />
            );
            return result;
          }, [])}
          {/* {this.props.currentLocation && (<Marker lat={this.props.currentLocation.lat}  lng={this.props.currentLocation.lng} text="Current_Position" size="5px" events={[]} />)} */}
        </GoogleMapReact>
      </MapContainer>
    );
  }
}

const customStyles = [
  {
    elementType: "geometry",
    stylers: [
      {
        color: "#242f3e"
      }
    ]
  },
  {
    elementType: "labels.text.fill",
    stylers: [
      {
        color: "#746855"
      }
    ]
  },
  {
    elementType: "labels.text.stroke",
    stylers: [
      {
        color: "#242f3e"
      }
    ]
  },
  {
    featureType: "administrative.locality",
    elementType: "labels.text.fill",
    stylers: [
      {
        color: "#d59563"
      }
    ]
  },
  {
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [
      {
        color: "#d59563"
      }
    ]
  },
  {
    featureType: "poi.attraction",
    stylers: [
      {
        visibility: "off"
      }
    ]
  },
  {
    featureType: "poi.business",
    stylers: [
      {
        visibility: "off"
      }
    ]
  },
  {
    featureType: "poi.government",
    stylers: [
      {
        visibility: "off"
      }
    ]
  },
  {
    featureType: "poi.medical",
    stylers: [
      {
        visibility: "off"
      }
    ]
  },
  {
    featureType: "poi.park",
    stylers: [
      {
        visibility: "off"
      }
    ]
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [
      {
        color: "#263c3f"
      }
    ]
  },
  {
    featureType: "poi.park",
    elementType: "labels.text.fill",
    stylers: [
      {
        color: "#6b9a76"
      }
    ]
  },
  {
    featureType: "poi.place_of_worship",
    stylers: [
      {
        visibility: "off"
      }
    ]
  },
  {
    featureType: "poi.school",
    stylers: [
      {
        visibility: "off"
      }
    ]
  },
  {
    featureType: "poi.sports_complex",
    stylers: [
      {
        visibility: "off"
      }
    ]
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [
      {
        color: "#38414e"
      }
    ]
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [
      {
        color: "#212a37"
      }
    ]
  },
  {
    featureType: "road",
    elementType: "labels.text.fill",
    stylers: [
      {
        color: "#9ca5b3"
      }
    ]
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [
      {
        color: "#746855"
      }
    ]
  },
  {
    featureType: "road.highway",
    elementType: "geometry.stroke",
    stylers: [
      {
        color: "#1f2835"
      }
    ]
  },
  {
    featureType: "road.highway",
    elementType: "labels.text.fill",
    stylers: [
      {
        color: "#f3d19c"
      }
    ]
  },
  {
    featureType: "transit",
    elementType: "geometry",
    stylers: [
      {
        color: "#2f3948"
      }
    ]
  },
  {
    featureType: "transit.station",
    elementType: "labels.text.fill",
    stylers: [
      {
        color: "#d59563"
      }
    ]
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [
      {
        color: "#17263c"
      }
    ]
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [
      {
        color: "#515c6d"
      }
    ]
  },
  {
    featureType: "water",
    elementType: "labels.text.stroke",
    stylers: [
      {
        color: "#17263c"
      }
    ]
  }
];

const mapStateToProps = state => {
  return {
    filteredEvents: state.filteredEvents,
    zoom: state.zoom,
    center: state.center,
    drawer: state.drawer
  };
};

const mapDispatchToProps = dispatch => {
  return {
    setZoom: zoom => dispatch(setZoom(zoom)),
    setDrawer: drawer => dispatch(setDrawer(drawer))
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Map);
