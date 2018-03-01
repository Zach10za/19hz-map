import React, { Component } from 'react';
import '../App.css';

class LoadingScreen extends Component {

  constructor(props) {
    super(props);
    this.props = props;
  }

  render() {
      let loading_bars = [];
      for (let i=0; i < 10; i++) {
        loading_bars.push(<div className="bar" key={i}></div>);
      }

    return (
      <div className="page-cover" style={{display: 'block'}} >
        <div id="bars">{loading_bars}</div>
        <h6 className="page-cover-message">{this.props.message}<br/>{this.props.eventsToLoad > 0 ? this.props.eventsLoaded+'/'+this.props.eventsToLoad : ''}</h6>
        <div className="progress events-progress">
          <div className="progress-bar" role="progressbar" style={{ width: (this.props.eventsLoaded / this.props.eventsToLoad * 100) + "%"}} aria-valuenow={this.props.eventsLoaded} aria-valuemin="0" aria-valuemax={this.props.eventsToLoad}></div>
        </div>
      </div>
    );
  }
}

export default LoadingScreen;
