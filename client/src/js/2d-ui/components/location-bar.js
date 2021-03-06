import React, { Component } from 'react'
import Button from './button'
import NewFolder from './data/new-folder'
import TextEditor from './data/text-editor'
import UploadFiles from './data/upload-files'

let styles = {
  bar: () => {
    return {
      cursor: 'pointer',
      width: '100%',
      left: '0',
      top: '0',
      position: 'fixed',
      paddingLeft: '74px',
      marginTop: '0.2em',
      height: '48px',
      display: 'inline-block',
      marginRight: '0.5em',
      marginBottom: '1em'
    }
  },
  title: {
    width: '100%',
    height: '40px',
    display: 'block',
    backgroundColor: 'rgba(0,0,0,0.2)'
  },
  option: {
    fontSize: "20pt",
    display: 'inline-block',
    float: 'left',
    marginRight: '0.5em'
  },
  home: {
    fontSize: "20pt",
    display: 'inline-block',
    float: 'left',
    marginLeft: '1em'
  },
  fileOption: {
    padding: '1em',
    paddingBottom: 0,
    height: '48px',
    display: 'inline-block',
    width: 'auto'
  },
  fileOptions: {
    position: 'fixed',
    right: '60px',
    top: '14px',
    height: '60px',
    display: 'inline-block'
  }
}

export default class LocationBar extends Component {
  componentWillMount () {
    this.setState({

    })
  }
  render() {
    return (
        <div style={ Object.assign({}, styles.bar(), this.props.style) }>
          <div onClick={ e=> { this.props.onItemSelect(this.props.label, 0) } }
               style={styles.home}
          >
            <span style={{ marginRight: '0.3em' }}>
              { this.props.label }
            </span>
          </div>
            {
              this.props.path.map((opt, i) =>{
                return (
                  <div style={styles.option}
                       onClick={ e=> { this.props.onItemSelect(opt, i) } }
                       key={i}
                  >
                    { opt } /
                  </div>
                )
              })
            }
            { this.props.showFileOptions ? (
              <div style={styles.fileOptions}>
                
                <TextEditor username={ this.props.username } path={ this.props.path } />
                <NewFolder username={ this.props.username } path={ this.props.path } />
              </div>) : ""
            }
        </div>
    )
  }
}
//<UploadFiles username={ this.props.username } path={ this.props.path } />
LocationBar.defaultProps = {
  path: [],
  username: "",
  label: "",
  style: {},
  showFileOptions: false,
  onOptionClick: (e, option) => {

  }
}
