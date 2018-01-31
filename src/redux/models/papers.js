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
export const INIT_MORE = 'INIT_MORE';
// ------------------------------------
// helpers
// ------------------------------------


//判断是否24小时内
function formatCount(posts){

    posts = posts.map((post) => {
        let publishTime = post.publish_time,
             nowDate = new Date(),
             diffHours = (nowDate.getTime() - publishTime) / 1000 / 3600;
        if (diffHours <= 24) {
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
export function initMore() {
    return {
        type: INIT_MORE,
        payload: {
            hasmore: true,
            hasmore_friend: true,
        }
    }
}

export function updatePapersList(normalizeData, lastkey = null, hasmore = null, hasmore_friend = null) {
    return {
        type: UPDATE_PAPERS_LIST,
        payload: {
            normalizeData: normalizeData,
            listLastkey: lastkey,
            hasmore,
            hasmore_friend,
        }
    }
}

export function replacePapersList(normalizeData, lastkey = null, hasmore = null, hasmore_friend = null) {
    return {
        type: REPLACE_PAPERS_LIST,
        payload: {
            normalizeData: normalizeData,
            listLastkey: lastkey,
            hasmore,
            hasmore_friend,
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

export const dispatchPaper = (feeds) => {
    return (dispatch, getState) => {
        let normalizeData = {
                result: []
            };
        if(feeds && feeds.length){
            normalizeData = normalize(feeds, arrayOf(postSchema));
            dispatch(updatePapersList(
                normalizeData,
            ));
        }
        return Promise.resolve();
    }
}


export const fetchFreindPaperList = (params, errorCallback, init) => {
    return (dispatch, getState) => {
        if(init) dispatch(initMore()); // 重置hasmore loading

        let state = getState(),
            papers = state.papers,
            oldAnswers = state.entities.answers,
            lastkey = init ? 0 : papers.listLastkey || 0,
            url = `/test/papers/${lastkey}`;
        return GET(url, params, 500)
            .then(function(res) {
                let feeds = res.feeds,
                    lastkey = res.last_key,
                    hasmore_friend = res.has_more,
                    answers = res.answers,
                    normalizeData = {
                        result: [],
                        entities: {},
                    },
                    posts;
                if(feeds && feeds.length){
                    posts = formatCount(feeds);
                    normalizeData = normalize(posts, arrayOf(postSchema));
                }
                normalizeData.entities.answers = updateObject(oldAnswers, res.answers); // 合并更新entities的answers
                if(init) {
                    dispatch(replacePapersList(
                        normalizeData,
                        lastkey,
                        null,
                        hasmore_friend,
                    ));
                } else {
                    dispatch(updatePapersList(
                        normalizeData,
                        lastkey,
                        null,
                        hasmore_friend,
                    ));
                }
            }).catch(function(err) {
                err = err.toString();
                errorCallback && errorCallback(err);
                console.error(err);
            });
    }
}

export const fetchPaperList = (errorCallback, init) => {
    return (dispatch, getState) => {
        if(init) dispatch(initMore()); // 重置hasmore loading

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
            }).catch(function(err) {
                err = err.toString();
                errorCallback && errorCallback(err);
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
            hasmore_friend = payload.hasmore_friend,
            newPapers = { list };
        // 忽略null
        (listLastkey !== null) && (newPapers.listLastkey = listLastkey);
        (hasmore !== null) && (newPapers.hasmore = hasmore);
        (hasmore_friend !== null) && (newPapers.hasmore_friend = hasmore_friend);

        return updateObject(papers, newPapers);
    },
    [REPLACE_PAPERS_LIST]: (papers, action) => {
        let payload = action.payload,
            normalizeData = payload.normalizeData,
            list = normalizeData.result,
            listLastkey = payload.listLastkey,
            hasmore = payload.hasmore,
            hasmore_friend = payload.hasmore_friend,
            newPapers = { list };
        // 忽略null
        (listLastkey !== null) && (newPapers.listLastkey = listLastkey);
        (hasmore !== null) && (newPapers.hasmore = hasmore);
        (hasmore_friend !== null) && (newPapers.hasmore_friend = hasmore_friend);

        return updateObject(papers, newPapers);
    },
    [INIT_MORE]: (papers, action) => {
        let newPapers = {
            hasmore: true,
            hasmore_friend: true,
        };

        return updateObject(papers, newPapers);
    },
}
// ------------------------------------
// Reducer
// ------------------------------------
export function papersReducer(papers = {
    list: [],
    listLastkey: 0,
    hasmore: true,
    hasmore_friend: true,
}, action) {
    const handler = ACTION_HANDLERS[action.type]

    return handler ? handler(papers, action) : papers
}
