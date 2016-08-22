# Repo hub

## Browsers tested on OSX
Chrome (Latest version)
Mozilla Firefox (Latest version)

## External Libraries used in the project
Font awesome (http://fontawesome.io/icons/)
Used for icons in the project.

## React components
FilterableRepoList
  FilterBy
    RepoList
      Repo
  Paginator

## Run the app
Download the repo and run the json server
`json-server --watch db.json`

## Notes
Uses json-server for mock APIs.
The Mock data is list of public repos returned by git and the corresponding namespace filters
Test plan can be found under spec folder.

##Known Issues
Total number of repos has been hardcoded since the fetch api response headers are coming back empty, even though the server returns the total count in the headers.

Bug in pagination where the state of the selected page is persisted even after the filter is applied, need to reset the selectedpage to 1 when filters are applied.

