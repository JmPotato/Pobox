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
            addFolderError: false,

            files: [],
            showAddFileDialog: false,
            addFileError: false,

            selectedFolder: ""
        };

        this.addFolder = this.addFolder.bind(this);
        this.deleteFolder = this.deleteFolder.bind(this);
        this.addfile = this.addFile.bind(this);
        this.deleteFile = this.deleteFile.bind(this);
    }

    refreshFolderList() {
        Api.getFolders().then(response => {
            if (response.ok) {
                response.json().then(data => {
                    this.setState({
                        folders: data.data
                    });
                })
            }
        })
    }

    refreshFileList() {
        if (!this.state.selectedFolder) {
            this.setState({
                files: []
            });
            return;
        }

        Api.getFolder(this.state.selectedFolder.name).then(response => {
            if (response.ok) {
                response.json().then(data => {
                    console.log(data);

                    this.setState({
                        files: data.data.files
                    });
                });
            }
        });
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

    addFile() {
        if (this.state.selectedFolder) {
            Api.addFile(this.state.selectedFolder.name, this.newFile).then(response => {
                this.setState({
                    addFileError: !response.ok
                });

                if (response.ok) {
                    this.setState({
                        showAddFileDialog: false
                    });
                    this.refreshFileList();
                }
            });
        }
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
                if (this.state.selectedFolder.name == folderName) {
                    this.state.selectedFolder = ""
                }
                Api.deleteFolder(folderName)
                    .then(response => {
                        if (response.ok) {
                            swal("Your folder has been deleted.", {
                                icon: "success",
                            });

                            this.refreshFolderList();
                            this.refreshFileList();
                        }
                    });
            } else {
                swal("Your folder is safe.");
            }
        })
    }

    deleteFile(fileName) {
        // Confirm to delete a file first
        swal({
            title: "Are you sure?",
            text: "You will not be able to recover this file!",
            icon: "warning",
            buttons: true,
            dangerMode: true,
        }).then(willDelete => {
            if (willDelete) {
                Api.deleteFile(this.state.selectedFolder.name, fileName).then(response => {
                    if (response.ok) {
                        swal("Your file has been deleted.", {
                            icon: "success",
                        });

                        this.refreshFileList();
                    }
                });
            } else {
                swal("Your file is safe.");
            }
        })
    }

    changeSelectedFolder(id) {
        if (this.state.selectedFolder.id == id) {
            return;
        }

        this.setState({
            selectedFolder: this.state.folders.find(x => x.id == id)
        }, () => {
            this.refreshFileList();
        });
    }

    componentDidMount() {
        this.refreshFolderList();
        this.refreshFileList();
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
                    <a onClick={() => this.changeSelectedFolder(folder.id)}>
                        <Glyphicon className="folderIcon" glyph='folder-close' />
                        <span className="folderName">{folder.name}</span>
                    </a>
                    <a onClick={() => this.deleteFolder(folder.name)}>
                        <Glyphicon className="removeFolderIcon" glyph='remove' />
                    </a>
                </ListGroupItem>
            )
        });

        var addFileAlert;
        if (!this.state.selectedFolder) {
            addFileAlert = (
                <Alert bsStyle="danger">
                    <strong>Error: </strong>Please select a folder first.
                </Alert>
            );
        } else if (this.state.addFileError) {
            addFileAlert = (
                <Alert bsStyle="danger">
                    <strong>Error: </strong>Please check your file name.
                </Alert>
            );
        } else {
            addFileAlert = <span></span>
        }

        const fileList = this.state.files.map(file => {
            return (
                <ListGroupItem key={file.id}>
                    <a>
                        <Glyphicon className="fileIcon" glyph='file' />
                        <span className="fileName">{file.filename}</span>
                    </a>
                    <a onClick={() => this.deleteFile(file.filename)}>
                        <Glyphicon className="removeFileIcon" glyph='remove' />
                    </a>
                    <a href={Api.getFile(this.state.selectedFolder.name, file.filename)}>
                        <Glyphicon className="downloadFileIcon" glyph='download-alt' />
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
                            <Button onClick={() => this.addFolder()} bsStyle="primary">Add</Button>
                        </Modal.Footer>
                    </Modal>
                </Col>
                <Col md={8}>
                    <Button id="addFileButton" onClick={() => this.setState({ showAddFileDialog: true })} bsStyle="primary">New File {this.state.selectedFolder ? 'for ' + this.state.selectedFolder.name : ''}</Button>
                    <p></p>
                    <ListGroup>
                        {fileList}
                    </ListGroup>

                    <Modal show={this.state.showAddFileDialog} onHide={() => this.setState({ showAddFileDialog: false })}>
                        <Modal.Header>
                            <Modal.Title>Add File</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            {addFileAlert}
                            <FormControl type="file" placeholder="Add file" onChange={evt => this.newFile = evt.target.files[0]} />
                        </Modal.Body>
                        <Modal.Footer>
                            <Button onClick={() => this.setState({ showAddFileDialog: false })}>Close</Button>
                            <Button onClick={() => this.addFile()} bsStyle="primary">Add</Button>
                        </Modal.Footer>
                    </Modal>
                </Col>
            </Row >
        );
    }
}

export default MainPanel;