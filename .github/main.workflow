workflow "Back Publish" {
  on = "push"
  resolves = ["Serverless"]
}

action "isMaster" {
  uses = "actions/bin/filter@master"
  args = "branch master"
}

action "Serverless" {
  uses = "jukefr/actions/node@master"
  needs = ["isMaster"]
  args  = ["cd back && npm i -g serverless && npm i && npm run deploy"]
  secrets = ["AWS_ACCESS_KEY_ID", "AWS_SECRET_ACCESS_KEY", "AUTH0_CLIENT_ID", "AUTH0_CLIENT_PUBLIC_KEY"]
}

workflow "Front Publish" {
  on = "push"
  resolves = ["Now"]
}

action "isMaster2" {
  uses = "actions/bin/filter@master"
  args = "branch master"
}

action "Add Config" {
  uses = "actions/bin/sh@master"
  needs = ["isMaster2"]
  secrets = ["FRONT_SECRETS"]
  args = ["echo \"$FRONT_SECRETS\" >> front/config.json"]
}

action "Now" {
  uses = "jukefr/actions/node@master"
  needs = ["Add Config"]
  args  = ["cd front && npm i -g now --unsafe-perm && npm i && now --token=$ZEIT_TOKEN && now --token=$ZEIT_TOKEN alias"]
  secrets = ["ZEIT_TOKEN"]
}



