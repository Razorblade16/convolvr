import Entity from './entities/entity'
import Component from './components/component'

export default class Avatar {
    constructor (name, type, data) {
        var mesh = null, // new THREE.Object3D();
            entity = null,
            component = null,
            components = [],
            n = 2;

          component = {
              type: "structure",
              shape: "cylinder",
              color: 0xffffff,
              material: "plastic",
              size: {x: 1800, y: 1200, z: 1800},
              position: { x: 0, y: (n-1)*600, z: 0 },
              quaternion: false
          };
          components.push(component);
          component = {
              type: "structure",
              shape: "octahedron",
              color: 0xffffff,
              material: "wireframe",
              size: {x: 2800, y: 2800, z: 2800},
              position: { x: 0, y: (n-1)*600, z: 0 },
              quaternion: false
          };
          components.push(component);

        entity = new Entity(name, components, [{"avatar": true}]);
        entity.init(three.scene);

        this.entity = entity;
        this.mesh = entity.mesh;
        this.type = type;
        this.data = data;
    }
}
