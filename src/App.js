import React, { Component } from "react";
import { connect } from "react-redux";
import Map from "./components/Map";
import Drawer from "./components/Drawer";
import Filters from "./components/Filters";
import LocationPicker from "./components/LocationPicker";
import Loading from "./components/Loading";
import styled from "styled-components";

const AppContainer = styled.div`
  background: #242f3e;
  height: 100vh;
  width: 100%;
`;

class App extends Component {
  render() {
    const overlay = this.props.locationPicker ? (
      <LocationPicker
        pickLocation={async loc => {
          this.fetchLocation(loc);
        }}
      />
    ) : (
      <Filters filter={this.filterEvents} fetchLocation={this.fetchLocation} />
    );
    return (
      <AppContainer>
        {overlay}
        <Drawer />
        <Map />
        <Loading loading={this.props.loading} />
      </AppContainer>
    );
  }
}

const mapStateToProps = state => {
  return {
    locationPicker: state.locationPicker,
    loading: state.loading,
    error: state.error
  };
};

export default connect(mapStateToProps)(App);
