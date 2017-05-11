import Entity from '../entity'

export default class FactorySystem {

    constructor (world) {

        this.world = world

    }

    init (component) { 

        let prop = component.props.factory
        // render _something_ to indicate that it's a factory.. maybe 
        
        if (prop.autoGenerate !== false) {
            
            console.log("generate!!", prop)
            this.generate(component)

        }

        return {

            generate: () => {

                this.generate(component)

            }

        }

    }

    generate (component) {

        let prop = component.props.factory,
            position = component.entity.position,
            type = prop.type,
            propName = prop.propName,
            data = prop.data,
            quat = data.quaternion,
            components = data.components,
            created = null
            

        if ( type == 'entity' ) {
 
            created = new Entity(-1, components, position.toArray(), quat)

        } else if (type == 'component') {
            
            created = new Entity(-1, [data], position.toArray(), quat)

        } else if ( type == 'prop' ) {

            switch (propName) {

                case "geometry":
                    created = new Entity(-1, [Object.assign({}, {geometry: data}, {
                        mixin: true,
                        material: {
                            name: "wireframe",
                            color: 0xffffff
                        }
                    })], position.toArray(), quat)
                break
                case "material":
                    created = new Entity(-1, [Object.assign({}, {material: data}, {
                        mixin: true,
                        geometry: {
                            shape: "sphere",
                            size: [4500, 4500, 4500]
                        }
                    })], position.toArray(), quat)
                break
                case "systems":

                    created = new Entity(-1, [Object.assign({}, data, {
                        mixin: true,
                        material: {
                            name: "wireframe",
                            color: 0xffffff
                        },
                        geometry: {
                            shape: "sphere",
                            size: [4500, 4500, 4500]
                        }
                    })], position.toArray(), quat)
                break

            }
        }

        created.init(window.three.scene)
        created.mesh.translateZ(-10000)
        created.update(created.mesh.position.toArray())

    }
}

