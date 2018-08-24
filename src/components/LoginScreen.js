import React, { Component } from 'react';
import { connect } from 'react-redux';
import '../App.css';

class LoginScreen extends Component {

  constructor(props) {
    super(props);
    this.props = props;
    this.state = {
      loginForm: true,
      email: "",
      password: "",
      confirm_password: "",
      error: ""
    }
    this.handleTextInput = this.handleTextInput.bind(this);
    this.hideLoginScreen = this.hideLoginScreen.bind(this);
    this.submitLoginForm = this.submitLoginForm.bind(this);
    this.submitSignupForm = this.submitSignupForm.bind(this);
  }

  handleTextInput(ev) {
    this.setState({[ev.target.name]: ev.target.value});
  }

  hideLoginScreen() {
    const loginFormContainer = document.getElementById("login-form-container");
    loginFormContainer.style.bottom = "-62vh";
    const loginTitle = document.getElementById("login-title");
    loginTitle.style.top = "-20vh";
    const loginBG = document.getElementById("login-bg");
    loginBG.style.opacity = 0;
    this.props.setLoggedIn();
  }

  submitLoginForm = async () => {
    const response = await fetch('https://api.19hz-map.info/login', {
		  method: 'POST',
		  headers: {
		      'Accept': 'application/json',
		      'Content-Type': 'application/json'
		  },
		  body: JSON.stringify({
		      email: this.state.email,
		      password: this.state.password
		  })
    });
    const responseJson = await response.json();
    if (responseJson.success) {
      try {
        // Sets the JWT and user in session storage
        sessionStorage.setItem('token', responseJson.token);
        sessionStorage.setItem('user', JSON.stringify(responseJson.user));
        //TODO: Handle successful sign in
        console.log(responseJson);
        this.hideLoginScreen();
      } catch (error) {
        this.setState({error: responseJson.message})
        console.error(responseJson.message);
      }
    } else {
      this.setState({error: responseJson.message})
      console.error(responseJson.message);
    }
  }

  submitSignupForm = async () => {
    const response = await fetch('https://api.19hz-map.info/register', {
		  method: 'POST',
		  headers: {
		      'Accept': 'application/json',
		      'Content-Type': 'application/json'
		  },
		  body: JSON.stringify({
		      email: this.state.email,
		      password: this.state.password,
		      confirm_password: this.state.confirm_password
		  })
		});
    const responseJson = await response.json();
    if (responseJson.success) {
      try {
        // Sets the JWT and user in session storage
        sessionStorage.setItem('token', responseJson.token);
        sessionStorage.setItem('user', JSON.stringify(responseJson.user));
        //TODO: Handle successful sign in
        console.log(responseJson);
        this.hideLoginScreen();
      } catch (error) {
        this.setState({error: responseJson.message})
        console.error(responseJson.message);
      }
    } else {
      this.setState({error: responseJson.message})
      console.error(responseJson.message);
    }
  }

  render() {
    let loginForm = (
    <div id="login-form-container" className="login-form-container">
        <form className="login-form" onSubmit={(e) => e.preventDefault()}>
        <label htmlFor="email">Email</label>
          <input type="text" name="email" id="email" value={this.state.email} onChange={this.handleTextInput} className="login-form-email"/>
        <label htmlFor="password">Password</label>
          <input type="password" name="password" id="password" value={this.state.password} onChange={this.handleTextInput} className="login-form-password"/>
          <button className="btn-login" onClick={this.submitLoginForm}>Log in</button>
          <button className="btn-signup" onClick={() => this.setState({loginForm: false})}>Sign up</button>
        <a className="login-skip" onClick={this.hideLoginScreen}>Skip</a>
        </form>
        </div>);
    let signupForm = (
      <div id="login-form-container" className="login-form-container login-form-container-large">
        <form className="login-form" onSubmit={(e) => e.preventDefault()}>
          <label htmlFor="email">Email</label>
          <input type="text" name="email" id="email" value={this.state.email} onChange={this.handleTextInput} className="login-form-email"/>
          <label htmlFor="password">Password</label>
          <input type="password" name="password" id="password" value={this.state.password} onChange={this.handleTextInput} className="login-form-password"/>
          <label htmlFor="confirm_password">Confirm Password</label>
          <input type="password" name="confirm_password" id="confirm_password" value={this.state.confirm_password} onChange={this.handleTextInput} className="login-form-password"/>
          <button className="btn-login"  onClick={this.submitSignupForm} >Sign up</button>
          <button className="btn-signup"onClick={() => this.setState({loginForm: true})}>Log in</button>
        <a className="login-skip" onClick={this.hideLoginScreen}>Skip</a>
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
