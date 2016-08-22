var Repo = React.createClass({

  render: function() {
    return (
      <div className="repo-wrapper">
        <div className="repo">
          <div className="repo__title">
            <span className="repo__login">{this.props.repo.owner.login}</span>
            <span>&#47;</span>
            <span className="repo__name"><strong>{this.props.repo.name}</strong></span>
            {this.props.repo.private ? <span className="repo__type repo-type--private">Private</span> :
              '' }
          </div>
          <div className="repo__description">
            {this.props.repo.description}
          </div>
        </div>
      </div>);
  }
});

var ReposList = React.createClass({

  render: function() {
    var list = [];

    this.props.repos.forEach(function(repo) {
      list.push(<Repo repo={repo} key={repo.id} />);
    });
    return (<div className="repos-list">{list}</div>);
  }
});

var FilterBy = React.createClass({

  getInitialState: function() {
    return {
      selectedOption: 0
    }
  },

  handleChange: function (e) {
    var newSelectedOption = e.target.value;
    this.setState({ selectedOption: newSelectedOption });
    this.props.onFilterSelection(newSelectedOption);
  },

  render: function() {
    var options = [];

    this.props.filterByList.forEach(function(filter) {
      options.push(
        <option value={filter.id} key={filter.id}>
          {filter.namespace}
        </option>
      );
    });
    return (
      <div className="filterby-wrapper">
        <div>Filter By</div>
        <div className="filterby">
          <select
            className="filterby__select"
            value={this.state.selectedOption}
            onChange={this.handleChange}>
            <option className="filterby__option" value="0">All</option>
            {options}
          </select>
        </div>
      </div>
    );
  }
});

var Button = React.createClass({
  render: function() {
    return (<button className="button">New repository</button>)
  }
});

var Paginator = React.createClass({

  getInitialState: function() {
    return {
      selectedPage: 1
    }
  },

  handleClick: function (e) {
    var oldValue, newValue, totalPages;

    oldValue = this.state.selectedPage;
    newValue = e.target.dataset.pageNumber;
    totalPages = this.props.pages.length - 2;

    if (newValue === '<') {
      newValue = oldValue !== 1 ? oldValue - 1 : 1;
    } else if (newValue === '>') {
      newValue = oldValue < totalPages ?
        oldValue + 1 : totalPages;
    }
    this.setState({ selectedPage: parseInt(newValue, 10) });
    this.props.onPageSelection(newValue);
  },

  isActive:function(page){
    return 'paginator__item' + ((page == this.state.selectedPage) ?
      ' paginator__item--active' :
      ' paginator__item--default');
  },

  render: function() {
    return (<ul className="paginator">
      {this.props.pages.map(function(page) {
        return (
          <li key={page} className={this.isActive(page)}
            onClick={this.handleClick}
            data-page-number={page}>
            {page}
          </li>
        );
      }.bind(this))}
    </ul>)
  }
});

var FilterableReposList = React.createClass({

  fetchJson: function(url) {
    return fetch(url, {
      method: 'GET',
      mode: 'cors',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      }})
      .then(function(res) {
        return res.json();
      });
  },

  setPages: function(reposLen) {
    var pages = [], total, i = 0;

    total = Math.floor(reposLen/this.state.pageSize);

    if (reposLen % 10) {
      total++;
    }
    while (i++ < total) {
      pages.push(i);
    }
    if (pages.length >= 2) {
      pages.unshift('<');
      pages.push('>');
    }

    return pages;
  },

  onFilterSelection: function(filterId) {
    var url = '/repos?_sort=name',
      id = parseInt(filterId, 10);

    this.setState({ filterApplied: id });
    if (id) {
      url += '&owner.id=' + id;
    } else {
      url += '&_limit=' + this.state.pageSize;
    }

    this.fetchJson(url).then(function(repos) {
      var pages;
      pages = id ? this.setPages(repos.length) :
        this.setPages(this.state.totalRepos);
      this.setState({ filteredRepos: repos.slice(0, 10), pages: pages });
    }.bind(this));
  },

  onPageSelection: function(page) {
    var from, to,
      url = '/repos?_sort=name&_limit=' + this.state.pageSize;

    to = page * 10;
    from = (to - 10);

    if (this.state.filterApplied) {
      url += '&owner.id=' + this.state.filterApplied +
        '&_start=' + from;
    } else {
      url += '&_start=' + from;
    }
    this.fetchJson(url).then(function(repos) {
      this.setState({ filteredRepos: repos });
    }.bind(this));
  },

  getInitialState: function() {
    return ({
      filteredRepos: [],
      filterByList: [],
      pages: [],
      activePage: 1,
      filterApplied: 0,
      totalRepos: 100,
      pageSize: 10,
    });
  },

  componentDidMount: function() {
    var reposUrl, filtersUrl;

    reposUrl = '/repos?_limit=' + this.state.pageSize + '&_sort=name';
    filtersUrl = '/filters?_sort=namespace';

    //TODO: Promises.all
    this.fetchJson(reposUrl).then(function(repos) {
      this.fetchJson(filtersUrl).then(function(filters) {
        var pages;
        //Hardcoding this since I was unable to retrieve the
        //headers from returned by the response object
        pages = this.setPages(this.state.totalRepos);

        return this.setState({
          filteredRepos: repos,
          filterByList: filters,
          pages: pages
        });
      }.bind(this));


    }.bind(this));
  },

  render: function() {
    if (this.state.filteredRepos && this.state.filterByList) {
      return (
        <div className="repos-list-wrapper">
          <div className="repos-list-header">
            <FilterBy
              filterByList={this.state.filterByList}
              onFilterSelection={this.onFilterSelection} />
            <Button />
          </div>
          <ReposList repos={this.state.filteredRepos} />
          <Paginator pages={this.state.pages}
            onPageSelection={this.onPageSelection} />
        </div>
      );
    } else {
      return (<div>Loading..</div>)
    }
  }
});

ReactDOM.render(
  <FilterableReposList />,
  document.getElementById('container')
);