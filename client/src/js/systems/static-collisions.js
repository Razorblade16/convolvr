export default class StaticCollisions {

	constructor( world ) {

		this.worker = null
		let worker = new Worker('/data/js/workers/static-collisions.js')

	      worker.onmessage = function ( event ) {

	        let message = JSON.parse(event.data),
	          	vrFrame = world.vrFrame,
				vrHeight = 0,
	          	cam = three.camera,
	          	user = world.user,
	          	position = [],
	          	velocity = []

			if (vrFrame != null && vrFrame.pose != null && vrFrame.pose.position != null) {

				vrHeight = 22000 * vrFrame.pose.position[1]
				world.vrHeight = vrHeight

			}

	    if ( message.command == "update" ) {

	          worker.postMessage('{"command":"update","data":{"position":['+cam.position.x+
	          ', '+cam.position.y+
	          ', '+cam.position.z+
	          '],"velocity":['+user.velocity.x+
	          ','+user.velocity.y+
	          ','+user.velocity.z+
						'],"vrHeight":'+vrHeight+'}}');

		  } else if ( message.command == "collision" ) { // not implemented

	          console.log("collision");
	          console.log(message.data);

		  } else if ( message.command == "platform collision" ) { // consider sending "top" or "bottom" collision type

	      if ( message.data.type == "top" ) {

				three.camera.position.set( three.camera.position.x, message.data.position[1]+470000 +vrHeight, three.camera.position.z )

				if ( Math.abs( user.velocity.y ) > 350000 ) {

					user.velocity.y *= -0.56
					user.falling = true

				} else {

					user.falling = false
					user.velocity.y = 0

				}

			} else if ( message.data.type == "bottom" ) {

				three.camera.position.set( three.camera.position.x, message.data.position[1]-85000 +vrHeight, three.camera.position.z )
				user.velocity.y *= -0.45
			}

			user.velocity.x *= 0.98
			user.velocity.z *= 0.98
			user.falling = false

			} else if ( message.command == "floor collision" ) { console.log("floor collision", message.data.position, message.data)
				// 
				three.camera.position.set(three.camera.position.x, message.data.position[1]+vrHeight, three.camera.position.z)

				if ( Math.abs(user.velocity.y) > 250000 ) {

					ser.velocity.y *= 0.55
					user.velocity.x *= 0.96
					user.velocity.z *= 0.96
					user.falling = true

				} else {

					user.falling = false
					user.velocity.y = 0

				}

			} else if ( message.command == "load entities" ) {
				
				world.generateFullLOD(message.data.coords)

			} else {

				console.log(message.data)

			}

		}

	    worker.postMessage('{"command":"start","data":""}')
		this.worker = worker
	}

	init ( component ) {
		
		return {

		}

	}

}