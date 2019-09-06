import React, { Component } from 'react';
import swal from 'sweetalert';

// Bootstrap
import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';
import ListGroup from 'react-bootstrap/lib/ListGroup';
import ListGroupItem from 'react-bootstrap/lib/ListGroupItem';
import Glyphicon from 'react-bootstrap/lib/Glyphicon';
import Modal from 'react-bootstrap/lib/Modal';
import Button from 'react-bootstrap/lib/Button';
import FormControl from 'react-bootstrap/lib/FormControl';
import Alert from 'react-bootstrap/lib/Alert';

// Custom CSS
import './MainPanel.css';

import Api from '../Logic/Api';

class MainPanel extends Component {
    constructor(props) {
        super(props);
        this.state = {
            folders: [],
            showAddFolderDialog: false,
            addFolderError: false
        };

        this.addFolder = this.addFolder.bind(this);
        this.deleteFolder = this.deleteFolder.bind(this);
    }

    refreshFolderList() {
        Api.getFolders().then(response => {
            if (response.ok) {
                response.json().then(data => {
                    this.setState({
                        folders: data.data
                    })
                })
            }
        })
    }

    addFolder() {
        Api.addFolder(this.newFolderName).then(response => {
            this.setState({
                addFolderError: !response.ok
            });

            if (response.ok) {
                this.setState({
                    showAddFolderDialog: false
                });
                this.refreshFolderList();
            }
        });
    }

    deleteFolder(folderName) {
        // Confirm to delete a folder first
        swal({
            title: "Are you sure?",
            text: "You will not be able to recover this folder!",
            icon: "warning",
            buttons: true,
            dangerMode: true,
        }).then(willDelete => {
            if (willDelete) {
                Api.deleteFolder(folderName)
                    .then(response => {
                        if (response.ok) {
                            swal("Your folder has been deleted.", {
                                icon: "success",
                            });

                            this.refreshFolderList();
                        }
                    });
            } else {
                swal("Your folder is safe.");
            }
        })
    }

    componentDidMount() {
        this.refreshFolderList();
    }

    render() {
        var addFolderAlert;
        if (this.state.addFolderError) {
            addFolderAlert = (
                <Alert bsStyle="danger">
                    <strong>Error: </strong>Please check your folder name again.
                </Alert>
            );
        } else {
            addFolderAlert = <span></span>
        }

        const folderList = this.state.folders.map(folder => {
            return (
                <ListGroupItem role="menu" key={folder.id}>
                    <a>
                        <Glyphicon className="folderIcon" glyph='folder-close' />
                        <span className="folderName">{folder.name}</span>
                    </a>
                    <a onClick={() => this.deleteFolder(folder.name)}>
                        <Glyphicon className="removeFolderIcon" glyph='remove' />
                    </a>
                </ListGroupItem>
            )
        });

        return (
            <Row>
                <Col md={4}>
                    <Button id="addFolderButton" onClick={() => this.setState({ showAddFolderDialog: true })} bsStyle="primary">New Folder</Button>
                    <p></p>
                    <ListGroup>
                        {folderList}
                    </ListGroup>

                    <Modal show={this.state.showAddFolderDialog} onHide={() => this.setState({ showAddFolderDialog: false })}>
                        <Modal.Header>
                            <Modal.Title>Add Folder</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            {addFolderAlert}
                            <FormControl type="text" placeholder="Folder Name" onChange={evt => this.newFolderName = evt.target.value} />
                        </Modal.Body>
                        <Modal.Footer>
                            <Button onClick={() => this.setState({ showAddFolderDialog: false })}>Close</Button>
                            <Button onClick={this.addFolder} bsStyle="primary">Add</Button>
                        </Modal.Footer>
                    </Modal>
                </Col>
            </Row >
        );
    }
}

export default MainPanel;