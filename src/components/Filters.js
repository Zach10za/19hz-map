import React, { Component } from "react";
import { connect } from "react-redux";
import { setFilteredEvents, fetchEvents } from "../actions";
import { filter } from "../utils";
import styled from "styled-components";
import { Input, Select } from "./elements";

const FiltersContainer = styled.div`
  width: 100%;
  padding: 20px;
  max-width: 400px;
  position: absolute;
  left: 0;
  right: 0;
  margin: 0 auto;
`;

const SearchBar = styled.div`
  border: none;
  background: white;
  padding: 10px 15px;
`;

const FiltersDropdown = styled.div`
  background: white;
  padding: 10px;
  .filter-block {
    margin-top: 10px;
  }
  .date-range {
    display: flex;
    justify-content: stretch;
    input {
      border: none;
      padding: 5px 10px;
      width: 47%;
    }
  }
  .days-btns {
    padding: 10px;
    background: blue;
    transition: 0.2s;
  }
  .days-btns.active {
    background: orange;
  }
`;

class Filters extends Component {
  state = {
    search: "",
    location: 2,
    day_of_week: [0, 1, 2, 3, 4, 5, 6],
    date_range: {
      min: "",
      max: ""
    },
    show: false
  };

  componentWillMount = () => {
    let filters = localStorage.getItem("filters");
    const updated_at = localStorage.getItem("updated_at");
    if (
      updated_at &&
      filters &&
      parseInt(updated_at, 10) === new Date().getDay()
    ) {
      filters = JSON.parse(filters);
      this.setState(filters);
    }
  };

  onSearch = e => {
    this.setState({ search: e.target.value }, () => {
      const filteredEvents = filter(this.state, this.props.events);
      this.props.setFilteredEvents(filteredEvents);
      this.cacheState();
    });
  };

  changeDateRange = e => {
    this.setState(
      {
        date_range: {
          ...this.state.date_range,
          [e.target.name]: e.target.value
        }
      },
      () => {
        this.props.setFilteredEvents(filter(this.state, this.props.events));
        this.cacheState();
      }
    );
  };

  changeDayOfWeek = e => {
    const day_of_week = this.state.day_of_week;
    const index = day_of_week.indexOf(parseInt(e.target.value, 10));
    if (index > -1) {
      day_of_week.splice(index, 1);
    } else {
      day_of_week.push(parseInt(e.target.value, 10));
    }
    this.setState({ day_of_week }, () => {
      this.props.setFilteredEvents(filter(this.state, this.props.events));
      this.cacheState();
    });
  };

  changeLocation = e => {
    this.setState({ location: e.target.value, show: false }, () => {
      this.props.fetchEvents(this.state.location);
      this.cacheState();
    });
  };

  toggleFilters = () => {
    this.setState({ show: !this.state.show }, this.cacheState);
  };

  cacheState = () => {
    localStorage.setItem("filters", JSON.stringify(this.state));
    localStorage.setItem("updated_at", new Date().getDay());
  };

  render() {
    const { search, location, date_range, day_of_week, show } = this.state;
    return (
      <FiltersContainer>
        <SearchBar>
          <Input
            type="search"
            id="live-search"
            placeholder="Search for events, venues, artists..."
            value={search}
            onChange={this.onSearch}
          />
          <div className="filters-button" onClick={this.toggleFilters}>
            <i className={"fas fa-" + (show ? "times" : "filter")} />
          </div>
        </SearchBar>
        <FiltersDropdown show={show}>
          <div className="filter-block">
            <Select value={location} onChange={this.changeLocation}>
              <option value="0">All</option>
              <option value="1">SF Bay Area</option>
              <option value="2">Los Angeles</option>
              <option value="3">Atlanta</option>
              <option value="4">Texas</option>
              <option value="5">Miami</option>
              <option value="6">Phoenix</option>
              <option value="7">Massachusetts</option>
              <option value="8">Chicago</option>
              <option value="9">Iowa</option>
              <option value="10">Portland / Seattle / Vancouver</option>
              <option value="11">Washington DC</option>
            </Select>
          </div>
          <div className="filter-block">
            <div className="date-range">
              <input
                type="date"
                name="min"
                value={date_range.min}
                onChange={this.changeDateRange}
              />
              <span>-</span>
              <input
                type="date"
                name="max"
                value={date_range.max}
                onChange={this.changeDateRange}
              />
            </div>
          </div>
          <div className="filter-block">
            <div className="days-btns">
              {["S", "M", "T", "W", "Th", "F", "S"].map((day, i) => {
                return (
                  <button
                    className={
                      day_of_week.indexOf(i) > -1 ? "btn active" : "btn"
                    }
                    key={i + "" + day}
                    value={i}
                    onClick={this.changeDayOfWeek}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>
        </FiltersDropdown>
      </FiltersContainer>
    );
  }
}

const mapStateToProps = state => {
  return {
    filteredEvents: state.filteredEvents,
    events: state.events
  };
};

const mapDispatchToProps = dispatch => {
  return {
    setFilteredEvents: filteredEvents =>
      dispatch(setFilteredEvents(filteredEvents)),
    fetchEvents: location => dispatch(fetchEvents(location))
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Filters);
