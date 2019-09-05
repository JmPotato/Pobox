import React, { Component } from 'react';

// Bootstrap CSS
import Col from 'react-bootstrap/lib/Col';

// Custom CSS
import './MainPanel.css';

class MainPanel extends Component {
    render() {
        return (
            <Col md={4}>
                <h3>{this.props.title}</h3>
            </Col>
      );
    }
}

export default MainPanel;