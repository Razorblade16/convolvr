import React, { Component } from 'react'
import Shell from '../shell'

const styles = {
  modal: {
    width: '66.66vh',
    height: '800px',
    minWidth: '360px',
    margin: 'auto',
    display: 'block',
    position: 'relative',
    top: '6vh',
    left: '0px',
    right: '0px',
    bottom: '5vh',
    borderTop: '0.8vh solid rgb(43, 43, 43)',
    background: 'rgb(27, 27, 27)'
  },
  save: {
    float: 'right',
    marginRight: '2em',
    marginTop: '1em',
    fontSize: '1.25em',
    background: '#2b2b2b',
    color: 'white',
    border: 'none',
    padding: '0.5em',
    borderRadius: '3px',
    boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.54)'
  },
  h3: {
    textAlign: 'left',
    width: '45%',
    display: 'inline-block'
  },
  textInput: {

  },
  select: {
    padding: '0.5em'
  },
  admin: {
    marginTop: '3em'
  }
}

class Settings extends Component {
  constructor () {
    this.state = {
      camera: 'fps',
      lighting: 'high',
      aa: 'on',
      postProcessing: 'on',
      defaultWorld: 'overworld',
      welcomeMessage: 'Welcome to Convolvr!'
    }
  }
  componentWillMount () {
    let aa = localStorage.getItem("aa")
    if (aa == null) {
      aa = 'on'
    }
    this.setState({
      camera: localStorage.getItem("camera") || 'fps',
      lighting: localStorage.getItem("lighting") || 'high',
      postProcessing: localStorage.getItem("postProcessing") || 'on',
      aa
    })
  }
  componentWillUpdate(nextProps, nextState) {
    if (this.props.fetchingSettings == true && nextProps.fetchingSettings == false) {
      console.log("Done Loading Universe Settings")
      this.setState({
        defaultWorld: nextProps.settings.defaultWorld,
        welcomeMessage: nextProps.settings.welcomeMessage
      })
    }
  }
  reload () {
    window.location.href = window.location.href
  }
  save () {
    localStorage.setItem('camera', this.state.camera)
    localStorage.setItem('lighting', this.state.lighting)
    localStorage.setItem('aa', this.state.aa)
    localStorage.setItem('postProcessing', this.state.postProcessing)
    this.reload()
  }
  updateUniverseSettings () {
    let data = {
      id: 1,
      defaultWorld: this.state.defaultWorld,
      welcomeMessage: this.state.welcomeMessage
    }
    this.props.updateUniverseSettings(data, this.props.user.Password)
  }
  render() {
    let isAdmin = this.props.user.name == 'admin'
    return (
        <Shell className="settings">
          <div style={styles.modal}>
          <h1>Settings</h1>
          <div>
            <h3 style={styles.h3}>Camera Control Mode</h3>
            <select onChange={e=> { this.setState({camera: e.target.value})}}
                    value={ this.state.camera }
                    style={ styles.select }
            >
              <option value="fps">First Person Camera</option>
              <option value="vehicle">Flight Camera (relative rotation)</option>
            </select>
          </div>
          <div>
            <h3 style={styles.h3}>Lighting Quality</h3>
            <select onChange={e=> {this.setState({lighting: e.target.value})}}
                    value={ this.state.lighting }
                    style={ styles.select }
            >
              <option value="high">High (recommended)</option>
              <option value="low">Low (mobile devices)</option>
            </select>
          </div>
          <div>
            <h3 style={styles.h3}>Antialiasing</h3>
            <select onChange={e=> {this.setState({aa: e.target.value})}}
                    value={ this.state.aa }
                    style={ styles.select }
            >
              <option value="on">On (recommended)</option>
              <option value="off">Off (for older GPUs)</option>
            </select>
          </div>
          <div>
            <h3 style={styles.h3}>Post Processing</h3>
            <select onChange={e=> {this.setState({postProcessing: e.target.value})}}
                    value={ this.state.postProcessing }
                    style={ styles.select }
            >
              <option value="on">On (Bloom HDR Effect)</option>
              <option value="off">Off (Better Performance)</option>
            </select>
          </div>
          <input style={styles.save}
                 type='submit'
                 value="Save Settings"
                 onClick={ e=> this.save()}
          />
          <br />
          { isAdmin ? (
            <div style={styles.admin}>
              <h2 style={{marginTop: '1em'}}>Admin Settings</h2>
              <div>
                <h3 style={styles.h3}>Default World</h3>
                <select onChange={e=> { this.setState({defaultWorld: e.target.value})}}
                        value={ this.state.defaultWorld }
                        style={ styles.select }
                >
                {
                  this.props.worlds.map( (world, i) => {
                    return (
                      <option value={world.name} key={i}>{world.name}</option>
                    )
                  })
                }
                </select>
              </div>
              <div>
                <h3 style={styles.h3}>Welcome Message</h3>
                <input onBlur={e=> { this.setState({welcomeMessage: e.target.value})}}
                       style={styles.textInput}
                       type='text'
                />
              </div>
              <input style={styles.save}
                     type='submit'
                     value="Save Admin Settings"
                     onClick={ e=> this.updateUniverseSettings()}
              />
            </div>
          ): ""}

          </div>
        </Shell>
    )
  }
}


import { connect } from 'react-redux';
import {
    sendMessage
} from '../../redux/actions/message-actions'
import {
  fetchWorlds,
  setCurrentWorld,
  updateUniverseSettings
} from '../../redux/actions/world-actions'

export default connect(
  (state, ownProps) => {
    return {
        fetchingSettings: state.worlds.fetchingSettings,
        settings: state.worlds.universeSettings,
        worlds: state.worlds.all,
        user: state.users.loggedIn
    }
  },
  dispatch => {
    return {
      sendMessage: (message, from) => {
          dispatch(sendMessage(message, from))
      },
      setCurrentWorld: (world) => {
          dispatch(setCurrentWorld(world))
      },
      updateUniverseSettings: (data, password) => {
          dispatch(updateUniverseSettings(data, password))
      }
    }
  }
)(Settings)
