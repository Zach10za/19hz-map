import React, { Component } from 'react';

class Filters extends Component {
  constructor(props) {
    super(props);
    this.state = {
      search: '',
      location: 2,
      day_of_week: [0,1,2,3,4,5,6],
      date_range: {
        min: '',
        max: '',
      },
      show: false,
    }
  }

  componentWillMount = () => {
    let filters = localStorage.getItem('filters');
    const updated_at = localStorage.getItem('updated_at');
    if (updated_at && filters && parseInt(updated_at,10) === new Date().getDay()) {
      filters = JSON.parse(filters);
      this.setState(filters);
    }
  }

  onSearch = (e) => {
    this.setState({ search: e.target.value }, () => {
      this.props.filter(this.state);
      localStorage.setItem('filters', JSON.stringify(this.state));
      localStorage.setItem('updated_at', new Date().getDay());
    });
  }

  changeDateRange = (e) => {
    this.setState({ date_range: { ...this.state.date_range, [e.target.name]: e.target.value } }, () => {
      this.props.filter(this.state);
      localStorage.setItem('filters', JSON.stringify(this.state));
      localStorage.setItem('updated_at', new Date().getDay());
    });
  }

  changeDayOfWeek = (e) => {
    const day_of_week = this.state.day_of_week;
    const index = day_of_week.indexOf(parseInt(e.target.value, 10));
    if (index > -1) {
      day_of_week.splice(index, 1);
    } else {
      day_of_week.push(parseInt(e.target.value, 10));
    }
    this.setState({ day_of_week }, () => {
      this.props.filter(this.state);
      localStorage.setItem('filters', JSON.stringify(this.state));
      localStorage.setItem('updated_at', new Date().getDay());
    });
  }

  changeLocation = (e) => {
    this.setState({ location: e.target.value, show: false }, () => {
      this.props.fetchLocation(this.state.location);
      localStorage.setItem('filters', JSON.stringify(this.state));
      localStorage.setItem('updated_at', new Date().getDay());
    });
  }

  toggleFilters = () => {
    this.setState({ show: !this.state.show }, () => {
      localStorage.setItem('filters', JSON.stringify(this.state));
      localStorage.setItem('updated_at', new Date().getDay());
    });
  }


  render() {
    let className = "filters"
    if (!this.state.show) {
      className += " hide"
    }
    return (
      <div className="filters-container">
        <div className="search-bar">
          <input type="search"
            className="form-control"
            id="live-search"
            placeholder="Search for events, venues, artists..."
            value={this.state.search}
            onChange={this.onSearch}/>
            <div className="filters-button" onClick={this.toggleFilters}><i className={"fas fa-" + (this.state.show ? "times" : "filter")}></i></div>
        </div>
        <div className={className}>
          <div className="filter-block">
            <select id="region-select" value={this.state.location} onChange={this.changeLocation}>
              <option value="0">All</option>
              <option value="1">SF Bay Area</option>
              <option value="2">Los Angeles</option>
              <option value="3">Atlanta</option>
              <option value="4">Texas</option>
              <option value="5">Miami</option>
              <option value="6">Phoenix</option>
              <option value="7">Massachusetts</option>
            </select>
          </div>
          <div className="filter-block">
            <div className="date-range">
                <input type="date" name="min" value={this.state.date_range.min} onChange={this.changeDateRange}/>
                <span>-</span>
                <input type="date" name="max" value={this.state.date_range.max} onChange={this.changeDateRange}/>
            </div>
          </div>
          <div className="filter-block">
            <div className="days-btns">
              {['S','M','T','W','Th','F','S'].map((day, i) => {
                return (
                  <button className={this.state.day_of_week.indexOf(i) > -1 ? 'btn active' : 'btn'} key={i + '' + day} value={i} onClick={this.changeDayOfWeek}>
                    {day}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }
}


export default Filters;
