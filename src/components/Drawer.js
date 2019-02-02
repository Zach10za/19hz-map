import React from "react";
import { connect } from "react-redux";
import { setDrawer } from "../actions";
import styled from "styled-components";

const EventsDrawer = styled.ul`
  width: 100%;
  max-width: 400px;
  height: 50%;
  position: absolute;
  bottom: 0;
  right: 0;
  overflow-y: auto;
  list-style-type: none;
  transition: max-height 0.5s;
  padding: 20px;
  .close {
    display: none;
  }
  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-track {
    display: none;
  }
  &::-webkit-scrollbar-thumb {
    background: rgb(226, 120, 0);
    border-radius: 6px;
  }
  @media screen and (max-width: 400px) {
    max-height: 50%;
  }
`;

const DrawerEvent = styled.li`
  width: 100%;
  height: auto;
  background: white;
  padding: 20px;
  margin-bottom: 20px;
  &:last-of-type {
    margin: 0;
  }
  .title {
    font-size: 1rem;
    font-weight: bold;
  }
  .venue {
    font-size: 0.9rem;
  }
  .tags {
    font-size: 0.7rem;
    font-style: italic;
  }
  .age_price {
    font-size: 0.8rem;
  }
  .datetime {
    display: flex;
    justify-content: space-between;
    font-size: 0.8rem;
  }
  .links {
    display: flex;
    justify-content: space-between;
    a {
      width: 48%;
      display: inline-block;
      padding: 10px 0;
      text-align: center;
      border-radius: 5px;
      background: rgba(226, 120, 0, 0.9);
    }
    .facebook {
      background: lightblue;
    }
  }
`;

const Drawer = props => {
  const { drawer, setDrawer } = props;
  return (
    <EventsDrawer events={drawer}>
      <div className="close" onClick={() => setDrawer([])}>
        <i className="fas fa-times" />
      </div>
      {drawer.map(event => {
        const links = [];
        if (event.link) {
          if (event.link.indexOf("facebook") > 0) {
            links.push({
              url: event.link,
              type: "facebook",
              icon: "fab fa-facebook"
            });
          } else {
            links.push({ url: event.link, type: "link", icon: "fas fa-link" });
          }
        }
        if (event.facebook) {
          links.push({
            url: event.facebook,
            type: "facebook",
            icon: "fab fa-facebook"
          });
        }
        return (
          <DrawerEvent key={event.id}>
            <div className="title">{event.title}</div>
            <div className="venue">{event.venue.name}</div>
            <div className="tags">{event.tags.join(", ")}</div>
            <div className="age_price">
              {event.age} {event.price}
            </div>
            <div className="datetime">
              <div className="time">{event.time}</div>
              <div className="date">
                {new Date(event.date).toLocaleDateString("en-US")}
              </div>
            </div>
            <div className="links">
              {links.map((link, i) => {
                return (
                  <a
                    href={link.url}
                    className={"btn " + link.type}
                    key={String(event.id) + i}
                  >
                    <i className={link.icon} />
                  </a>
                );
              })}
            </div>
          </DrawerEvent>
        );
      })}
    </EventsDrawer>
  );
};

const mapStateToProps = state => {
  return {
    drawer: state.drawer
  };
};

const mapDispatchToProps = dispatch => {
  return {
    setDrawer: drawer => dispatch(setDrawer(drawer))
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Drawer);
