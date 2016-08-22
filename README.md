# Repo hub

## Browsers tested on OSX
Chrome (Latest version)
Mozilla Firefox (Latest version)

## External Libraries used in the project
Font awesome (http://fontawesome.io/icons/)
Used for icons in the project.

## React components
 |- FilterableRepoList
  |- FilterBy
  |- RepoList
      |- Repo
  |- Paginator

## Run the app
Download the repo and run the json server
`json-server --watch db.json`

## Notes
Uses json-server for mock APIs.
The Mock data is list of public repos returned by git and the corresponding namespace filters
Test plan can be found under spec folder.
