/* structure actions */
import {
    USER_ADD,
    USER_CONNECT,
    USER_DISCONNECT,
    USERS_FETCH,
    USERS_FETCH_DONE,
    USERS_FETCH_FAIL,
    UPDATE_USER,
    DELETE_USER,
    LOGIN_FETCH,
    LOGIN_DONE,
    LOGIN_FAIL
} from '../constants/action-types';
import axios from 'axios';
import { API_SERVER } from '../../config.js'

export function addUser () {
    return {
        type: USER_ADD
    }
}
export function userConnect (id) {
    return {
        type: USER_CONNECT,
        id: id
    }
}
export function userDisconnect (id) {
    return {
        type: USER_DISCONNECT,
        id
    }
}
export function fetchUsers (id) {
    return dispatch => {
     dispatch({
         type: USERS_FETCH,
         id: id
     })
     return axios.get(API_SERVER+"/api/users/"+id)
        .then(response => {
            dispatch(receiveUsers(response))
        }).catch(response => {
            dispatch(failedFetchUsers(response))
        });
   }
}
export function receiveUsers (users) {
    return {
        type: USERS_FETCH_DONE,
        users: users
    }
}
export function failedFetchUsers (err) {
    return {
        type: USERS_FETCH_FAIL,
        err: err
    }
}
export function updateUser (id, data) {
    return {
        type: UPDATE_USER,
        data: data,
        id: id
    }
}
export function deleteUser (id) {
    return {
        type: DELETE_USER
    }
}


export function login (user, pass, email, data) {
    return dispatch => {
         dispatch({
             type: LOGIN_FETCH
         })
         return axios.post(API_SERVER+"/api/users", {
             id: 0,
             name: user,
             password: pass,
             email: email,
             data: data
         })
         .then(response => {
             dispatch(loginDone(response))
          }).catch(response => {
              dispatch(loginFailed(response))
        });
   }
}

export function loginDone (response) {
    let data = response.data,
        worldUser = three.world.user
    worldUser.name = data.name
    worldUser.email = data.email
    worldUser.id = data.id
    return {
        type: LOGIN_DONE,
        data: response.data
    }
}
export function loginFailed (response) {
    return {
        type: LOGIN_FAIL,
        data: response.data
    }
}
