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

  loadReposFromGit: function() {
    return fetch('https://api.github.com/repositories?since=66&per_page=9', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      }})
      .then(function(res) {
        return res.json();
      });
  },

  setPages: function(reposLen, pageSize) {
    var pages = ['<'], total, i = 0;
    total = Math.floor(reposLen/pageSize);
    while (i++ < total) {
      pages.push(i);
    }
    pages.push('>');
    return pages;
  },

  setSelectedFilter: function(filterId) {
    var newFilteredRepos, pages, originalSet = this.state.originalReposSet;

    if (filterId == 0) {
      pages = this.setPages(originalSet.length, this.state.pageSize);
      this.setState({ filteredRepos: originalSet, pages: pages });
    } else {
      newFilteredRepos = originalSet.filter(function(repo) {
        return repo.owner.id == filterId;
      });
      pages = this.setPages(newFilteredRepos.length, this.state.pageSize);
      this.setState({ filteredRepos: newFilteredRepos });
    }
  },

  getInitialState: function() {
    return ({
      originalReposSet: [],
      filteredRepos: [],
      filterByList: [],
      pages: [],
      pageSize: 10
    });
  },

  componentDidMount: function() {
    this.loadReposFromGit().then(function(repos) {
      var unique = [], filterByList = [], pages;

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

      pages = this.setPages(repos.length, this.state.pageSize);

      return this.setState({
        originalReposSet: repos,
        filteredRepos: repos,
        filterByList: filterByList,
        pages: pages
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