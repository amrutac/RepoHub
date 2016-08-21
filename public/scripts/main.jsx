var Repo = React.createClass({
  render: function() {
    return (
      <div className="repo">
        <h3 className="repo-title">{this.props.repo.full_name}</h3>
        { this.props.repo.private ? <span className="repo-private">PRIVATE</span> : '' }
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
    var newSelectedOption = e.target.value
    this.setState({ selectedOption: newSelectedOption });
    this.props.onFilterSelected(newSelectedOption);
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

var Pagination = React.createClass({

  render: function() {
    console.log(this.props.pages)
    return (<ul>
      {this.props.pages.map(function(page){
        return <li key={page}><a>{page}</a></li>;
      })}
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
    while (i++ < total) {
      pages.push(i);
    }
    if (pages.length >= 2) {
      pages.unshift('<');
      pages.push('>');
    }

    return pages;
  },

  setSelectedFilter: function(filterId) {
    var url = '/repos?_limit=' + this.state.pageSize;

    if (filterId == 0) {
      url = '/repos?_limit=' + this.state.pageSize;
    } else {
      url = '/repos?owner.id=' + filterId + '&_limit=' + this.state.pageSize;
    }
    this.fetchJson(url).then(function(repos) {
      var pages;
      pages = filterId == 0 ? this.setPages(200) : this.setPages(repos.length);
      this.setState({ filteredRepos: repos, pages: pages });
    }.bind(this));
  },

  getInitialState: function() {
    return ({
      filteredRepos: [],
      filterByList: [],
      pages: [],
      pageSize: 10
    });
  },

  componentDidMount: function() {

    this.fetchJson('/repos?_limit=' + this.state.pageSize).then(function(repos) {
      this.fetchJson('/filters').then(function(filters) {
        var pages;
        //Hardcoding this since I was unable to retrieve the
        //headers from returned by the response object
        pages = this.setPages(200);

        return this.setState({
          originalReposSet: repos,
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
            onFilterSelected={this.setSelectedFilter} />
          <ReposList repos={this.state.filteredRepos} />
          <Pagination pages={this.state.pages} />
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