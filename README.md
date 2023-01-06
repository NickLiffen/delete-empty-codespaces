# Delete Empty Codespaces Action

An action which deletes codespaces which have no unpublished or uncommitted changes.

## Usage

Create a new PAT and assign it **only** the `codespace` scope. 

Create a new workflow that looks something like this. 

```yml
name: Delete Codespaces Nightly

on:
  workflow_dispatch:
  schedule:
    - cron: '0 2 * * *' # run at 2 AM UTC

jobs:
  nightly:
    name: Deploy nightly
    runs-on: ubuntu-latest
    steps:

      - name: Deploy Windows release
        uses: NickLiffen/delete-empty-codespaces@v1.0.0
        with:
          GITHUB_TOKEN: ${{ secrets.TOKEN }}

```