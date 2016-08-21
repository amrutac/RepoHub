var Repo = React.createClass({

  render: function() {
    return (
      <div className="repo">
        <h3 className="repo-title">{this.props.repo.full_name}</h3>
        { this.props.repo.private ? <span className="repo-private">PRIVATE</span> :
          <span className="repo-private">PUBLIC</span> }
        <div className="repo-description">{this.props.repo.description}</div>
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
      <select value={this.state.selectedOption} onChange={this.handleChange}>
        <option value="0">All</option>
        {options}
      </select>
    );
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
      newValue = oldValue === 1 ? oldValue - 1 : 1;
    } else if (newValue === '>') {
      newValue = oldValue < totalPages ?
        oldValue + 1 : totalPages;
    }
    this.setState({ selectedPage: parseInt(newValue, 10) });
    this.props.onPageSelection(newValue);
  },

  isActive:function(page){
    return 'paginator-item' + ((page == this.state.selectedPage) ? ' active' : ' default');
  },

  render: function() {
    return (<ul className="paginator">
      {this.props.pages.map(function(page) {
        return (
          <li key={page} className={this.isActive(page)}>
            <a onClick={this.handleClick} data-page-number={page}>{page}</a>
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
    var url = '/repos?_sort=name&_limit=' + this.state.pageSize,
      id = parseInt(filterId, 10);

    this.setState({ filterApplied: id });
    if (id) {
      url = '/repos?owner.id=' + id;
    } else {
      url = '/repos?_limit=' + this.state.pageSize;
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
      filterApplied: 0,
      totalRepos: 100,
      pageSize: 10,
    });
  },

  componentDidMount: function() {
    var reposUrl, filtersUrl;

    reposUrl = '/repos?_limit=' + this.state.pageSize + '&_sort=name';
    filtersUrl = '/filters?_sort=namespace';

    //TODO:
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
    if (this.state.filteredRepos) {
      return (
        <div>
          <FilterBy
            filterByList={this.state.filterByList}
            onFilterSelection={this.onFilterSelection} />
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