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
  args  = ["cd back && npm i -g serverless && npm i && npm run deploy"]
  secrets = ["AWS_ACCESS_KEY_ID", "AWS_SECRET_ACCESS_KEY"]
}

workflow "Front Publish" {
  on = "push"
  resolves = ["Git Push"]
}

action "isMaster2" {
  uses = "actions/bin/filter@master"
  args = "branch master"
}

action "Remove Public" {
  uses = "actions/bin/sh@master"
  needs = ["isMaster2"]
  args = ["rm -rf front/out/"]
}

action "Create Public" {
  uses = "actions/bin/sh@master"
  needs = ["Remove Public"]
  args = ["mkdir front/out"]
}

action "Checkout gh-pages" {
  uses = "jukefr/actions/git@master"
  needs = ["Create Public"]
  args = ["worktree add -B gh-pages front/out origin/gh-pages"]
}

action "Clean Public (gh-pages)" {
  uses = "actions/bin/sh@master"
  needs = ["Checkout gh-pages"]
  args = ["rm -rf front/out/*"]
}

action "Add Config" {
  uses = "actions/bin/sh@master"
  needs = ["Clean Public (gh-pages)"]
  secrets = ["FRONT_SECRETS"]
  args = ["echo $FRONT_SECRETS >> front/config.json"]
}

action "Build2" {
  uses = "jukefr/actions/node@master"
  needs = ["Add Config"]
  args  = ["cd front && npm i && npm run build"]
}

action "Add .nojekyll" {
  uses = "actions/bin/sh@master"
  needs = ["Build2"]
  args = ["echo nextjs >> front/out/.nojekyll"]
}

action "Git Add" {
  uses = "jukefr/actions/git@master"
  needs = ["Add .nojekyll"]
  args = ["-C front/out add --all"]
} 

action "Git Commit" {
  uses = "jukefr/actions/git@master"
  needs = ["Git Add"]
  args = ["-C front/out commit -m github-actions-build"]
}

action "Git Push" {
  uses = "jukefr/actions/git@master"
  needs = ["Git Commit"]
  secrets = ["GIT_TOKEN", "GIT_USER"]
  args = ["push origin gh-pages"]
}


