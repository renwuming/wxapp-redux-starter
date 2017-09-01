import Promise from '../../vendors/es6-promise.js';

import { equalObject, Encrypt } from '../../libs/utils.js';
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
             url = `/user/userinfo`,
             defaultUserInfo = {
               nickName: "神秘人",
               gender: 2,
               language: "isDefault",
               city: "",
               province: "",
               country: "",
               avatarUrl: "http://www.renwuming.xyz/wumingstore/img/portrait.jpg",
             };

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
                    POST(url, {
                      sessionid,
                      userInfo
                    });
                },
                fail: (err) => {
                    if(!oldUserInfo) {
                        GET(url, { sessionid }).then(res => {
                            oldUserInfo = res.userInfo || defaultUserInfo;
                            let normalizeData = {
                                entities: {
                                  userInfo: oldUserInfo
                                }
                            };
                            dispatch(updateUserInfo(
                                normalizeData
                            ));
                            resolve();
                            // 若服务端无数据，则上传defaultUserInfo
                            if(!res.userInfo) {
                                POST(url, {
                                  sessionid,
                                  userInfo: oldUserInfo
                                });
                            }
                        });
                    }
                }
            });
        });
    }
}

export const fetchUserInfoUpdate = (userInfo) => {
    return (dispatch, getState) => {
        let oldUserInfo = getState().entities.userInfo,
            sessionid = getState().entities.sessionid,
            url = `/user/userinfo`,
            normalizeData = {
            entities: {
              userInfo
            }
        };
        dispatch(updateUserInfo(
            normalizeData
        ));
        if(!equalObject(oldUserInfo, userInfo)) {
            POST(url, {
              sessionid,
              userInfo
            });
        }
    }
};

export const fetchSessionid = (errorCallback) => {
    return (dispatch, getState) => {
        let sessionid = getState().entities.sessionid,
             url = `/sessionid/validate`;

        return new Promise((resolve, reject) => {
            wx.checkSession({
                success: () => {
                  if(!sessionid) getSessionId(resolve, errorCallback, dispatch);
                  else POST(url, { sessionid })
                    .then(res => {
                        if(res.success) resolve();
                        else {
                            getSessionId(resolve, errorCallback, dispatch);
                        }
                    });
                },
                fail: () => {
                  getSessionId(resolve, errorCallback, dispatch);
                }
            });
        });
    }
}

let getSessionId = (R, errorCallback, dispatch) => {
    let url = `/sessionkey`;
    return new Promise(() => {
        wx.login({
            complete: function (res) {
                let code = res.code;
                if (code) {
                    POST(url, {
                        js_code: code
                    }).then(res => {
                        // 获取sessionkey
                        let normalizeData = {
                            entities: {
                                sessionid: res,
                                aesSessionid: Encrypt(res)
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
