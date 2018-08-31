import React, { Component } from 'react';
import { connect } from 'react-redux';
import '../App.css';
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUser, faTimes } from '@fortawesome/free-solid-svg-icons'

library.add([faUser, faTimes])

class LoginScreen extends Component {

  constructor(props) {
    super(props);
    this.props = props;
    this.state = {
        hidden: true
    }
    this.handleTextInput = this.handleTextInput.bind(this);
    this.toggleProfile = this.toggleProfile.bind(this);
  }

  handleTextInput(ev) {
    this.setState({[ev.target.name]: ev.target.value});
  }

  toggleProfile() {
    this.setState({hidden: !this.state.hidden});
  }
  render() {
    return (
      <div id="profile" className={this.state.hidden ? "profile hidden" : "profile"}>
        <button className="btn-profile" onClick={this.toggleProfile}><FontAwesomeIcon icon={this.state.hidden ? "user" : "times"} /></button>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {};
}

const mapDispatchToProps = (dispatch) => {
  return {};
}


export default connect(mapStateToProps, mapDispatchToProps)(LoginScreen);
