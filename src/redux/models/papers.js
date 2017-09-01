import Promise from '../../vendors/es6-promise.js';
import { normalize, arrayOf } from '../../vendors/normalizr.min.js';

import { updateObject, VALID_TIME } from '../../libs/utils.js';
import { GET, POST } from '../../libs/request.js';

import { postSchema } from '../schema.js';

// ------------------------------------
// Constants
// ------------------------------------
export const UPDATE_PAPERS_LIST = 'UPDATE_PAPERS_LIST';
export const REPLACE_PAPERS_LIST = 'REPLACE_PAPERS_LIST';
// ------------------------------------
// helpers
// ------------------------------------


//判断是今天的，还是昨天的
function formatCount(posts){

    posts = posts.map((post) => {
        let publishTime = post.publish_time,
             nowDate = new Date(),
             diffHours = (nowDate.getTime() - publishTime) / 1000 / 3600;

        if (diffHours <= nowDate.getHours()) {
            post.today = true;
        } else {
            post.today = false;
        }

        return post;
    });

    return posts;
}

// ------------------------------------
// Actions
// ------------------------------------
export function updatePapersList(normalizeData, lastkey = null, hasmore = null) {
    return {
        type: UPDATE_PAPERS_LIST,
        payload: {
            normalizeData: normalizeData,
            listLastkey: lastkey,
            hasmore
        }
    }
}

export function replacePapersList(normalizeData, lastkey = null, hasmore = null) {
    return {
        type: REPLACE_PAPERS_LIST,
        payload: {
            normalizeData: normalizeData,
            listLastkey: lastkey,
            hasmore
        }
    }
}

function updateValidate(data) {
    if(!data) return true;
    return (+new Date() - data.publish_time) > VALID_TIME;
}

// ------------------------------------
// Async Actions
// ------------------------------------
export const fetchPaper = (id, errorCallback) => {
    return (dispatch, getState) => {
        let papers = getState().papers,
             entities = getState().entities,
             oldPaper = entities.posts && entities.posts[id],
             url = `/test/paper/${id}`;

        if(!updateValidate(oldPaper)) return Promise.resolve();
        return GET(url, {}, 500)
            .then(function(res) {
                let feeds = res.feeds,
                    posts, normalizeData;

                if(feeds && feeds.length){
                    posts = formatCount(feeds);

                    normalizeData = normalize(posts, arrayOf(postSchema));

                    dispatch(updatePapersList(
                        normalizeData
                    ));
                }
            }, function(err){
                errorCallback && errorCallback(err);
            }).catch(function(err) {
                errorCallback && errorCallback();
                console.error(err);
            });
    }
}

export const fetchPaperList = (errorCallback, init) => {
    return (dispatch, getState) => {
        let papers = getState().papers,
             lastkey = init ? 0 : papers.listLastkey || 0,
             url = `/test/papers/${lastkey}`;

        return GET(url, {}, 500)
            .then(function(res) {
                let feeds = res.feeds,
                    lastkey = res.last_key,
                    hasmore = res.has_more,
                    normalizeData = {
                        result: []
                    },
                    posts;

                if(feeds && feeds.length){
                    posts = formatCount(feeds);

                    normalizeData = normalize(posts, arrayOf(postSchema));
                }
                if(init) {
                    dispatch(replacePapersList(
                        normalizeData,
                        lastkey,
                        hasmore
                    ));
                } else {
                    dispatch(updatePapersList(
                        normalizeData,
                        lastkey,
                        hasmore
                    ));
                }
            }, function(err){
                errorCallback && errorCallback(err);
            }).catch(function(err) {
                errorCallback && errorCallback();
                console.error(err);
            });
    }
}

// ------------------------------------
// Action Handlers
// ------------------------------------
const ACTION_HANDLERS = {
    [UPDATE_PAPERS_LIST]: (papers, action) => {
        let payload = action.payload,
            normalizeData = payload.normalizeData,
            list = papers.list.concat(normalizeData.result),
            listLastkey = payload.listLastkey,
            hasmore = payload.hasmore,
            newPapers = { list };
        // 忽略null
        (listLastkey !== null) && (newPapers.listLastkey = listLastkey);
        (hasmore !== null) && (newPapers.hasmore = hasmore);

        return updateObject(papers, newPapers);
    },
    [REPLACE_PAPERS_LIST]: (papers, action) => {
        let payload = action.payload,
            normalizeData = payload.normalizeData,
            list = normalizeData.result,
            listLastkey = payload.listLastkey,
            hasmore = payload.hasmore,
            newPapers = { list };
        // 忽略null
        (listLastkey !== null) && (newPapers.listLastkey = listLastkey);
        (hasmore !== null) && (newPapers.hasmore = hasmore);

        return updateObject(papers, newPapers);
    },
}
// ------------------------------------
// Reducer
// ------------------------------------
export function papersReducer(papers = {
    list: [],
    listLastkey: 0,
    hasmore: true
}, action) {
    const handler = ACTION_HANDLERS[action.type]

    return handler ? handler(papers, action) : papers
}
