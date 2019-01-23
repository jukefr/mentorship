workflow "Back Publish" {
  on = "push"
  resolves = ["Build"]
}

action "isMaster" {
  uses = "actions/bin/filter@master"
  args = "branch master"
}

action "Build" {
  uses = "jukefr/actions/node@master"
  needs = ["isMaster"]
  args  = ["cd back && npm i -g serverless && npm i && npm run deploy"]
  secrets = ["AWS_ACCESS_KEY_ID", "AWS_SECRET_ACCESS_KEY", "AUTH0_CLIENT_ID", "AUTH0_CLIENT_PUBLIC_KEY"]
}


