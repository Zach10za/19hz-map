import React from "react";
import styled from "styled-components";

const MapMarker = styled.div`
  height: ${props => (props.events.length > 1 ? "30px" : "20px")};
  width: ${props => (props.events.length > 1 ? "30px" : "20px")};
  z-index: ${props => props.events.length};
  background: ${props =>
    props.events.length > 1
      ? "rgba(226, 120, 0, 1)"
      : "rgba(226, 120, 0, 0.9)"};
  line-height: ${props => (props.events.length > 1 ? "30px" : "20px")};
  border-radius: 40px;
  text-align: center;
  transition: 0.2s;
  cursor: pointer;
  transform: translate(-50%, -50%);
  &:hover {
    height: ${props => (props.events.length > 1 ? "40px" : "30px")};
    width: ${props => (props.events.length > 1 ? "40px" : "30px")};
    z-index: 999;
    background: #e85829;
    line-height: ${props => (props.events.length > 1 ? "40px" : "30px")};
  }
`;

const Marker = props => {
  const { events } = props;
  return (
    <MapMarker events={events}>
      {events.length > 1 ? events.length : ""}
    </MapMarker>
  );
};

export default Marker;
