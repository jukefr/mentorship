workflow "Back Publish" {
  on = "push"
  resolves = ["Build"]
}

action "isMaster" {
  uses = "actions/bin/filter@master"
  args = "branch master"
}

action "Add Public Key" {
  uses = "actions/bin/sh@master"
  args = ["echo $PUBLIC_KEY_PEM >> back/public_key.pem"]
  needs = ["isMaster"]
  secrets = ["PUBLIC_KEY_PEM"]
}

action "Add Secrets" {
  uses = "actions/bin/sh@master"
  args = ["echo $BACK_SECRETS >> back/secrets.json"]
  needs = ["Add Public Key"]
  secrets = ["BACK_SECRETS"]
}

action "Build" {
  uses = "jukefr/actions/node@master"
  needs = ["Add Secrets"]
  args  = ["cd back && npm i && npm run deploy"]
}

