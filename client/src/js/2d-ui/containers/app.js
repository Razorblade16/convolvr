import React, { Component } from 'react'
import { browserHistory } from 'react-router'
import { events } from '../../network/socket'
import Shell from '../components/shell'
import Button from '../components/button'
import { vrAnimate } from '../../world/render'
import { detectWorldDetailsFromURL } from '../../redux/reducers/world'

class App extends Component {

  componentWillMount () {

    this.state = {
      unread: 0,
      lastSender: ''
    }
    this.props.fetchWorlds()

    events.on("chat message", message => {

      let chatMessage = JSON.parse( message.data ),
          chatUI = three.world.chat,
          chatText = chatUI.componentsByProp.text[ 0 ],
          worldName = '',
          from = ''

    	this.props.getMessage(chatMessage.message, chatMessage.from, chatMessage.files)

      if (this.state.lastSender != chatMessage.from || (chatMessage.files != null && chatMessage.files.length > 0)) {
        from = `${chatMessage.from}: `
      }

      this.setState({
        lastSender: chatMessage.from
      })

      this.notify(chatMessage.message, chatMessage.from)
      worldName = this.props.world == "overworld" ? "Convolvr" : this.props.world

      if (this.props.focus == false) {

        this.setState({
          unread: this.state.unread +1
        })

        if (this.state.unread > 0) {
            document.title = `[${this.state.unread}] ${worldName}`
        }

      } else {
        document.title = worldName
      }

      let worldMode = three.world.mode,
          worldUser = this.props.worldUser

      if (!this.props.menuOpen) {
        
        browserHistory.push("/chat")

        if (worldMode != 'vr' && worldMode != 'stereo') { // 3d ui will show the chat in vr without interrupting things
        
            this.props.toggleMenu()
        
        } else {
          setTimeout(()=>{

            browserHistory.push(`/${worldUser}/${worldName}`)
            this.props.toggleMenu()
          
          }, 3500)
        
        }

      }

    })

    this.props.fetchUniverseSettings()

    setTimeout( ()=> { console.log("world & worldUser ", world, worldUser )

      let world = three.world, 
          worldName = this.props.world,
          worldUser = this.props.worldUser
      
      let init3DUI = () => {

        let world = window.three.world,
            voxelKey = world.user.avatar.getVoxel().join("."),
            altitude = (world.terrain.voxels[ voxelKey ].data.altitude)

        world.chat.update( [ -80000, altitude, -5000 ] )
        world.help.update( [ -160000, altitude, -5000 ] )
        world.user.hud.update( [ 2500, altitude + 52000, 0 ], null )

        if (three.camera.position.y < altitude) {

          three.camera.position.y = (world.terrain.voxels[ voxelKey ].data.altitude) + 50000

        }

        three.world.user.velocity.y = -10000

      }

      world.load( worldUser, worldName, () => { /* systems online */ }, ()=> { /* terrain finished loading */

        console.log("init 3d UI / terrain loaded")
        init3DUI()

      })

    }, 100)

    setTimeout(()=>{
      this.props.getChatHistory(0) // wait a fraction of a second for the world to load / to show in 3d too
    }, 200)

    window.document.body.addEventListener("keydown", (e)=>this.handleKeyDown(e), true)

    let showMenuURLs = [ "chat", "login", "worlds", "files", "places", "settings", "network", "new-world" ]
    showMenuURLs.map( (menuUrl) => {

      window.location.pathname.indexOf(`/${menuUrl}`) > -1 && this.props.toggleMenu(true)

    })
    
    let rememberUser = localStorage.getItem("rememberUser"), // detect user credentials // refactor this...
        username = '',
        password = '',
        autoSignIn = false

    if (rememberUser != null) {

      username = localStorage.getItem("username")
      password = localStorage.getItem("password")

      if (username != null && username != '') {

        autoSignIn = true
        this.props.login(username, password, "", "")

      }
    }

    if (!autoSignIn && this.props.loggedIn == false && window.location.href.indexOf("/chat") >-1) {
      browserHistory.push("/login")
    }

    window.onblur = () => {
      this.props.setWindowFocus(false)
      three.world.windowFocus = false
    }

    window.onfocus = () => {
      this.props.setWindowFocus(true)
      three.world.windowFocus = true
      three.world.user.velocity.y = 0
      this.setState({
        unread: 0
      })
    }

    window.addEventListener('vrdisplayactivate', e => {

      console.log('Display activated.', e)
      //three.vrDisplay = e.display
      //this.initiateVRMode()
      if (three.world.mode != "stereo") {

        navigator.getVRDisplays().then( displays => { console.log("displays", displays)
				
          if ( displays.length > 0 ) {

            console.log("vrdisplayactivate: found display: ", displays[0])
            three.vrDisplay = displays[0]
            this.initiateVRMode()

          }
          
        })

      }
      

    })

    let renderCanvas = document.querySelector("#viewport")

    renderCanvas.onclick = (event) => {

      let elem = event.target,
          uInput = window.three.world.userInput

      if (!uInput.fullscreen) {

          three.world.mode = "3d"
						elem.requestPointerLock()
            this.props.toggleMenu(false)

      }

    }

  }

  componentWillUpdate ( nextProps, nextState ) {

    let newWorld = ["space", "overworld"],
        pathChange = nextProps.url.pathname.indexOf("/at") > -1 ? false : nextProps.url.pathname != this.props.url.pathname

    if ( pathChange ) {

      newWorld = detectWorldDetailsFromURL()
      
      if ( newWorld[ 2 ] == true ) { // not navigating to built in ui / page

          if ( newWorld[ 0 ] != nextProps.worldUser || newWorld[ 1 ] != nextProps.world ) {
          
          if (newWorld[ 1 ] != nextProps.world || newWorld[ 0 ] != nextProps.worldUser ) {

            three.world.reload ( newWorld[ 0 ], newWorld[ 1 ], "", [ 0, 0, 0 ], true ) // load new world (that's been switched to via browser history)

          }

        }

      }

    }

  }

  handleKeyDown (e) {

    if (e.which == 27) {
      this.props.toggleMenu(true)
    }
    if (e.which == 13) {
      if (!this.props.menuOpen) {
        this.props.toggleMenu(true);
        browserHistory.push("/chat")
      }
    }

  }

  goBack () {

    browserHistory.push(`/${this.props.worldUser}/${this.props.world}`)

  }

  notify (chatMessage, from) {

    function doNotification() {
      function onNotifyShow() {
          console.log('notification was shown!');
      }
      let Notify = window.Notify.default,
          myNotification = new Notify(`Message from ${from}`, {
          body: chatMessage,
          notifyShow: onNotifyShow
      });
      myNotification.show()
    }
    function onPermissionGranted() {
        console.log('Permission has been granted by the user');
        doNotification();
    }
    function onPermissionDenied() {
        console.warn('Permission has been denied by the user');
    }
    if (!Notify.needsPermission) {
        doNotification();
    } else if (Notify.isSupported()) {
        Notify.requestPermission(onPermissionGranted, onPermissionDenied);
    }

  }

  initiateVRMode ( ) {

    this.props.toggleVRMode()

    let renderer = three.renderer,
        ratio = window.devicePixelRatio || 1,
        camera = three.camera,
        scene = three.scene,
        world = three.world,
        controls = null,
        effect = null

        if (three.vrControls == null) {

          window.WebVRConfig = {
            MOUSE_KEYBOARD_CONTROLS_DISABLED: true,
            TOUCH_PANNER_DISABLED: true
          }
          controls = new THREE.VRControls(camera)

          if (!three.world.mobile) {
            renderer.autoClear = false
          }

          effect = new THREE.VREffect(renderer, world.postProcessing)
          effect.scale = 22000
          effect.setSize(window.innerWidth * ratio, window.innerHeight * ratio)
          three.vrEffect = effect
          three.vrControls = controls
          
          function onResize() {
            let ratio = window.devicePixelRatio || 1
            effect.setSize(window.innerWidth * ratio, window.innerHeight * ratio)
          }
          function onVRDisplayPresentChange() {
            console.log('onVRDisplayPresentChange')
            onResize()
          }
          // Resize the WebGL canvas when we resize and also when we change modes.
          window.addEventListener('resize', onResize);
          window.addEventListener('vrdisplaypresentchange', onVRDisplayPresentChange);
          console.log("vrDisplay", three.vrDisplay)
          if (three.vrDisplay != null) {
            three.vrDisplay.requestPresent([{source: renderer.domElement}]);
            
            if ( world.manualLensDistance != 0 && three.vrDisplay.dpdb_) {
              setTimeout(()=>{
                console.warn("Falling back to Convolvr lens distance settings: ", world.manualLensDistance)
                three.vrDisplay.deviceInfo_.viewer.interLensDistance = world.manualLensDistance || 0.057 
              
              }, 2000)
            }
            
            three.vrDisplay.requestAnimationFrame(()=> { // Request animation frame loop function
              vrAnimate(Date.now(), [0,0,0], 0)
            })
          } else {
            alert("Connect VR Display and then reload page.")
          }
         
      } else {
         if ( three.world.mode == "stereo" ) {
          window.location.href = window.location.href
        }
      }

      this.props.toggleVRMode()
      three.world.mode = three.world.mode != "stereo" ? "stereo" : "web"
      three.world.onWindowResize()

     

  }

  renderVRButtons () {

    return this.props.stereoMode ?
        [<Button title="Reset Pose"
                id="reset-pose"
                style={{
                  position: 'fixed',
                  right: '10vh',
                  bottom: 0
                }}
                key='1'
                image="/data/images/x.png"
                onClick={ (evt, title) => {

                } }
        />,
        <Button title="Exit VR"
                style={{
                  position: "fixed",
                  right: 0,
                  top: 0
                }}
                key='2'
                image="/data/images/x.png"
                onClick={ (evt, title) => {
                    this.props.toggleVRMode();
                } }
        />]
       : <Button title="Enter VR"
                  style={{
                      position: "fixed",
                      right:0,
                      bottom: 0,
                      zIndex: 9999,
                      background: 'none'
                  }}
                  image="/data/images/vr.png"
                  onClick={ (evt, title) => {
                    this.initiateVRMode()
                  }
                }
            />

  }

  render() {

    return (
        <div className="root">
         <Shell noBackground={true}
                hasMenu={true}
                menuOnly={true}
                menuOpen={this.props.menuOpen} ></Shell>
         { this.renderVRButtons() }
         <Button title="Close Menu"
                 image="/data/images/x.png"
                 style={{
                     position: "fixed",
                     right:0,
                     top: 0,
                     zIndex: 9999999,
                     background: 'transparent',
                     display: !this.props.menuOpen ? "none" : "inline-block"
                 }}
                 onClick={ (evt, title) => {
                     this.props.toggleMenu(false)
                     this.goBack()
                     //browserHistory.push("/menu")
                 } }
                 key={2}
         />
            {this.props.children}
            <div className="lightbox" style={{display: "none"}}></div>
            <canvas id="webcam-canvas"></canvas>
            <video id='local-video' style={{display:'none'}}></video>
            <video id='remote-video' style={{display:'none'}}></video>
            <input type='button' value='Video Call' style={{display:'none'}} id='videoCallButton' />
            <input type='button' value='End Call' style={{display:'none'}} id='endCallButton' />
        </div>
    )
  }

}

App.defaultProps = {

}

import { connect } from 'react-redux'
import {
  toggleMenu,
  toggleVR,
  setWindowFocus,
  showChat
} from '../../redux/actions/app-actions'
import {
  fetchWorlds,
  setCurrentWorld,
  fetchUniverseSettings
} from '../../redux/actions/world-actions'
import {
  getChatHistory,
  getMessage
} from '../../redux/actions/message-actions'
import { 
  fetchUsers,
  login 
} from '../../redux/actions/user-actions'

export default connect(
  state => {
    return {
      loggedIn: state.users.loggedIn,
      url: state.routing.locationBeforeTransitions,
      tools: state.tools,
      users: state.users,
      menuOpen: state.app.menuOpen,
      stereoMode: state.app.vrMode,
      focus: state.app.windowFocus,
      world: state.worlds.current,
      worldUser: state.worlds.currentWorldUser
    }
  },
  dispatch => {
    return {
      fetchUniverseSettings: ()=> {
        dispatch(fetchUniverseSettings())
      },
      login: (user, pass, email, data) => {
            dispatch(login(user, pass, email, data))
      },
      getMessage: (message, from, files) => {
          dispatch(getMessage(message, from, files))
      },
      showChat: () => {
        dispatch(showChat())
      },
      getChatHistory: (skip) => {
        dispatch(getChatHistory(skip))
      },
      toggleMenu: (force) => {
          //window.three.world.mode = force ? "3d" : "web"
          dispatch(toggleMenu(force))
      },
      fetchWorlds: () => {
          dispatch(fetchWorlds())
      },
      setCurrentWorld: (world) => {
        dispatch(setCurrentWorld(world))
      },
      setWindowFocus: (t) => {
        dispatch(setWindowFocus(t))
      },
      toggleVRMode: () => {
          dispatch(toggleVR())
      }
    }
  }
)(App)
