import React, { Component } from 'react';
import Map from './components/Map';
import Drawer from './components/Drawer';
import Filters from './components/Filters';
import LocationPicker from './components/LocationPicker';
import { fetchEvents, calculateClusters, filter } from './utils';

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      events: [],
      filtered_events: [],
      clusters: [],
      drawer: [],
      zoom: 10,
      center: { lat: 34.0522, lng: -118.2437 },
      loading: false,
      locationPicker: false,
    }
  }

  componentDidMount = async () => {
    let state = localStorage.getItem('state');
    const updated_at = localStorage.getItem('updated_at');
    if (updated_at && state && parseInt(updated_at,10) === new Date().getDay()) {
      state = JSON.parse(state);
      this.setState(state, console.log);
    } else {
      this.setState({locationPicker: true})
    }
  }

  fetchLocation = async (location) => {
    this.setState({loading: true})
    const zoom = location === "0" ? 5 : 10;
    const events = await fetchEvents(location);
    const clusters = calculateClusters(events, zoom);
    this.setState({ events, filtered_events: events, clusters, zoom, center: CENTERS[location], drawer: [], loading: false, locationPicker: false }, () => {
      localStorage.setItem('state', JSON.stringify(this.state));
      localStorage.setItem('updated_at', new Date().getDay());
    });
  }

  filterEvents = (filters) => {
    const filtered_events = filter(filters, this.state.events);
    const clusters = calculateClusters(filtered_events, this.state.zoom);
    this.setState({ clusters, filtered_events, drawer: [] }, () => {
      localStorage.setItem('state', JSON.stringify(this.state));
      localStorage.setItem('updated_at', new Date().getDay());
    });
  }

  onZoomChange = (zoom) => {
    const clusters = calculateClusters(this.state.filtered_events, zoom);
    this.setState({ clusters, zoom });
  }

  onMapClick = (e) => {
    this.hideDrawer();
  }

  showDrawer = (drawer) => {
    this.setState({ drawer });
  }

  hideDrawer = () => {
    this.setState({ drawer: [] });
  }
  

  render() {
    const overlay = this.state.locationPicker ? (<LocationPicker pickLocation={async (loc) => {this.fetchLocation(loc)}}/>) : (<Filters filter={this.filterEvents} fetchLocation={this.fetchLocation} />);
    return (
      <div className="App">
        { overlay }
        <Drawer events={this.state.drawer} hideDrawer={this.hideDrawer} />
        <div className={"map-container"}>
          <Map 
            clusters={this.state.clusters}
            onZoom={this.onZoomChange}
            onClick={this.onMapClick}
            center={this.state.center}
            zoom={this.state.zoom}
            onMarkerClick={this.showDrawer} />
        </div>
        
        <div className="loading-screen" style={{ display: this.state.loading ? 'block' : 'none' }}>
          <div id="bars">
            <div className="bar"></div>
            <div className="bar"></div>
            <div className="bar"></div>
            <div className="bar"></div>
            <div className="bar"></div>
            <div className="bar"></div>
            <div className="bar"></div>
            <div className="bar"></div>
            <div className="bar"></div>
            <div className="bar"></div>
          </div>
        </div>
      </div>
    );
  }
}

const CENTERS = [
  {
    lat: 37.0902,
    lng: -95.7129
  },
  {
    lat: 37.7749,
    lng: -122.4194
  },
  {
    lat: 34.0522,
    lng: -118.2437
  },
  {
    lat: 33.7490,
    lng: -84.3880
  },
  {
    lat: 31.9686,
    lng: -99.9018
  },
  {
    lat: 25.7617,
    lng: -80.1918
  },
  {
    lat: 33.4484,
    lng: -112.0740
  },
  {
    lat: 42.3601,
    lng: -71.0589
  }
]


export default App;
