import React, { Component } from "react";

import "./Auth.css";
import AuthContext from "../components/context/authContext";

class Auth extends Component {
  state = {
    isLogin: true
  };

  static contextType = AuthContext;

  constructor(props) {
    super(props);
    this.emailEl = React.createRef();
    this.passwordEl = React.createRef();
  }

  onSwitchMode = () => {
    this.setState(prevState => {
      return { isLogin: !prevState.isLogin };
    });
  };

  onSubmit = e => {
    e.preventDefault();

    const email = this.emailEl.current.value;
    const password = this.passwordEl.current.value;

    if (email.trim().length === 0 || password.trim().length === 0) {
      return;
    }

    let requestBody = {
      query: `
        query {
          login(email: "${email}", password: "${password}") {
            userId
            token
            tokenExpiration
          }
        }
      `
    };

    if (!this.state.isLogin) {
      requestBody = {
        query: `
          mutation {
            createUser(userInput: {email: "${email}", password: "${password}"} ) {
              _id
              email
            }
          }
        `
      };
    }

    fetch("http://localhost:8000/graphql", {
      method: "POST",
      body: JSON.stringify(requestBody),
      headers: {
        "Content-Type": "application/json"
      }
    })
      .then(res => {
        if (res.status !== 200 && res.status !== 201) {
          throw new Error("Failed!");
        }
        return res.json();
      })
      .then(resData => {
        if (resData.data.login.token) {
          this.context.login(
            resData.data.login.token,
            resData.data.login.userId,
            resData.data.login.tokenExpiration
          );
        }
      })
      .catch(err => {
        console.error(err);
      });
  };

  render() {
    return (
      <form className="auth-form" onSubmit={this.onSubmit}>
        <div className="form-control">
          <label for="email">E-mail</label>
          <input type="email" id="email" ref={this.emailEl} />
        </div>

        <div className="form-control">
          <label htmlFor="passwrod">Password</label>
          <input type="password" id="password" ref={this.passwordEl} />
        </div>

        <div className="form-actions">
          <button type="button" onClick={this.onSwitchMode}>
            Switch to {this.state.isLogin ? "Signup" : "Login"}
          </button>
          <button type="submit">Submit</button>
        </div>
      </form>
    );
  }
}

export default Auth;
