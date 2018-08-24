import React, { Component } from 'react';
import { connect } from 'react-redux';
import '../App.css';

class LoginScreen extends Component {

  constructor(props) {
    super(props);
    this.props = props;
    this.hideLoginScreen = this.hideLoginScreen.bind(this);
    this.state = {
      loginForm: false
    }
  }

  hideLoginScreen() {
    const loginFormContainer = document.getElementById("login-form-container");
    loginFormContainer.style.bottom = "100%";
    const loginTitle = document.getElementById("login-title");
    loginTitle.style.top = "-20vh";
    const loginBG = document.getElementById("login-bg");
    loginBG.style.opacity = 0;
    this.props.setLoggedIn();
  }

  render() {
    let loginForm = (
    <div id="login-form-container" className="login-form-container">
        <form className="login-form">
        <label htmlFor="email">Email</label>
          <input type="text" name="email" className="login-form-email"/>
        <label htmlFor="password">Password</label>
          <input type="password" name="password" className="login-form-password"/>
          <button className="btn-login">Log in</button>
          <button className="btn-signup" onClick={() => this.setState({loginForm: false})}>Sign up</button>
        <a className="login-skip" href="#" onClick={this.hideLoginScreen}>Skip</a>
        </form>
        </div>);
    let signupForm = (
      <div id="login-form-container" className="login-form-container login-form-container-large">
        <form className="login-form">
          <label htmlFor="email">Email</label>
          <input type="text" name="email" className="login-form-email"/>
          <label htmlFor="password">Password</label>
          <input type="password" name="password" className="login-form-password"/>
          <label htmlFor="confirm_password">Confirm Password</label>
          <input type="password" name="confirm_password" className="login-form-password"/>
          <button className="btn-login" >Sign up</button>
          <button className="btn-signup" onClick={() => this.setState({loginForm: true})}>Log in</button>
        <a className="login-skip" href="#" onClick={this.hideLoginScreen}>Skip</a>
        </form>
        </div>);
    return (
      <div className="login-screen">
        <div id="login-bg" className="login-bg"></div>
        <div id="login-title" className="login-title">
          <h1>19Hz&nbsp;</h1>
          <h1>MAP</h1>
        </div>
        {this.state.loginForm ? loginForm : signupForm}
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
