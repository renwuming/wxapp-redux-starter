import { Provider } from './vendors/weapp-redux.js';
import { sizeof } from './libs/utils.js';

import { fetchUserInfo, fetchSessionid } from './redux/models/user.js';

import { store } from './redux/store.js';

// let p = getCurrentPage();

let appConfig = {
    onLaunch: function() {
    },
    onShow: function() {
    },
    onHide: function() {
        let state = store.getState(),
            cacheEntities = {};

        // 体积大于2M，直接清空
        if (sizeof(state.entities) <= 2 * 1024 * 1024) {
            cacheEntities = state.entities;
        }

        wx.setStorageSync('entities', cacheEntities);
    }
};



App(Provider(store)(appConfig))
