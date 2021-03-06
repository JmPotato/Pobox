import React, { Component } from "react";
import md5 from "md5";

// Bootstrap
import Button from "react-bootstrap/lib/Button";

import Col from "react-bootstrap/lib/Col";
import Alert from "react-bootstrap/lib/Alert";
import FormGroup from "react-bootstrap/lib/FormGroup";
import FormControl from "react-bootstrap/lib/FormControl";

// Custom CSS
import "./LoginFrom.css";

import Api from "../Logic/Api";

class LoginFrom extends Component {
    constructor(props) {
        super(props);

        this.state = {
            error: false
        }

        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleSubmit(e) {
        e.preventDefault();
        const userinfo = {username: this.username, validation: md5(this.username + this.password)};

        Api.login(userinfo).then(response => {
            if (!response.ok) {
                this.setState({ error: true });
                return;
            }
            response.json().then(data => this.props.onLogin(data))
        })
    }

    render() {
        var alert;
        if (this.state.error) {
            alert = (
                <Alert bsStyle="danger">
                    <strong>Error: </strong>Wrong email or password.
                </Alert>
            );
        } else {
            alert = <span></span>
        }

        return (
            <Col md={4} mdOffset={4}>
                <h3>Login</h3>
                {alert}
                <form id="loginForm" onSubmit={this.handleSubmit}>
                    <FormGroup>
                        <FormControl type="text" placeholder="Username" onChange={evt => this.username = evt.target.value} />
                    </FormGroup>
                    <FormGroup>
                        <FormControl type="password" placeholder="Password" onChange={evt => this.password = evt.target.value} />
                    </FormGroup>
                    <FormGroup>
                        <FormControl id="submitButton" type="submit" value="Login" />
                    </FormGroup>
                </form>
            </Col>
        );
    }
}

export default LoginFrom;