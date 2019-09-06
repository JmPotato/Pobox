import React, { Component } from "react";
import Cookies from "js-cookie"

// Bootstrap CSS
import Navbar from "react-bootstrap/lib/Navbar";
import Row from "react-bootstrap/lib/Row";
import Grid from "react-bootstrap/lib/Grid";

import "bootstrap/dist/css/bootstrap.min.css";

// Custom CSS
import "./App.css";

import LoginForm from "./Component/LoginForm";
import MainPanel from "./Component/MainPanel";

import Api from "./Logic/Api";

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      login: false
    };

    this.onLogin = this.onLogin.bind(this);
  }

  componentWillMount() {
    var token = Cookies.get("token");
    if (token) {
      Api.auth(token).then(response => {
        if (response.ok) {
          this.setState({
            login: true,
          });
        }
      });
    }
  }

  onLogin(data) {
    Cookies.set("token", data.token, {expires: 7});
    this.setState({
      login: true,
    });
  }

  render() {
    var content;
    if (this.state.login) {
      content = <MainPanel title="Home Page"/>;
    } else {
      content = <LoginForm onLogin={this.onLogin}/>;
    }
    return (
      <Grid>
        <Row>
          <Navbar>
            <Navbar.Header>
              <Navbar.Brand>
                <a href="/">Pobox</a>
              </Navbar.Brand>
            </Navbar.Header>
          </Navbar>
          {content}
        </Row>
      </Grid>
    );
  }
}

export default App;
