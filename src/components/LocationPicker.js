import React, { Component } from "react";
import { connect } from "react-redux";
import styled from "styled-components";
import { fetchEvents } from "../actions";
import { Button } from "./elements";

const Wrapper = styled.div`
  width: 100%;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2;
  position: absolute;
  top: 0;
  left: 0;
`;

const TileContainer = styled.div`
  width: 100%;
  max-width: calc(88vmin + 24px);
`;

class LocationPicker extends Component {
  state = {
    selected: null
  };

  handleClick = event => {
    this.setState({ selected: event.target.value }, () => {
      this.props.fetchEvents(this.state.selected);
    });
  };

  render() {
    const locations = [
      "All",
      "San Francisco",
      "Los Angeles",
      "Atlanta",
      "Texas",
      "Miami / Orlando / Tampa",
      "Phoenix",
      "Massachusetts",
      "Chicago",
      "Iowa",
      "Portland / Seattle / Vancouver",
      "Washington DC"
    ];
    return (
      <Wrapper>
        <TileContainer>
          {locations.map((location, index) => (
            // <div key={index} className={this.state.selected === index ? "tile selected" : "tile"}>
            <Button key={index} onClick={this.handleClick} value={index} tile>
              {location}
            </Button>
            // </div>
          ))}
        </TileContainer>
      </Wrapper>
    );
  }
}

const mapStateToProps = state => {
  return {
    loading: state.loading
  };
};

const mapDispatchToProps = dispatch => {
  return {
    fetchEvents: events => dispatch(fetchEvents(events))
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(LocationPicker);
