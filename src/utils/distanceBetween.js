export default (p1, p2) => {
  p1 = {lat: parseFloat(p1.lat), lng: parseFloat(p1.lng)};
  p2 = {lat: parseFloat(p2.lat), lng: parseFloat(p2.lng)};

  const toRad = (x) => {
    return x * Math.PI / 180;
  }

  const R = 3959; // mean radius of earth in miles

  // Haversine Formula
  let lat_diff = toRad(p2.lat - p1.lat);
  let lng_diff = toRad(p2.lng - p1.lng);
  let A = Math.sin(lat_diff / 2) * Math.sin(lat_diff / 2) + Math.cos(toRad(p1.lat)) * Math.cos(toRad(p2.lat)) * Math.sin(lng_diff / 2) * Math.sin(lng_diff / 2);
  let C = 2 * Math.atan2(Math.sqrt(A), Math.sqrt(1 - A));
  return R * C;
}