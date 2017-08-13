import Promise from '../../vendors/es6-promise.js';

import { getAPIDomain, equalObject } from '../../libs/utils.js';
import { GET, POST } from '../../libs/request.js';


// ------------------------------------
// Constants
// ------------------------------------
export const UPDATE_USERINFO = 'UPDATE_USERINFO';
export const UPDATE_SESSIONID = 'UPDATE_SESSIONID';



// ------------------------------------
// Actions
// ------------------------------------
export function updateUserInfo(normalizeData) {

    return {
        type: UPDATE_USERINFO,
        payload: {
            normalizeData: normalizeData
        }
    }
}
export function updateSessionid(normalizeData) {

    return {
        type: UPDATE_SESSIONID,
        payload: {
            normalizeData: normalizeData
        }
    }
}



export const fetchUserInfo = (errorCallback) => {
    return (dispatch, getState) => {
        let oldUserInfo = getState().entities.userInfo,
             sessionid = getState().entities.sessionid,
             url = `${getAPIDomain()}/user/userinfo`,
             url2 = `${getAPIDomain()}/user/userinfo`;

        return new Promise((resolve, reject) => {
            wx.getUserInfo({
                success: (res) => {
                    const userInfo = res.userInfo;
                    if(equalObject(oldUserInfo, userInfo)) return;
                    let normalizeData = {
                        entities: {
                            userInfo
                        }
                    };
                    dispatch(updateUserInfo(
                        normalizeData
                    ));
                    resolve();
                    // 将userInfo上传到服务器
                    if(sessionid) {
                        POST(url2, {
                          sessionid,
                          userInfo
                        });
                    }
                },
                fail: (err) => {
                    errorCallback && errorCallback(err.errMsg);
                    reject(err);
                }
            });
        });
    }
}

export const fetchSessionid = (errorCallback) => {
    return (dispatch, getState) => {
        let sessionid = getState().entities.sessionid;

        return new Promise((resolve, reject) => {
            wx.checkSession({
                success: () => {
                  if(!sessionid) getSessionId(resolve, errorCallback, dispatch);
                  else resolve();
                },
                fail: () => {
                  getSessionId(resolve, errorCallback, dispatch);
                }
            });
        });
    }
}

let getSessionId = (R, errorCallback, dispatch) => {
    let url = `${getAPIDomain()}/sessionkey`;
    return new Promise(() => {
        wx.login({
            complete: function (res) {
                if (res.code) {
                    POST(url, {
                        js_code: res.code
                    }).then(res => {
                        // 获取sessionkey
                        let normalizeData = {
                            entities: {
                                sessionid: res
                            }
                        };
                        dispatch(updateSessionid(
                            normalizeData
                        ));
                        R();
                    }, function(err){
                        errorCallback && errorCallback(err);
                    });
                } else {
                    errorCallback && errorCallback(res.errMsg);
                };
            }
        });
    });
}


// ------------------------------------
// Action Handlers
// ------------------------------------
const ACTION_HANDLERS = {
    [UPDATE_USERINFO]: (user, action) => {
        let payload = action.payload,
            normalizeData = payload.normalizeData;

        return {};
    },
    [UPDATE_SESSIONID]: (user, action) => {
        let payload = action.payload,
            normalizeData = payload.normalizeData;

        return {};
    }
}

// ------------------------------------
// Reducer
// ------------------------------------
export function userReducer(user = {}, action) {
    const handler = ACTION_HANDLERS[action.type]

    return handler ? handler(user, action) : user
}
