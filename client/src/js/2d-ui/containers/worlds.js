import React, { Component } from 'react'
import { browserHistory } from 'react-router'
import Card from '../card'
import Shell from '../shell'

const styles = {
  worlds: {
    width: "100%",
    minWidth: "320px",
    margin: "auto"
  }
}

class Worlds extends Component {
  switchWorlds (name) {
    browserHistory.push("/world/"+name)
    window.location.href = window.location.href // workaround..
    // this.props.setCurrentWorld(name)
    // three.world.reload(name)
  }
  render() {
    return (
        <Shell className="worlds">
          <div style={styles.worlds}>
          {
            this.props.worlds.map((world, i) => {
              let thumb = ''
              if (world.sky.photosphere != '') {
                thumb = world.sky.photosphere.split("/")
                thumb.splice(thumb.length-1, 0, "thumbs")
                thumb = thumb.join("/")+'.jpg'
              }
              return (
                <Card clickHandler={(e, v) => {
                        this.switchWorlds(world.name)
                      }}
                      color={`#${(world.light.color).toString(16)}`}
                      image={world.sky.photosphere != '' ? `/data/${thumb}` : ""}
                      showTitle={true}
                      title={world.name}
                      key={i}
                />
              )
            })
          }
          </div>
        </Shell>
    )
  }
}

Worlds.defaultProps = {

}
import { connect } from 'react-redux';
import {
    sendMessage
} from '../../redux/actions/message-actions'
import { fetchWorlds, setCurrentWorld } from '../../redux/actions/world-actions'

export default connect(
  (state, ownProps) => {
    return {
        worlds: state.worlds.all
    }
  },
  dispatch => {
    return {
      sendMessage: (message, from) => {
          dispatch(sendMessage(message, from))
      },
      setCurrentWorld: (world) => {
          dispatch(setCurrentWorld(world))
      }
    }
  }
)(Worlds)
