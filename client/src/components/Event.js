import React, { Component } from 'react';
import '../App.css';

class Event extends Component {

  constructor(props) {
    super(props);
    this.state = {
      id: props.event.id,
      title: props.event.title,
      date: props.event.event_date,
      time: props.event.time,
      price: props.event.price,
      age: props.event.age,
      venue: {
        name: props.event.venue.name,
        address: props.event.venue.address,
        place_id: props.event.venue.place_id,
        image: props.event.venue.image,
        location: {
          lat: props.event.venue.lat,
          lng: props.event.venue.lng,
        }
      },
      organizers: [],
      tags: []
    };
  }

  componentDidMount() {

    this.getOrganizers()
      .then(res => this.setState({ organizers: res.result }))
      .catch(err => console.log(err));

    this.getTags()
      .then(res => this.setState({ tags: res.result }))
      .catch(err => console.log(err));
  }

  getTags = async () => {
    const response = await fetch(`/api/events/${this.state.id}/tags`);
    const body = await response.json();
    return body;
  };

  getOrganizers = async () => {
    const response = await fetch(`/api/events/${this.state.id}/organizers`);
    const body = await response.json();
    return body;
  };


  getTagColor(id) {
    const COLORS = [
      '#f44336',
      '#E91E63',
      '#9C27B0',
      '#673AB7',
      '#3F51B5',
      '#2196F3',
      '#03A9F4',
      '#00BCD4',
      '#009688',
      '#4CAF50',
      '#8BC34A',
      '#CDDC39',
      '#FFEB3B',
      '#FFC107',
      '#FF9800',
      '#FF5722',
      '#795548',
      '#9E9E9E',
      '#607D8B',
      '#d50000',
      '#C51162',
      '#AA00FF',
      '#6200EA',
      '#304FFE',
      '#2962FF',
      '#0091EA',
      '#00B8D4',
      '#00BFA5',
      '#00C853',
      '#64DD17',
      '#AEEA00',
      '#FFD600',
      '#FFAB00',
      '#FF6D00',
      '#DD2C00',
    ];
    return COLORS[id % COLORS.length];
  }

  handleClick(ev) {
    return this.props.onClick({
      lat: this.state.venue.location.lat,
      lng: this.state.venue.location.lng,
    });
  }

  render() {
    return (
      <div className="card mb-4" onClick={this.handleClick.bind(this)}>
        <div className="card-img-top" style={{background: `url('${this.state.venue.image || 'https://unsplash.it/500/200/?random'}') no-repeat center`, backgroundSize: 'cover'}}></div>

        <div className="card-img-overlay">
          <h5 className="card-title">{this.state.title}</h5>
          <br/>
          <h6 className="card-text">{this.state.venue.name}</h6>
          <br/>
          <p className="card-text event-date">{this.state.date}</p>
        </div>

        <div className="card-body">
          <table className="table">
            <tbody>
              <tr>
                <td><p className="card-text">{this.state.time}</p></td>
                <td><p className="card-text">{this.state.price}</p></td>
                <td><p className="card-text">{this.state.age}</p></td>
              </tr>
            </tbody>
          </table>
          <div className="tags">
            {this.state.tags.map((tag, i) => (
              <div className="tag" key={i} style={{background: this.getTagColor(tag.id)}}>{tag.tag}</div>
            ))}
          </div>
        </div>

      </div>
    );
  }
}

export default Event;
