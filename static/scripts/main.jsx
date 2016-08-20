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
    var lastCategory = null;
    this.props.repos.forEach(function(repo) {
      list.push(<Repo repo={repo} key={repo.id} />);
    });
    return (<div className="repos-list">{list}</div>);
  }
});

var FilterBy = React.createClass({
  render: function() {
    return (
      <form>
        <input type="text" placeholder="Search..." />
      </form>
    );
  }
});

var FilterableReposList = React.createClass({
  loadReposFromGit: function() {
    fetch('https://api.github.com/repositories?since=364', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      }})
      .then(function(res) {
        return res.json();
       })
      .then(function(repos) {
        return this.setState({ repos: repos });
       }.bind(this));
  },

  getInitialState: function() {
    return {data: []};
  },

  componentDidMount: function() {
    this.loadReposFromGit();
  },

  render: function() {
    if (this.state.repos) {
      return (
        <div>
          <FilterBy />
          <ReposList repos={this.state.repos} />
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