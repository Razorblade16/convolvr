import axios from 'axios'

export default class RESTSystem {

    constructor (world) {

        this.world = world

    }

    init (component) { 

        let prop = component.props.rest, // specify url, method, etc
            rest = this

        let getCallback = (response, component) => {

                component.state.rest.getResponse = response

                if ( !!component.props.text ) {

                    component.props.text.lines = JSON.stringify(response.data).match(/(.|[\r\n]){1,42}/g)
                    component.state.text.update()

                }

            },
            getError =  ( error, component ) => {

                component.state.rest.getError = error

            },
            postCallback = (response, component) => {

                component.state.rest.postResponse = response

            },
            postError =  ( error, component ) => {

                component.state.rest.postError = error

            }


        if ( prop.get ) {

            this.getRequest( component, prop.get.url, getCallback, getError )

        }

        if ( prop.post ) {

            this.postRequest( component, prop.post.url, prop.post.data )

        }

        // add init logic... // other systems can call these methods too*

        return {

            getResponse: false,
            postResponse: false,
            getRequest: ( url ) => {

                rest.getRequest( component, url, getCallback, getError )

            },
            postRequest: ( url, data ) => {

                rest.postRequest( component, url, data, postCallback, postError )

            }

        }

    }

    getRequest ( component, url, callback, onError ) {

        console.log("getRequest", callback, onError )

        axios.get(url).then( res => {

            callback ( res, component )

        }).catch( err => {
          
           onError ( err, component )

        });

    }

    postRequest ( component, url, data, callback, onError ) {

        axios.post(url, data).then( res => {

           callback( res, component )

        }).catch( err => {

           onError( err, component )

        });

    }
}

