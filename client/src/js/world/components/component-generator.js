export default class ComponentGenerator {
  constructor () {
    this.components = []
    this.init()
  }
  makeComponent (type) {
    return this.components[type]
  }
  init () {
    this.components["panel"] = {
      props: {
        structure: true
      },
      shape: "box",
      size: [16000, 16000, 1000],
      color: 0x404040,
      material: "plastic",
      text: "",
      quaternion: null,
      position: [0, 0, 0]
    }
    this.components["block"] = {
      props: {
        structure: true
      },
      shape: "box",
      size: [6000, 6000, 6000],
      color: 0xff0000,
      material: "plastic",
      text: "",
      quaternion: null,
      position: [0, 0, 0]
    }
    this.components["column"] = {
        props: {
          structure: true
        },
        shape: "box",
        size: [3000, 48000, 3000],
        material: "plastic",
        color: 0xffffff,
        text: "",
        quaternion: null,
        position: [0, 0, 0]
    }
    this.components["wirebox"] = {
      props: {
        structure: true
      },
      shape: "box",
      size: [10000, 10000, 10000],
      material: "wireframe",
      color: 0xff00ff,
      text: "",
      quaternion: null,
      position: [0, 0, 0]
    }
  }
}
