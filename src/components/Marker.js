import React, { Component } from 'react';
import { connect } from 'react-redux';
import '../App.css';
const actions = require('../actions/index');

class Marker extends Component {

  constructor(props) {
    super(props);
    this.state = {
      opacity: 0
    }
  }

  componentDidMount() {
    this.setState({opacity: 1});
  }

  componentWillUnmount() {
    this.setState({opacity: 0});
  }

  render() {
    let num_events = this.props.events.length;
    let styles = {
      height: this.props.size ? this.props.size : (num_events > 1 ? '30px' : '20px'), 
      width: this.props.size ? this.props.size : (num_events > 1 ? '30px' : '20px'), 
      lineHeight: num_events > 1 ? '30px' : '20px',
      backgroundColor: num_events > 1 ? 'rgba(226, 120, 0, 1)' : num_events < 1 ? 'purple' : 'rgba(226, 120, 0, 1)',
      opacity: this.state.opacity,
      zIndex: num_events
    }
    let hoverStyles = {
      height: num_events > 1 ? '40px' : '30px', 
      width: num_events > 1 ? '40px' : '30px', 
      lineHeight: num_events > 1 ? '40px' : '30px',
      backgroundColor: '#E85829',
      opacity: this.state.opacity,
      zIndex: 999
    }
    return (
      <div 
        className={this.props.text === "Current_Position" ? "user-marker map-marker" : "map-marker"}
        onClick={() => this.props.setModalEvents(this.props.events)}
        style={this.props.$hover ? hoverStyles : styles}
        data-toggle="modal" data-target="#eventsModal">

        {num_events > 1 ? num_events : ''}

      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {};
}

const mapDispatchToProps = (dispatch) => {
  return {
    setModalEvents: (modalEvents) => dispatch(actions.setModalEvents(modalEvents)),
  };
}


export default connect(mapStateToProps, mapDispatchToProps)(Marker);
