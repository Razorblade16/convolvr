console.log('Convolvr Client Initializing')
// React
import ReactDOM from 'react-dom'
import React, { Component, PropTypes } from 'react'
import { Router, Route, IndexRoute, browserHistory } from 'react-router'
import { syncHistoryWithStore, routerReducer } from 'react-router-redux'
// Redux
import { render } from 'react-dom'
import { Provider } from 'react-redux'
import { createStore } from 'redux'
import makeStore from './redux/makeStore'
let store = makeStore(routerReducer)
const history = syncHistoryWithStore(browserHistory, store)
// 2d UI
import App from './containers/app'
import Editor from './containers/editor'
import Memory from './containers/memory'
import Worlds from './containers/worlds'
import Settings from './containers/settings'
import Home from './containers/home'
import Login from './containers/login'
import Chat from './containers/chat'
import HUD from './containers/hud'
// World
import { send, events } from './network/socket'
import UserInput from './input/user-input.js'
import Toolbox from './world/tools/toolbox.js'
import World from './world/world.js'
// 3D UI
import HUDMenu from './world/hud/menu'
import Cursor from './world/hud/cursor'
import Avatar from './world/avatar.js'
// Material UI
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import getMuiTheme from 'material-ui/styles/getMuiTheme'
import { indigo500, indigo600, amber800, amber500 } from 'material-ui/styles/colors'
import io from 'socket.io-client'

let socket = events,
    token = localStorage.getItem("token"),
		userInput,
		user = {
				id: Math.random(),
				arms: [],
				hud: null,
				cursor: null,
				name: "Human",
				toolbox: null,
				mesh: new THREE.Object3D(),
				velocity: new THREE.Vector3(0, -10, 0),
				light: new THREE.PointLight(0xffffff, 0.25, 300000),
				gravity: 1,
				falling: false
		},
    worldConfig = {
      name: "Convolvr",
      sky: {
        type: "gradient",
        color: 0x3500ff,
        layers: [
          {
            movement: [1, 1],
            opacity: 1,
            altitude: 800000,
            texture: "clouds",
            customTexture: ""
          }
        ]
      },
      light: {
        color: 0xffffff,
        intensity: 1.0,
        angle: 0.5,
        ambientColor: 0x000000
      },
      terrain: {
        type: "both", // none, platforms, plane, both
        height: 2,
        color: 0x404040,
        flatness: 0.5,
        decorations: "misc"
      },
      spawn: {
        entities: true,
        structures: true,
        npcs: true,
        tools: true,
        vehicles: true
      }
  },
	world = null,
	avatar = null

userInput = new UserInput()
world = new World(worldConfig, userInput, socket, store)
user.toolbox = new Toolbox(world)
user.hud = new HUDMenu([], user.toolbox)
user.hud.initMesh({}, user)
user.hud.hide()
user.cursor = new Cursor({}, user)
user.mesh.add(user.light)
world.user = user
three.scene.add(user.mesh)

userInput.init(world, world.camera, user)
userInput.rotationVector = {x: 0, y: 9.95, z: 0}
three.camera.position.set(100000, 20000, 100000)
user.light.position.set(100000, 20000, 100000)

socket.on("chat message", message => {
	console.log(message)
})

const muiTheme = getMuiTheme({
      palette: {
          primary1Color: indigo500,
          primary2Color: indigo600,
          accent1Color: amber800,
          accent2Color: amber500,
      },
      appBar: {
        height: 50,
      }
    })

ReactDOM.render(
  (<Provider store={store}>
    <MuiThemeProvider muiTheme={muiTheme}>
		<Router history={history}>
	  		<Route path="/" component={App} >
				<IndexRoute component={HUD}/>
				<Route path="/login" component={Login} />
				<Route path="/home" component={Home} />
				<Route path="/chat" component={Chat} />
				<Route path="/editor" component={Editor} />
				<Route path="/memory" component={Memory} />
				<Route path="/worlds" component={Worlds} />
				<Route path="/settings" component={Settings} />
			</Route>
		</Router>
    </MuiThemeProvider>
  </Provider>),
  document.getElementsByTagName('main')[0]
)
