import React, { Component } from 'react'
import Shell from '../components/shell'

const styles = {
  innerLogin: {
    width: '100%',
    maxWidth: '800px',
    height: 'auto',
    paddingBottom: '2em',
    minWidth: '360px',
    margin: 'auto',
    display: 'block',
    position: 'relative',
    top: '6vh',
    left: '0px',
    right: '0px',
    borderTop: '0.8vh solid rgb(43, 43, 43)',
    background: 'rgb(27, 27, 27)'
  },
  title: {
    fontSize: "2em",
    paddingTop: "1.5vh",
    paddingBottom: "1vh"
  },
  form: {
    overflowY: 'auto',
    height: '90%',
    overflowX: 'hidden'
  },
  label: {
    marginRight: "1em",
    width: '33.3%',
    display: 'inline-block',
    color: 'rgba(255, 255, 255, 0.85)',
    textAlign: "left"
  },
  setting: {
    width: '66.6%'
  },
  input: {
    background: 'transparent',
    color: 'white',
    padding: '0.5em',
    border: '2px solid rgba(255,255,255,0.25)'
  },
  textInput: {
    width: '100%'
  },
  username: {
    marginBottom: "1em"
  },
  option: {
    marginBottom: "0.75em",
    width: '100%',
    display: 'inline-block'
  },
  go: {

  },
  submit: {
    fontSize: "5vh",
    color: "#929292",
    background: "rgb(255, 255, 255)",
    borderRadius: "0.2vh",
    border: "rgb(107, 104, 104) 0.4vh solid",
    cursor: "pointer"
  },
  signInButton: {
    fontSize: '1em',
    marginRight: '1em'
  },
  fileUpload: {
    marginRight: '1em'
  }
}

class NewWorld extends Component {
  constructor () {
    super()
  }
  componentWillMount() {
    this.state = {
      name: "",
      userName: "space",
      skyType: "shader",
      layers: [],
      photosphere: '',
      red: 1.0,
      green: 1.0,
      blue: 1.0,
      intensity: 0.75,
      lightPitch: 1.64,
      lightYaw: 1.0,
      gravity: 1.0,
      terrainType: 'both',
      terrainColor: 0x404040,
      turbulentTerrain: true,
      highAltitudeGravity: false,
      flatness: 2,
      flatAreas: true,
      entities: true,
      structures: true,
      roads: true,
      npcs: false,
      tools: false,
      vehicles: false,
      orbs: true,
      blocks: true,
      pyramids: true,
      columns: true,
      wheels: true,
      nets: true
    }
  }

  createWorld() {
    let lightColor = [ parseFloat(this.state.red), parseFloat(this.state.green), parseFloat(this.state.blue) ],
        data = {
          id: 0,
          name: this.state.name,
          description: this.state.description,
          tags: [],
          gravity: this.state.gravity,
          highAltitudeGravity: this.state.highAltitudeGravity,
          sky: {
            skyType: this.state.skyType,
            red: lightColor[0],
            green: lightColor[1],
            blue: lightColor[2],
            layers: this.state.layers,
            photosphere: this.state.photosphere
          },
          light: {
            color: 0x1000000 + (Math.floor(lightColor[0] * 255) << 16) + (Math.floor(lightColor[1] * 255) << 8) + Math.floor(lightColor[2] * 255),
            intensity: parseFloat(this.state.intensity),
            pitch: parseFloat(this.state.lightPitch),
            yaw: parseFloat(this.state.lightYaw),
            ambientColor: 0x000000
          },
          terrain: {
            type: this.state.terrainType,
            height: 20000,
            color: this.state.terrainColor,
            turbulent: this.state.turbulentTerrain,
            flatness: parseFloat(this.state.flatness),
            flatAreas: this.state.flatAreas,
            decorations: ""
          },
          spawn: {
            entities: this.state.entities,
            structures: this.state.structures,
            roads: this.state.roads,
            trees: this.state.trees,
            npcs: this.state.npcs,
            tools: this.state.tools,
            vehicles: this.state.vehicles,
            orbs: this.state.orbs,
            blocks: this.state.blocks,
            columns: this.state.columns,
            pyramids: this.state.pyramids,
            wheels: this.state.wheels,
            nets: this.state.nets
          }
      }

    data.userName = this.props.loggedInUser != false ? this.props.loggedInUser.name : 'space' // mark as public / not tied to user if no userName
    if ( this.state.name != "" || this.state.description == "" ) {

      this.props.createWorld( data )

    } else {

      alert("World name & description are required.")

    }

  }
  onToggle( group, which, e ) {
    
    let value = e.target.value,
        state = this.state
        
    state[ group ][ which ] = value

    this.setState(state)

  }
  onSkyTypeChange (e) {
    let value = e.target.value
    this.setState({
      skyType: e.target.value
    })
  }
  onTerrainTypeChange (e) {
    let value = e.target.value
    this.setState({
      terrainType: e.target.value
    })
  }
  onToggleTurbulentTerrain (e) {
    let value= e.target.value
    this.setState({
      turbulentTerrain: value == 'yes' ? true : false
    })
  }
  onToggleFlatAreas ( e ) {
    let value = e.target.value
    this.setState({
      flatAreas: value == 'yes' ? true : false
    })
  }
  onToggleGravity (e) {
    let value= e.target.value
    this.setState({
      gravity: value == 'yes' ? 1.0 : 0.0
    })
  }
  onToggleHighAltitudeGravity (e) {
    let value = e.target.value
    this.setState({
      highAltitudeGravity: value == 'yes' ? true : false
    })
  }
  upload (e) {
    let data = new FormData(),
        username = this.props.loggedInUser != false ? this.props.loggedInUser.name : 'public'
    data.append('file', e.target.files[0])
    this.setState({
      photosphere: username+"/"+e.target.files[0].name.replace(/\s/g, '-')
    })
    this.props.uploadFile(data, username, "")
  }
  render() {
    return (
        <Shell className="login">
          <div style={styles.innerLogin}>
            <div style={styles.title}>
              Create New World
            </div>
            <table className="table new-world" style={{ paddingLeft: "1em", width: "95%" }}>
              <tbody>
              <tr>
                <td>World Name</td>
                <td>
                  <input autoComplete="false"
                         key={"worldName"}
                         ref={(input) => { this.nameInput = input }}
                         type='text'
                         onBlur={(e)=>{ this.setState({name: e.target.value }) }}
                         style={ Object.assign({}, styles.input, styles.textInput) }
                  />
                </td>
                <td></td>
              </tr>
              <tr>
                <td>World Description</td>
                <td colSpan="2">
                  <input autoComplete="false"
                         key={"worldDescription"}
                         ref={(input) => { this.descriptionInput = input }}
                         type='text'
                         onBlur={(e)=>{ this.setState({description: e.target.value }) }}
                         style={ Object.assign({}, styles.input, styles.textInput) }
                  />
                  </td>
              </tr>
              <tr>
                <td>Skybox Type</td>
                <td>
                  <select onChange={ e=> { this.onSkyTypeChange(e) }}>
                    <option value="shader">Gradient Sky</option>
                    <option value="photosphere">Photosphere</option>
                  </select>
                </td>
                <td>
                  {
                  this.state.skyType == 'photosphere' ? (
                    <div style={styles.option}>
                      <span style={styles.label}>Skybox Photosphere</span>
                      <span style={styles.setting}>
                        <input style={styles.fileUpload} type='file' onChange={ (e)=> this.upload(e) } />
                      </span>
                    </div>
                  ) : ""
                }
                </td>
              </tr>
              <tr>
                <td>Light Intensity</td>
                <td>
                  <input type='range' min='0' max='2' step='0.001' onChange={e=> { this.setState({intensity: e.target.value })}}/> { this.state.intensity }
                </td>
                <td></td>
              </tr>
              <tr>
                <td>Light Direction</td>
                <td>
                  Pitch <input type='range' min='0' max='3.14' step='0.001' onChange={e=> { this.setState({lightPitch: e.target.value })}}/> { this.state.lightPitch }
                </td>
                <td>
                  Yaw <input type='range' min='0' max='6.28' step='0.001' onChange={e=> { this.setState({lightYaw: e.target.value })}}/> { this.state.lightYaw }
                </td>
              </tr>
               <tr>
                <td>Light Color: Red</td>
                <td>Green</td>
                <td>Blue</td>
              </tr>
              <tr>
                <td>
                  <input type='range' min='0' max='2' step='0.001'  onChange={e=> { this.setState({red: e.target.value })}}/> 
                  { this.state.red }
                  </td>
                <td>
                  <input type='range' min='0' max='2' step='0.001'  onChange={e=> { this.setState({green: e.target.value })}}/> 
                   { this.state.green }
                </td>
                <td>
                  <input type='range' min='0' max='2' step='0.001' onChange={e=> { this.setState({blue: e.target.value })}} /> 
                   { this.state.blue }
                </td>
              </tr>
               <tr>
                <td>Terrain Color: Red</td>
                <td>Green</td>
                <td>Blue</td>
              </tr>
              <tr>
                <td>
                  <input type='range' min='0' max='2' step='0.001'  onChange={e=> { this.setState({terrainRed: e.target.value })}}/> 
                  { this.state.terrainRed }
                  </td>
                <td>
                  <input type='range' min='0' max='2' step='0.001'  onChange={e=> { this.setState({terrainGreen: e.target.value })}}/> 
                   { this.state.terrainGreen }
                </td>
                <td>
                  <input type='range' min='0' max='2' step='0.001' onChange={e=> { this.setState({terrainBlue: e.target.value })}} /> 
                   { this.state.terrainBlue }
                </td>
              </tr>
              <tr>
                <td>Terrain Type</td>
                <td>
                  <select onChange={ e=> { this.onTerrainTypeChange(e) }}>
                    <option value="both">Voxels + Plane</option>
                    <option value="voxels">Terrain Voxels</option>
                    <option value="plane">Ground Plane</option>
                    <option value="empty">Empty Space</option>
                  </select>
                </td>
                <td></td>
              </tr>
              <tr>
                <td>Flat Areas?</td>
                <td>
                  <select onChange={ e=> { this.onToggleFlatAreas(e) }}>
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                </td>
                <td></td>
              </tr>
              <tr>
                <td>Turbulent Terrain?</td>
                <td>
                  <select onChange={ e=> { this.onToggleTurbulentTerrain(e) }}>
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                </td>
                <td></td>
              </tr>
              <tr>
                <td>Terrain Flatness</td>
                <td>
                  <input type='range' min='1' max='16' step='0.1'  onChange={e=> { this.setState({flatness: e.target.value })}}/>
                </td>
                <td></td>
              </tr>
              <tr>
                <td>Use Gravity?</td>
                <td>
                  <select onChange={ e=> { this.onToggleGravity(e) }}>
                      <option value="yes">Yes</option>
                      <option value="no">No</option>
                    </select>
                </td>
                <td></td>
              </tr>
              <tr>
                <td>(High Altitude) Zero Gravity?</td>
                <td>
                  <select onChange={ e=> { this.onToggleHighAltitudeGravity(e) }}>
                      <option value="yes">Yes</option>
                      <option value="no">No</option>
                    </select>
                </td>
                <td></td>
              </tr>
              <tr>
                <td>Generate Common Entities</td>
                <td></td>
                <td></td>
              </tr>
              <tr>
                <td></td>
                <td>Generate Trees?</td>
                  <td>
                    <select onChange={ e=> { this.onToggle( 'spawn', 'trees', e ) }}>
                      <option value="yes">Yes</option>
                      <option value="no">No</option>
                    </select>
                  </td>
                </tr>
             
              <tr>
                <td></td>
                <td>Generate Roads?</td>
                <td>
                  <select onChange={ e=> { this.onToggle( 'spawn', 'roads', e) }}>
                      <option value="yes">Yes</option>
                      <option value="no">No</option>
                    </select>
                </td>
              </tr>
               <tr>
                <td></td>
                <td>Generate Buildings?</td>
                <td>
                  <select onChange={ e=> { this.onToggle( 'spawn', 'structures', e ) }}>
                      <option value="yes">Yes</option>
                      <option value="no">No</option>
                  </select>
                </td>
              </tr>
               <tr>
                <td></td>
                <td>Generate Vehicles?</td>
                <td>
                  <select onChange={ e=> { this.onToggle( 'spawn', 'vehicles', e ) }}>
                      <option value="yes">Yes</option>
                      <option value="no">No</option>
                  </select>
                </td>
              </tr>
               <tr>
                <td></td>
                <td>Generate Tools?</td>
                <td>
                  <select onChange={ e=> { this.onToggle( 'spawn', 'tools', e ) }}>
                      <option value="yes">Yes</option>
                      <option value="no">No</option>
                  </select>
                </td>
              </tr>
              <tr>
                <td>Generate Mental Imagery</td>
                <td></td>
                <td></td>
              </tr>
              <tr>
                <td></td>
                <td>Generate Orbs?</td>
                <td>
                  <select onChange={ e=> { this.onToggle( 'spawn', 'orbs', e ) }}>
                      <option value="yes">Yes</option>
                      <option value="no">No</option>
                  </select>
                </td>
              </tr>
              <tr>
                <td></td>
                <td>Generate Blocks?</td>
                <td>
                  <select onChange={ e=> { this.onToggle( 'spawn', 'blocks', e) }}>
                      <option value="yes">Yes</option>
                      <option value="no">No</option>
                  </select>
                </td>
              </tr>
              <tr>
                <td></td>
                <td>Generate Columns?</td>
                <td>
                  <select onChange={ e=> { this.onToggle( 'spawn', 'columns', e ) }}>
                      <option value="yes">Yes</option>
                      <option value="no">No</option>
                  </select>
                </td>
              </tr>
              <tr>
                <td></td>
                <td>Generate Wheels?</td>
                <td>
                  <select onChange={ e=> { this.onToggle( 'spawn', 'wheels', e) }}>
                      <option value="yes">Yes</option>
                      <option value="no">No</option>
                  </select>
                </td>
              </tr>
              <tr>
                <td></td>
                <td>Generate Pyramids?</td>
                <td>
                  <select onChange={ e=> { this.onToggle( 'spawn', 'pyramids', e ) }}>
                      <option value="yes">Yes</option>
                      <option value="no">No</option>
                  </select>
                </td>
              </tr>
              <tr>
                <td></td>
                <td>Generate Indra's Net?</td>
                <td>
                  <select onChange={ e=> { this.onToggle( 'spawn', 'nets', e) }}>
                      <option value="yes">Yes</option>
                      <option value="no">No</option>
                  </select>
                </td>
              </tr>
              <tr>
                <td>
                  <div style={styles.go}>
                    <input type="button"
                            value="Create"
                            style={styles.signInButton}
                            onClick={e=> { this.createWorld() } }
                    />
                  </div>
                </td>
                <td></td>
                <td></td>
              </tr>
              </tbody>
            </table>
          </div>
        </Shell>
    )
  }
}

NewWorld.defaultProps = {
}

import { connect } from 'react-redux'
import { createWorld } from '../../redux/actions/world-actions'
import { uploadFile } from '../../redux/actions/file-actions'
export default connect(
  state => {
    return {
      tools: state.tools,
      users: state.users,
      loggedInUser: state.users.loggedIn,
      menuOpen: state.app.menuOpen,
      stereoMode: state.app.vrMode,
      uploading: state.files.upload.fetching
    }
  },
  dispatch => {
    return {
      createWorld: (data) => {
        dispatch(createWorld(data))
      },
      uploadFile: (file, username, dir) => {
        dispatch(uploadFile(file, username, dir))
      }
    }
  }
)(NewWorld)
