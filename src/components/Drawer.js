import React, { Component } from 'react';

class Drawer extends Component {
  render() {
    let className = "events-drawer"
    if (this.props.events.length < 1) {
      className += " hide"
    }
    return (
      <ul className={className}>
        <div className="close" onClick={this.props.hideDrawer} ><i className="fas fa-times"></i></div>
        { this.props.events.map(event => {
          const links = [];
          if (event.link) {
            if (event.link.indexOf("facebook") > 0) {
              links.push({ url: event.link, type: "facebook", icon: "fab fa-facebook" });
            } else {
              links.push({ url: event.link, type: "link", icon: "fas fa-link" });
            }
          }
          if (event.facebook) {
            links.push({ url: event.facebook, type: "facebook", icon: "fab fa-facebook" });
          }
          return (
            <li key={event.id}>
              <div className="title">{event.title}</div>
              <div className="venue">{event.venue.name}</div>
              <div className="tags">
                {event.tags.join(', ')}
              </div>
                <div className="age_price">{event.age} {event.price}</div>
              <div className="datetime">
                <div className="time">{event.time}</div>
                <div className="date">{new Date(event.date).toLocaleDateString("en-US")}</div>
              </div>
              <div className="links">
                {links.map( (link, i) => {
                  return (<a href={link.url} className={"btn " + link.type} key={String(event.id) + i}><i className={link.icon}></i></a>)
                })}
              </div>
            </li>
        )})}
      </ul>
    );
  }
}


export default Drawer;
