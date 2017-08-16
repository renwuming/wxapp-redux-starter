import Promise from '../vendors/es6-promise.js';
import { getAPIDomain } from './utils.js';

function request(method = 'GET') {
    return function(url, data = {}, delay = null) {
        let __request = new Promise(function(resolve, reject) {
            wx.request({
                url: getAPIDomain() + url,
                data,
                method,
                header: {
                    'Content-Type': 'application/json'
                },
                success: function(res) {
                    let statusCode = res.statusCode,
                        errMsg = res.errMsg,
                        data = res.data;

                    if (statusCode == 200) {
                        resolve(data);
                    } else {
                        reject('网路请求错误，请稍后再试~');
                    }
                },
                fail: function(err) {
                    reject('网路请求不符合规范，请检查域名是否符合要求~');
                }
            });
        });
        if(!delay) return __request;
        else {
            return Promise.all([__request, sleep(delay)]).then(res => res[0]);
        }
    }
}

function sleep(delay) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve();
        }, delay);
    });
}

export const GET = request('GET');
export const POST = request('POST');
export const PUT = request('PUT');
export const DELETE = request('DELETE');
