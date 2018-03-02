// import { FORMAT_EVENTS } from '../actions/action-types';

const initialState = {
	allEvents: [],
  currentEvents: [],
  modalEvents: [],
  settings: {
    dateRange: {
      min: '',
      max: '',
    },
    days: [0,1,2,3,4,5,6],
    radius: 50,
  },
  showSettings: false,
  loadingMessage: {
    message: 'loading',
    eventsLoaded: 0,
    eventsToLoad: 0,
  },
  isLoading: true,

  clusters: [],
  circle: null,
  showCircle: false,
  currentLocation: null,
  window: {
    center: { lat: 34.0522, lng: -118.2437 },
    zoom: 10,
    bounds: {},  
  },
};

const rootReducer = (state = initialState, action) => {
	switch(action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload.isLoading
      };
    case 'SET_LOADING_MESSAGE':
      return {
        ...state,
        loadingMessage: action.payload.loadingMessage
      };
		case 'SET_ALL_EVENTS':
      return {
        ...state,
        allEvents: action.payload.events
      };
    case 'ADD_ALL_EVENT':
      return {
        ...state,
        allEvents: [...state.allEvents, action.payload.event],
      };
    case 'SET_CURRENT_EVENTS':
      return {
        ...state,
        currentEvents: action.payload.events
      };
    case 'ADD_CURRENT_EVENT':
      return {
        ...state,
        currentEvents: [...state.currentEvents, action.payload.event],
      };
    case 'SET_MODAL_EVENTS':
      return {
        ...state,
        modalEvents: action.payload.events
      };
    case 'SET_SHOW_SETTINGS':
      return {
        ...state,
        showSettings: action.payload.showSettings
      };
    case 'SET_SETTINGS':
      return {
        ...state,
        settings: action.payload.settings
      };
    case 'SET_SETTINGS_DATERANGE':
      return {
        ...state,
        settings: {
          ...state.settings,
          dateRange: {
            min: action.payload.dateRange.min,
            max: action.payload.dateRange.max,
          }
        }
      };
    case 'SET_SETTINGS_DAYS':
      return {
        ...state,
        settings: {
          ...state.settings,
          days: action.payload.days,
        }
      };
    case 'SET_SETTINGS_RADIUS':
      return {
        ...state,
        settings: {
          ...state.settings,
          radius: action.payload.radius,
        }
      };
    case 'SET_CLUSTERS':
      return {
        ...state,
        clusters: action.payload.clusters,
      };
    case 'ADD_CLUSTERS':
      return {
        ...state,
        clusters: [...state.clusters, action.payload.cluster],
      };
    case 'UPDATE_CIRCLE_RADIUS':
      let circle = state.circle;
      circle.setRadius(1609.3 * action.payload.radius);
      return {
        ...state,
        circle: circle,
      };
    case 'UPDATE_CIRCLE_Center':
      circle = state.circle;
      circle.setCenter(action.payload.center);
      return {
        ...state,
        circle: circle,
      };
    case 'SET_CIRCLE':
      return {
        ...state,
        circle: action.payload.circle,
      };
    case 'SHOW_CIRCLE':
      return {
        ...state,
        showCircle: action.payload.showCircle,
      };
    case 'SET_CURRENT_LOCATION':
      return {
        ...state,
        currentLocation: action.payload.currentLocation,
      };
    case 'SET_WINDOW':
      return {
        ...state,
        window: action.payload.window,
      };
    case 'SET_WINDOW_CENTER':
      return {
        ...state,
        window: {
          ...state.window,
          center: action.payload.center,
        }
      };
    case 'SET_WINDOW_ZOOM':
      return {
        ...state,
        window: {
          ...state.window,
          zoom: action.payload.zoom,
        }
      };
    case 'SET_WINDOW_BOUNDS':
      return {
        ...state,
        window: {
          ...state.window,
          bounds: action.payload.bounds,
        }
      };
    case 'CALCULATE_CLUSTERS':
      return {
        ...state,
        clusters: calculateClusters(action.payload.events, action.payload.zoom),
      };
    default:
      return state;
	}
};

const calculateClusters = (events, zoom) => {
    let clusters = [];

    // This odd array is tjhe different margins to check how close together two points are at specific zoom levels.
    // The more zoomed in, the lower the margin.
    let distance_map = [1,1,1,1,1,1,1,1,0.5,0.3,0.15,0.05,0.02,0.008,0.004,0.001,0.0000001,0.00000001,0.00000001,0.00000001,0.00000001,0.00000001,0.00000001,0.00000001];
    let distance = distance_map[zoom];

    for (let i=0; i < events.length; i++) {

      if (!events[i].venue.location.lat || !events[i].venue.location.lng) break; // must have lat and lng

      // starts by making a brand new cluster with just 1 event (itself)
      let new_cluster = {};
      new_cluster.events = [events[i]];
      new_cluster.lat = events[i].venue.location.lat;
      new_cluster.lng = events[i].venue.location.lng;

      let closest = {index: -1, distance: 999}; 

      // iterate through all clusters for each event
      for (let j=0; j < clusters.length; j++) {
        let lat_distance = Math.abs(clusters[j].lat - new_cluster.lat);
        let lng_distance = Math.abs(clusters[j].lng - new_cluster.lng);

        // find the cluster that is closest to the new cluster we created but within the margin we set
        if (lat_distance < distance && lng_distance < distance) {
          if (lat_distance + lng_distance < closest.distance ) {
            closest.index = j;
            closest.distance = lat_distance + lng_distance;
          }
        }
      }

      // If a nearby cluster was found, add all the clusters events into the new cluster and get the new average of all lats and lngs
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

        // remove the nearby cluster than has been replaced by the new one
        clusters.splice(closest.index, 1);
      }
      clusters.push(new_cluster);
    }
    return clusters;
  }

export default rootReducer;