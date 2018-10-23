export default (events, zoom) => {
  // This weird array is the different margins to check how close together two points are at specific zoom levels.
  // The more zoomed in, the lower the margin.
  const distance_map = [1,1,1,1,1,1,1,1,0.5,0.3,0.15,0.05,0.02,0.008,0.004,0.001,0.0000001,0.00000001,0.00000001,0.00000001,0.00000001,0.00000001,0.00000001,0.00000001];
  const distance = distance_map[zoom];

 const clusters = events.reduce((result, event, i) => {

    if (!event.venue.location.lat || !event.venue.location.lng) return result; // must have lat and lng to be on the map

    // starts by making a brand new cluster with just 1 event (itself)
    const new_cluster = {
      events: [event],
      lat: event.venue.location.lat,
      lng: event.venue.location.lng,
    };

    const closest = { index: -1, distance: 999 }; 

    // iterate through all clusters for each event
    result.forEach((cluster, idx) => {
      let lat_distance = Math.abs(cluster.lat - new_cluster.lat);
      let lng_distance = Math.abs(cluster.lng - new_cluster.lng);

      // find the cluster that is closest to the new cluster we created but within the margin we set
      if (lat_distance < distance && lng_distance < distance) {
        if (lat_distance + lng_distance < closest.distance ) {
          closest.index = idx;
          closest.distance = lat_distance + lng_distance;
        }
      }
    });

    // If a nearby cluster was found, add all the clusters events into the new cluster and get the new average of all lats and lngs
    if (closest.index > -1) {
      new_cluster.events = [...new_cluster.events, ...result[closest.index].events];
      let sums = result[closest.index].events.reduce((sum, ev) => {
        sum.lat += parseFloat(ev.venue.location.lat);
        sum.lng += parseFloat(ev.venue.location.lng);
        return sum;
      }, {lat: 0, lng: 0});
      new_cluster.lat = sums.lat / result[closest.index].events.length;
      new_cluster.lng = sums.lng / result[closest.index].events.length;
      // remove the nearby cluster than has been replaced by the new one
      result.splice(closest.index, 1);
    }
    result.push(new_cluster);
    return result;
  }, []);

  return clusters;
};