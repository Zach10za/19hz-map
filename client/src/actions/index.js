// import { IS_LOADING, UPDATE_LOADING_MESSAGE } from './action-types';

export const setLoading = (bool) => {
  return {
    type: 'SET_LOADING',
    payload:  {
      isLoading: bool,
    }
  };
}

export const setLoadingMessage = (loadingMessage) => {
  return {
    type: 'SET_LOADING_MESSAGE',
    payload:  {
      loadingMessage, // { message: string, eventsLoaded: int, eventsToLoad: int }
    }
  };
}

export const setAllEvents = (events) => {
  return {
    type: 'SET_ALL_EVENTS',
    payload:  {
      events, // array of events objects
    }
  };
}

export const addAllEvent = (event) => {
  return {
    type: 'ADD_ALL_EVENT',
    payload:  {
      event, // event object
    }
  };
}

export const setCurrentEvents = (events) => {
  return {
    type: 'SET_CURRENT_EVENTS',
    payload:  {
      events, // array of events objects
    }
  };
}

export const addCurrentEvent = (event) => {
  return {
    type: 'ADD_CURRENT_EVENT',
    payload:  {
      event, // event object
    }
  };
}

export const setModalEvents = (events) => {
  return {
    type: 'SET_MODAL_EVENTS',
    payload:  {
      events, // array of events objects
    }
  };
}

export const setShowSettings = (bool) => {
  return {
    type: 'SET_SHOW_SETTINGS',
    payload:  {
      showSettings: bool,
    }
  };
}

export const setSettings = (settings) => {
  return {
    type: 'SET_SETTINGS',
    payload:  {
      settings,
    }
  };
}

export const setSettingsDateRange = (dateRange) => {
  return {
    type: 'SET_SETTINGS_DATERANGE',
    payload:  {
      dateRange, // { min: int, max: int }
    }
  };
}

export const setSettingsDays = (days) => {
  return {
    type: 'SET_SETTINGS_DAYS',
    payload:  {
      days, // array of ints
    }
  };
}

export const setSettingsRadius = (radius) => {
  return {
    type: 'SET_SETTINGS_RADIUS',
    payload:  {
      radius, // int
    }
  };
}

export const setClusters = (clusters) => {
  return {
    type: 'SET_CLUSTERS',
    payload:  {
      clusters, // array of cluster objects
    }
  };
}

export const addCluster = (cluster) => {
  return {
    type: 'ADD_CLUSTERS',
    payload:  {
      cluster // cluster object
    }
  };
}

export const updateCircleRadius = (radius) => {
  return {
    type: 'UPDATE_CIRCLE_RADIUS',
    payload:  {
      radius // int
    }
  };
}

export const updateCircleCenter = (center) => {
  return {
    type: 'UPDATE_CIRCLE_CENTER',
    payload:  {
      center // { lat: int, lng: int }
    }
  };
}

export const setCircle = (circle) => {
  return {
    type: 'SET_CIRCLE',
    payload:  {
      circle // cluster object
    }
  };
}

export const setSettingsShowCircle = (bool) => {
  return {
    type: 'SET_SETTINGS_SHOW_CIRCLE',
    payload:  {
      showCircle: bool
    }
  };
}

export const setCurrentLocation = (currentLocation) => {
  return {
    type: 'SET_CURRENT_LOCATION',
    payload:  {
      currentLocation // { lat: int, lng: int }
    }
  };
}

export const setWindow = (window) => {
  return {
    type: 'SET_WINDOW',
    payload:  {
      window
    }
  };
}

export const setWindowCenter = (center) => {
  return {
    type: 'SET_WINDOW_CENTER',
    payload:  {
      center // { lat: int, lng: int }
    }
  };
}

export const setWindowZoom = (zoom) => {
  return {
    type: 'SET_WINDOW_ZOOM',
    payload:  {
      zoom // int
    }
  };
}

export const setWindowBounds = (bounds) => {
  return {
    type: 'SET_WINDOW_BOUNDS',
    payload:  {
      bounds // { ne, nw,  se, sw }
    }
  };
}

export const setMap = (map) => {
  return {
    type: 'SET_MAP',
    payload:  {
      map
    }
  };
}

export const calculateClusters = (events, zoom) => {
  return {
    type: 'CALCULATE_CLUSTERS',
    payload:  {
      events,
      zoom,
    }
  };
}