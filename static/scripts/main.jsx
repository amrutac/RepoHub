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

var FilterableReposList = React.createClass({

  loadReposFromGit: function() {
    return fetch('https://api.github.com/repositories?since=364', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      }})
      .then(function(res) {
        return res.json();
      });
  },

  setSelectedFilter: function(filterId) {
    var newFilteredRepos;

    if (filterId == 0) {
      this.setState({ filteredRepos: this.state.originalReposSet });
    } else {
      newFilteredRepos = this.state.originalReposSet.filter(function(repo) {
        return repo.owner.id == filterId;
      });
      this.setState({ filteredRepos: newFilteredRepos });
    }
  },

  getInitialState: function() {
    return ({ originalReposSet: [], filteredRepos: [], filterByList: [] });
  },

  componentDidMount: function() {
    this.loadReposFromGit().then(function(repos) {
      var unique = [], filterByList = [];
      repos.forEach(function(repo) {
        if (!unique.includes(repo.owner.id)) {
          unique.push(repo.owner.id);
          filterByList.push({
            id: repo.owner.id,
            namespace: repo.owner.login,
            avatar: repo.owner.avatar_url
          });
        }

      });
      return this.setState({
        originalReposSet: repos,
        filteredRepos: repos,
        filterByList: filterByList
      });
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