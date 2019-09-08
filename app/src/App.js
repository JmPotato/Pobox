import React, { Component } from "react";
import Cookies from "js-cookie"
import { BrowserRouter as Router, Route } from "react-router-dom";

// Bootstrap CSS
import Navbar from "react-bootstrap/lib/Navbar";
import Row from "react-bootstrap/lib/Row";
import Grid from "react-bootstrap/lib/Grid";
import Col from 'react-bootstrap/lib/Col';
import Glyphicon from 'react-bootstrap/lib/Glyphicon';
import Button from 'react-bootstrap/lib/Button';

import "bootstrap/dist/css/bootstrap.min.css";

// Custom CSS
import "./App.css";

import LoginForm from "./Component/LoginForm";
import MainPanel from "./Component/MainPanel";

import Api from "./Logic/Api";

class MainPage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      login: false
    };

    this.onLogin = this.onLogin.bind(this);
  }

  componentDidMount() {
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
    Cookies.set("token", data.token, { expires: 7 });
    this.setState({
      login: true,
    });
  }

  render() {
    var content;
    if (this.state.login) {
      return (<MainPanel title="Home Page" />);
    } else {
      return (<LoginForm onLogin={this.onLogin} />);
    }
  }
}

class SharePage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      file: null
    }
  }

  componentDidMount() {
    const path = this.props.match.params.path
    Api.getFileInfoWithShareUrl(path).then(response => {
      if (response.ok) {
        response.json().then(responseJson => {
          this.setState({
            file: responseJson.data
          })

          var share_token = Cookies.get('share_token');

          Cookies.set('share_token', responseJson.data.share_token, { expires: 1 });
        })
      }
    })
  }

  render() {
    if (!this.state.file) {
      return (
        <Col md={4} mdOffset={4}>
          <span>The file you are requesting does not exists!</span>
        </Col>
      );
    }
    return (
      <Row>
        <Col md={1} mdOffset={4}>
          <Glyphicon glyph='file' style={{ 'fontSize': '90px' }} />
        </Col>
        <Col md={4}>
          <p>{this.state.file.filename}</p>
          <Button style={{ 'marginTop': '25px' }} href={Api.generateShareFileDownloadUrl(this.props.match.params.path)}><Glyphicon glyph='save-file' />Download</Button>
        </Col>
      </Row>
    );
  }
}

const App = () => (
  <Router>
    <Grid>
      <Row>
        <Navbar>
          <Navbar.Header>
            <Navbar.Brand>
              <a href="/">Pobox</a>
            </Navbar.Brand>
          </Navbar.Header>
        </Navbar>
        <Route path="/" exact component={MainPage} />
        <Route path="/s/:path" component={SharePage} />
      </Row>
    </Grid>
  </Router>
);


export default App;
