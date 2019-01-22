import React from "react";
import Cookie from "js-cookie";
import PropTypes from "prop-types";
import {Link} from "next";
import fetch from "isomorphic-fetch";
import styled from "styled-components";

import defaultPage from "../hocs/defaultPage";

const SecretContent = styled.div`
  background-color: #ecf0f1;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24);
  border-radius: 2px;
  padding: 10px;
  min-height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #333;
  text-align: center;
  font-size: 40px;
  font-weight: 100;
  margin-bottom: 30px;
`;

const Main = styled.div`
  max-width: 750px;
  margin: 0 auto;
  text-align: center;
`;
const Heading = styled.h1`
  font-size: 40px;
  font-weight: 200;
  line-height: 40px;
`;
const Content = styled.p`
  font-size: 20px;
  font-weight: 200;
  line-height: 30px;
`;
const ContentLink = styled.a`
  color: #333;
  padding-bottom: 2px;
  border-bottom: 1px solid #ccc;
  text-decoration: none;
  font-weight: 400;
  line-height: 30px;
  transition: border-bottom 0.2s;
  &:hover {
    border-bottomcolor: #333;
  }
`;

const SuperSecretDiv = () => (
  <SecretContent>This is a super secret div.</SecretContent>
);

const createLink = (href, text) => (
  <ContentLink href={href}>{text}</ContentLink>
);

const getPublic = () => {
  fetch(
    "https://7il6ru8up2.execute-api.eu-west-1.amazonaws.com/dev/list?userId=snowflake"
  ).then(res => console.log(res));
};

const getPrivate = () => {
  const token = Cookie.getJSON('idToken');
  fetch("https://7il6ru8up2.execute-api.eu-west-1.amazonaws.com/dev/post", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ userId: "4awfw56", name: "deawfawfcorationwap" })
  }).then(res => console.log(res));
};

const Index = ({ isAuthenticated }) => (
  <div>
    {isAuthenticated && <SuperSecretDiv />}
    <Main>
      <Heading>Hello, friend!</Heading>
      <Content>
        This is a super simple example of how to use{" "}
        {createLink("https://github.com/zeit/next.js", "next.js")} and{" "}
        {createLink("https://auth0.com/", "Auth0")} together.
      </Content>
      <button onClick={getPublic}>LIST</button>
      <button onClick={getPrivate}>POST</button>
      {!isAuthenticated && (
        <Content>
          You're not authenticated yet. Maybe you want to{" "}
          <Link href="/auth/sign-in">
            {createLink("/auth/sign-in", "sign in")}
          </Link>{" "}
          and see what happens?
        </Content>
      )}
      {isAuthenticated && (
        <Content>
          Now that you're authenticated, maybe you should try going to our{" "}
          <Link href="/secret">
            {createLink("/secret", "super secret page")}
          </Link>
          !
        </Content>
      )}
    </Main>
  </div>
);

Index.propTypes = {
  isAuthenticated: PropTypes.bool.isRequired
};

export default defaultPage(Index);
