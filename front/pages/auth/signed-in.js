import React from "react";
import PropTypes from "prop-types";
import Router from "next/router";
import fetch from "isomorphic-fetch";
import Cookie from "js-cookie";
import { getUserFromLocalCookie } from "../../utils/auth";

import { setToken } from "../../utils/auth";
import { parseHash } from "../../utils/auth0";

export default class SignedIn extends React.Component {
  static propTypes = {
    url: PropTypes.object.isRequired
  };

  componentDidMount() {
    parseHash((err, result) => {
      if (err) {
        console.error("Something happened with the Sign In request");
        return;
      }

      setToken(result.idToken, result.accessToken);
      const token = Cookie.getJSON("idToken");
      const user = getUserFromLocalCookie();
      fetch(
        "https://wbdekxswll.execute-api.eu-west-1.amazonaws.com/dev/user/create",
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            sub: `${user.sub}`,
            name: `${user.name}`,
            email: `${user.email}`,
            nickname: `${user.nickname}`
          })
        }
      ).then(() => Router.push("/"));
    });
  }
  render() {
    return null;
  }
}
